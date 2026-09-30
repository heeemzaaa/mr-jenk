package com.ecommerce.mediaservice.services;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ecommerce.mediaservice.clients.ProductServiceGateway;
import com.ecommerce.mediaservice.dtos.Product;
import com.ecommerce.mediaservice.dtos.TargetType;
import com.ecommerce.mediaservice.exceptions.Product.ForbiddenToChangeProductMediaException;
import com.ecommerce.mediaservice.exceptions.Product.ProductNotFoundException;
import com.ecommerce.mediaservice.exceptions.media.CloudinaryDeleteException;
import com.ecommerce.mediaservice.exceptions.media.CloudinaryUploadException;
import com.ecommerce.mediaservice.exceptions.media.ImageNotFoundException;
import com.ecommerce.mediaservice.exceptions.media.ImageNullOrEmptyException;
import com.ecommerce.mediaservice.exceptions.media.InvalidImageBodyException;
import com.ecommerce.mediaservice.exceptions.media.InvalidImageTypeException;
import com.ecommerce.mediaservice.exceptions.media.InvalidSizeLimitException;
import com.ecommerce.mediaservice.exceptions.profile.ForbiddenToChangeProfileException;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
class MediaHelper {
    private static final long MAX_IMAGE_SIZE = 2 * 1024 * 1024;
    private final Cloudinary cloudinary;
    private final ProductServiceGateway productServiceGateway;

    String uploadToCloudinary(MultipartFile image, TargetType targetType, String targetId) {
        Map<?, ?> uploadResult;
        try {
            if (targetType.equals(TargetType.PRODUCT)) {
                uploadResult = cloudinary.uploader().upload(image.getBytes(),
                        ObjectUtils.asMap("folder", "products/" + targetId));
            } else {
                uploadResult = cloudinary.uploader().upload(image.getBytes(),
                        ObjectUtils.asMap("folder", "profile/" + targetId));
            }
        } catch (IOException e) {
            throw new CloudinaryUploadException("Failed to upload image to Cloudinary !", e);
        }

        Object secureUrl = uploadResult.get("secure_url");
        if (secureUrl == null) {
            throw new CloudinaryUploadException("Cloudinary did not return a valid upload result !");
        }
        return secureUrl.toString();
    }

    void verifyImageBelongsToTarget(String imagePath, TargetType targetType, String targetId) {
        String folder = targetType.equals(TargetType.PRODUCT)
                ? "/products/" + targetId + "/"
                : "/profile/" + targetId + "/";
        if (!imagePath.contains(folder)) {
            throw new ImageNotFoundException("Image not found !");
        }
    }

    String getFolder(TargetType targetType, String targetId) {
        return targetType.equals(TargetType.PRODUCT) ? "products/" + targetId + "/" : "profile/" + targetId + "/";
    }

    // this method checks ownership
    void checkOwnership(TargetType targetType, String targetId, String userId) {
        if (targetType.equals(TargetType.PROFILE)) {
            boolean isOwner = targetId.equals(userId);
            if (!isOwner) {
                throw new ForbiddenToChangeProfileException("You do not have access to delete this image");
            }
        } else {
            Product product = productServiceGateway.getProduct(targetId);
            if (product == null) {
                throw new ProductNotFoundException("Product not found !");
            }

            if (!product.userId().equals(userId)) {
                throw new ForbiddenToChangeProductMediaException(
                        "You do not have access to the media of this product !");
            }
        }
    }

    void deleteFolderIfEmpty(String folder) {
        try {
            Map<?, ?> resourcesResult = cloudinary.api().resources(ObjectUtils.asMap(
                    "type", "upload",
                    "prefix", folder,
                    "max_results", 1));
            List<?> resources = (List<?>) resourcesResult.get("resources");
            if (resources == null || resources.isEmpty()) {
                cloudinary.api().deleteFolder(folder, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            throw new CloudinaryDeleteException("Failed to delete empty folder from Cloudinary !", e);
        }
    }

    void deleteFromCloudinary(String imagePath) {
        String publicId = extractPublicId(imagePath);
        Map<?, ?> result;
        try {
            result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new CloudinaryDeleteException("Failed to delete image from Cloudinary !", e);
        }

        Object status = result.get("result");
        if (status == null || !status.equals("ok")) {
            throw new ImageNotFoundException("Image not found on Cloudinary : " + publicId);
        }
    }

    private String extractPublicId(String imageUrl) {
        int uploadIndex = imageUrl.indexOf("/upload/");
        if (uploadIndex == -1) {
            throw new CloudinaryDeleteException("Invalid Cloudinary image URL !");
        }

        String path = imageUrl.substring(uploadIndex + "/upload/".length());
        if (path.matches("^v\\d+/.*")) { // valid: v12/anything
            path = path.substring(path.indexOf('/') + 1);
        }

        int dotIndex = path.lastIndexOf('.');
        return dotIndex == -1 ? path : path.substring(0, dotIndex);
    }

    void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ImageNullOrEmptyException("The image is empty or null !");
        }

        if (image.getSize() > MAX_IMAGE_SIZE) {
            throw new InvalidSizeLimitException("The image has more than 2MB !");
        }

        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidImageTypeException("Invalid content type !");
        }

        try {
            if (ImageIO.read(image.getInputStream()) == null) {
                throw new InvalidImageBodyException("The image body doesn't contain data of an image !");
            }
        } catch (IOException e) {
            throw new InvalidImageBodyException("The image body doesn't contain data of an image !");
        }
    }
}
