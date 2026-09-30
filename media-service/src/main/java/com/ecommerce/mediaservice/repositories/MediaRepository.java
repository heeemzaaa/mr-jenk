package com.ecommerce.mediaservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.mediaservice.models.Media;


@Repository
public interface MediaRepository extends MongoRepository<Media, String> {
    Optional<List<Media>> findByProductId(String productId);
    Optional<Media> findByImagePath(String imagePath);
}
