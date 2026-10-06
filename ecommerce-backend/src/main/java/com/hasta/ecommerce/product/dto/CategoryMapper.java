package com.hasta.ecommerce.product.dto;

import com.hasta.ecommerce.product.entity.Category;
import java.util.List;
import java.util.stream.Collectors;

public class CategoryMapper {
    private CategoryMapper() {}

    public static CategoryDto toDto(Category category) {
        return new CategoryDto(category.getId(), category.getName(), category.getSlug());
    }

    public static List<CategoryDto> toDtoList(List<Category> categories) {
        return categories.stream().map(CategoryMapper::toDto).collect(Collectors.toList());
    }
}