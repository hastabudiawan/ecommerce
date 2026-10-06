package com.hasta.ecommerce.product.controller;

import com.hasta.ecommerce.common.response.ApiResponse;
import com.hasta.ecommerce.product.dto.CategoryDto;
import com.hasta.ecommerce.product.dto.CategoryMapper;
import com.hasta.ecommerce.product.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAll() {
        List<CategoryDto> categories = CategoryMapper.toDtoList(categoryRepository.findAll());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }
}