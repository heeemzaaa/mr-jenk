package com.ecommerce.mediaservice.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.mediaservice.common.ResponseData;
import com.ecommerce.mediaservice.dtos.DeleteMediaRequest;
import com.ecommerce.mediaservice.dtos.MediaRequest;
import com.ecommerce.mediaservice.dtos.TargetType;
import com.ecommerce.mediaservice.models.Media;
import com.ecommerce.mediaservice.exceptions.media.ImageNotDeletedException;
import com.ecommerce.mediaservice.exceptions.media.ImageNotFoundException;
import com.ecommerce.mediaservice.exceptions.media.ImageNullOrEmptyException;
import com.ecommerce.mediaservice.exceptions.media.MediaPersistenceException;
import com.ecommerce.mediaservice.exceptions.Product.MoreThanFiveImagesException;
import com.ecommerce.mediaservice.exceptions.profile.MoreThanOneImageException;
import com.ecommerce.mediaservice.repositories.MediaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MediaService {
    private final MediaRepository mediaRepository;
    private final MediaHelper mediaHelper;

    public ResponseData<List<String>> saveMedia(MediaRequest request, MultipartFile[] images) {
        if (images == null || images.length == 0) {
            throw new ImageNullOrEmptyException("At least one image is required !");
        }

        if (request.targetType().equals(TargetType.PRODUCT) && images.length > 5) {
            throw new MoreThanFiveImagesException("The maximum number of allowed images is 5 !");
        } else if (request.targetType().equals(TargetType.PROFILE) && images.length > 1) {
            throw new MoreThanOneImageException("You are allowed to send only one image !");
        }
        List<String> imagesPaths = new ArrayList<>();
        for (MultipartFile image : images) {
            mediaHelper.validateImage(image);
            String imageUrl = mediaHelper.uploadToCloudinary(image, request.targetType(), request.targetId());
            if (request.targetType().equals(TargetType.PRODUCT)) {
                Media media = Media.builder().imagePath(imageUrl).productId(request.targetId()).build();
                try {
                    mediaRepository.save(media);
                } catch (Exception ex) {
                    throw new MediaPersistenceException("Failed to save media to the database !", ex);
                }
            }
            imagesPaths.add(imageUrl);

        }
        return ResponseData.success("Media saved successfully !", imagesPaths);
    }

    public ResponseData<Map<String, List<String>>> getProductsMedias() {
        Map<String, List<String>> mediasByProduct = new HashMap<>();

        for (Media media : mediaRepository.findAll()) {
            if (media.getProductId() == null) {
                continue;
            }
            List<String> images = mediasByProduct.get(media.getProductId());
            if (images == null) {
                images = new ArrayList<>();
                mediasByProduct.put(media.getProductId(), images);
            }
            images.add(media.getImagePath());
        }

        return ResponseData.success("Products medias retrieved successfully !", mediasByProduct);
    }

    public ResponseData<List<String>> getMedias(String productId) {

        List<Media> medias = mediaRepository.findByProductId(productId).orElse(new ArrayList<>());

        List<String> imagesPaths = new ArrayList<>();
        for (Media m : medias) {
            imagesPaths.add(m.getImagePath());
        }
        return ResponseData.success("Product medias retrieved successfully !", imagesPaths);
    }

    public ResponseData<String> deleteMedias(String userId, DeleteMediaRequest request) {
        mediaHelper.checkOwnership(request.targetType(), request.targetId(), userId);

        for (String imagePath : request.imagePaths()) {
            Media media = null;
            if (request.targetType().equals(TargetType.PRODUCT)) {
                media = mediaRepository.findByImagePath(imagePath)
                        .orElseThrow(() -> new ImageNotFoundException("Image not found !"));
                if (!media.getProductId().equals(request.targetId())) {
                    throw new ImageNotFoundException("Image not found !");
                }
            } else {
                mediaHelper.verifyImageBelongsToTarget(imagePath, request.targetType(), request.targetId());
            }

            mediaHelper.deleteFromCloudinary(imagePath);

            if (media != null) {
                try {
                    mediaRepository.delete(media);
                } catch (Exception ex) {
                    throw new ImageNotDeletedException("This image is not deleted, please try again later !");
                }
            }
        }

        String folder = mediaHelper.getFolder(request.targetType(), request.targetId());
        mediaHelper.deleteFolderIfEmpty(folder);
        return ResponseData.success("Image(s) deleted successfully !", null);
    }

    public ResponseData<List<String>> updateMedias(String userId, MediaRequest request, MultipartFile[] images) {
        mediaHelper.checkOwnership(request.targetType(), request.targetId(), userId);

        if (images == null || images.length == 0) {
            throw new ImageNullOrEmptyException("At least one image is required !");
        }

        for (MultipartFile image : images) {
            mediaHelper.validateImage(image);
        }

        if (request.oldImagePaths() != null) {
            for (String oldImagePath : request.oldImagePaths()) {
                mediaHelper.verifyImageBelongsToTarget(oldImagePath, request.targetType(), request.targetId());
                if (request.targetType().equals(TargetType.PRODUCT)) {
                    Media media = mediaRepository.findByImagePath(oldImagePath)
                            .orElseThrow(() -> new ImageNotFoundException("Image not found !"));
                    if (!media.getProductId().equals(request.targetId())) {
                        throw new ImageNotFoundException("Image not found !");
                    }
                    mediaHelper.deleteFromCloudinary(oldImagePath);
                    try {
                        mediaRepository.delete(media);
                    } catch (Exception ex) {
                        throw new ImageNotDeletedException("This image is not deleted, please try again later !");
                    }
                } else {
                    mediaHelper.deleteFromCloudinary(oldImagePath);
                }
            }
        }

        List<String> newImagePaths = new ArrayList<>();
        for (MultipartFile image : images) {
            String imageUrl = mediaHelper.uploadToCloudinary(image, request.targetType(), request.targetId());
            newImagePaths.add(imageUrl);
            if (request.targetType().equals(TargetType.PRODUCT)) {
                Media media = Media.builder()
                        .imagePath(imageUrl)
                        .productId(request.targetId())
                        .build();
                mediaRepository.save(media);
            }
        }

        String folder = mediaHelper.getFolder(request.targetType(), request.targetId());
        mediaHelper.deleteFolderIfEmpty(folder);

        return ResponseData.success("Media updated successfully !", newImagePaths);
    }
}
