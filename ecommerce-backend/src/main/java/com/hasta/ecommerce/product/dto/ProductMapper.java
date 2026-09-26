package com.hasta.ecommerce.product.dto;

import com.hasta.ecommerce.product.entity.Product;
import com.hasta.ecommerce.product.entity.ProductImage;

import java.util.List;
import java.util.stream.Collectors;

public class ProductMapper {

    private ProductMapper() {}

public static ProductDto toDto(Product product) {
    List<ProductImageDto> images = product.getImages().stream()
            .map(ProductMapper::toImageDto)
            .collect(Collectors.toList());

    Long storeId = product.getStore() != null ? product.getStore().getId() : null;
    String storeName = product.getStore() != null ? product.getStore().getStoreName() : null;

    return new ProductDto(
            product.getId(),
            product.getCategory().getId(),
            product.getCategory().getName(),
            storeId,
            storeName,
            product.getName(),
            product.getSlug(),
            product.getDescription(),
            product.getPrice(),
            product.getStock(),
            product.getStatus().name(),
            product.getRejectionReason(),
            images,
            product.getCreatedAt()
    );
}

    private static ProductImageDto toImageDto(ProductImage image) {
        return new ProductImageDto(image.getId(), image.getImageUrl(), image.isPrimary());
    }
}