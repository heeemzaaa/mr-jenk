package com.ecommerce.productservice.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.ecommerce.productservice.clients.MediaServiceGateway;
import com.ecommerce.productservice.dtos.request.ProductRequest;
import com.ecommerce.productservice.exceptions.custom.ForbiddenException;
import com.ecommerce.productservice.exceptions.custom.ResourceNotFoundException;
import com.ecommerce.productservice.models.Product;
import com.ecommerce.productservice.repositories.ProductRepository;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

  @Mock
  private ProductRepository productRepository;

  @Mock
  private MediaServiceGateway mediaServiceGateway;

  private ProductService productService;

  private static final String SELLER_ID = "seller-123";
  private static final String OTHER_SELLER_ID = "seller-456";
  private static final String PRODUCT_ID = "product-abc";

  @BeforeEach
  void setUp() {
    productService = new ProductService(productRepository, mediaServiceGateway);
  }

  // --- create ---

  @Test
  void create_setsSellerIdFromParam_notFromRequestBody() {
    ProductRequest request = new ProductRequest(
        "Keyboard", "Mechanical", BigDecimal.TEN, 5, List.of("http://img/1.png"));

    when(productRepository.save(any(Product.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    productService.create(request, SELLER_ID);

    ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
    verify(productRepository).save(captor.capture());
    assertThat(captor.getValue().getUserId()).isEqualTo(SELLER_ID);
  }

  @Test
  void create_ignoresRequestImageUrls_responseHasNoImages() {
    List<String> urls = List.of("http://img/1.png", "http://img/2.png");
    ProductRequest request = new ProductRequest("Monitor", "27in", BigDecimal.TEN, 2, urls);

    when(productRepository.save(any(Product.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    var result = productService.create(request, SELLER_ID);

    assertThat(result.imageUrls()).isEmpty();
    verifyNoInteractions(mediaServiceGateway);
  }

 
  @Test
  void updateProduct_ownerMatches_savesAndReturnsUpdatedFields() {
    Product existing = Product.builder()
        .id(PRODUCT_ID)
        .name("Old name")
        .description("Old desc")
        .price(BigDecimal.ONE)
        .quantity(1)
        .userId(SELLER_ID)
        .build();

    ProductRequest request = new ProductRequest(
        "New name", "New desc", BigDecimal.TEN, 5, List.of("http://img/new.png"));

    when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(existing));
    when(productRepository.save(any(Product.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(mediaServiceGateway.getImages(PRODUCT_ID)).thenReturn(List.of("http://img/live.png"));

    var result = productService.updateProduct(request, PRODUCT_ID, SELLER_ID);

    verify(productRepository).save(existing); // fails if the save() call is missing again
    assertThat(result.name()).isEqualTo("New name");
    assertThat(result.imageUrls()).containsExactly("http://img/live.png");
  }

  @Test
  void updateProduct_callerIsNotOwner_throwsForbiddenAndDoesNotSave() {
    Product existing = Product.builder()
        .id(PRODUCT_ID)
        .name("Name")
        .description("Desc")
        .price(BigDecimal.ONE)
        .quantity(1)
        .userId(SELLER_ID)
        .build();

    ProductRequest request = new ProductRequest("Hacked", "Desc", BigDecimal.ONE, 1, null);

    when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> productService.updateProduct(request, PRODUCT_ID, OTHER_SELLER_ID))
        .isInstanceOf(ForbiddenException.class);

    verify(productRepository, never()).save(any());
  }

  @Test
  void updateProduct_productDoesNotExist_throwsNotFound() {
    ProductRequest request = new ProductRequest("Name", "Desc", BigDecimal.ONE, 1, null);

    when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> productService.updateProduct(request, PRODUCT_ID, SELLER_ID))
        .isInstanceOf(ResourceNotFoundException.class);

    verify(productRepository, never()).save(any());
  }

  @Test
  void deleteProduct_ownerMatches_deletesProduct() {
    Product existing = Product.builder()
        .id(PRODUCT_ID)
        .userId(SELLER_ID)
        .build();

    when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(existing));

    productService.deleteProduct(PRODUCT_ID, SELLER_ID);

    verify(productRepository).delete(existing);
  }

  @Test
  void deleteProduct_callerIsNotOwner_throwsForbiddenAndDoesNotDelete() {
    Product existing = Product.builder()
        .id(PRODUCT_ID)
        .userId(SELLER_ID)
        .build();

    when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> productService.deleteProduct(PRODUCT_ID, OTHER_SELLER_ID))
        .isInstanceOf(ForbiddenException.class);

    verify(productRepository, never()).delete(any());
  }

  @Test
  void deleteProduct_productDoesNotExist_throwsNotFound() {
    when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> productService.deleteProduct(PRODUCT_ID, SELLER_ID))
        .isInstanceOf(ResourceNotFoundException.class);

    verify(productRepository, never()).delete(any());
  }

  // --- getProductById: live image enrichment ---

  @Test
  void getProductById_enrichesWithLiveImagesFromMediaService() {
    Product existing = Product.builder()
        .id(PRODUCT_ID)
        .name("Chair")
        .userId(SELLER_ID)
        .build();

    when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(existing));
    when(mediaServiceGateway.getImages(PRODUCT_ID)).thenReturn(List.of("live-1", "live-2"));

    var result = productService.getProductById(PRODUCT_ID);

    assertThat(result.imageUrls()).containsExactly("live-1", "live-2");
  }

  @Test
  void getProductById_productDoesNotExist_throwsNotFoundAndNeverCallsMediaService() {
    when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> productService.getProductById(PRODUCT_ID))
        .isInstanceOf(ResourceNotFoundException.class);

    verifyNoInteractions(mediaServiceGateway);
  }

  // --- getProducts: owner filter, pagination metadata, image enrichment ---

  @Test
  void getProducts_noOwner_callsFindAll_notFindByUserId() {
    Page<Product> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
    when(productRepository.findAll(any(Pageable.class))).thenReturn(page);

    productService.getProducts(null, 0, 20);

    verify(productRepository).findAll(any(Pageable.class));
    verify(productRepository, never()).findByUserId(any(), any());
  }

  @Test
  void getProducts_withOwner_callsFindByUserId_notFindAll() {
    Page<Product> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
    when(productRepository.findByUserId(eq(SELLER_ID), any(Pageable.class))).thenReturn(page);

    productService.getProducts(SELLER_ID, 0, 20);

    verify(productRepository).findByUserId(eq(SELLER_ID), any(Pageable.class));
    verify(productRepository, never()).findAll(any(Pageable.class));
  }

  @Test
  void getProducts_enrichesEachResultWithItsOwnImagesFromMediaService() {
    Product p1 = Product.builder().id("p1").userId(SELLER_ID).build();
    Product p2 = Product.builder().id("p2").userId(SELLER_ID).build();
    Page<Product> page = new PageImpl<>(List.of(p1, p2), PageRequest.of(0, 20), 2);

    when(productRepository.findAll(any(Pageable.class))).thenReturn(page);
    when(mediaServiceGateway.getImages("p1")).thenReturn(List.of("img-1"));
    when(mediaServiceGateway.getImages("p2")).thenReturn(List.of("img-2"));

    var result = productService.getProducts(null, 0, 20);

    assertThat(result.items()).hasSize(2);
    assertThat(result.items().get(0).imageUrls()).containsExactly("img-1");
    assertThat(result.items().get(1).imageUrls()).containsExactly("img-2");
  }

  @Test
  void getProducts_populatesPaginationMetadataFromPage() {
    Page<Product> page = new PageImpl<>(List.of(), PageRequest.of(2, 10), 45);
    when(productRepository.findAll(any(Pageable.class))).thenReturn(page);

    var result = productService.getProducts(null, 2, 10);

    assertThat(result.currentPage()).isEqualTo(2);
    assertThat(result.pageSize()).isEqualTo(10);
    assertThat(result.totalElements()).isEqualTo(45);
    assertThat(result.totalPages()).isEqualTo(5);
    assertThat(result.hasNext()).isTrue();
    assertThat(result.hasPrevious()).isTrue();
  }

  @Test
  void getProducts_limitAboveMax_isCappedAtMaxLimit() {
    Page<Product> page = new PageImpl<>(List.of(), PageRequest.of(0, 100), 0);
    when(productRepository.findAll(any(Pageable.class))).thenReturn(page);

    productService.getProducts(null, 0, 500);

    ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
    verify(productRepository).findAll(captor.capture());
    assertThat(captor.getValue().getPageSize()).isEqualTo(100); // MAX_LIMIT
  }

  @Test
  void getProducts_nullPageAndLimit_defaultToZeroAndDefaultLimit() {
    Page<Product> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
    when(productRepository.findAll(any(Pageable.class))).thenReturn(page);

    productService.getProducts(null, null, null);

    ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
    verify(productRepository).findAll(captor.capture());
    assertThat(captor.getValue().getPageNumber()).isEqualTo(0);
    assertThat(captor.getValue().getPageSize()).isEqualTo(20); // DEFAULT_LIMIT
  }
}