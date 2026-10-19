package com.hasta.ecommerce.product.dto;

import com.hasta.ecommerce.product.entity.Product;
import com.hasta.ecommerce.product.entity.ProductImage;
import com.hasta.ecommerce.product.entity.ProductVariant;

import java.util.List;
import java.util.stream.Collectors;

public class ProductMapper {

    private ProductMapper() {}

    public static ProductDto toDto(Product product) {
        List<ProductImageDto> images = product.getImages().stream()
                .map(ProductMapper::toImageDto)
                .collect(Collectors.toList());

        List<VariantDto> variants = product.getVariants().stream()
                .map(ProductMapper::toVariantDto)
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
                product.getDiscountPercent(),
                product.getFinalPrice(),
                product.getStock(),
                product.getRatingAverage(),
                product.getReviewCount(),
                product.getStatus().name(),
                product.getRejectionReason(),
                variants,
                images,
                product.getCreatedAt()
        );
    }

    private static ProductImageDto toImageDto(ProductImage image) {
        return new ProductImageDto(image.getId(), image.getImageUrl(), image.isPrimary());
    }

    private static VariantDto toVariantDto(ProductVariant variant) {
        return new VariantDto(variant.getId(), variant.getColorName(), variant.getColorHex(),
                variant.getSize(), variant.getStock(), variant.getLabel());
    }
}