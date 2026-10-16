package com.hasta.ecommerce.product.controller;

import com.hasta.ecommerce.common.response.ApiResponse;
import com.hasta.ecommerce.product.dto.CategoryDto;
import com.hasta.ecommerce.product.dto.CategoryMapper;
import com.hasta.ecommerce.product.dto.CategoryRequest;
import com.hasta.ecommerce.product.repository.CategoryRepository;
import com.hasta.ecommerce.product.service.CategoryAdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final CategoryAdminService categoryAdminService;

    public CategoryController(CategoryRepository categoryRepository,
                               CategoryAdminService categoryAdminService) {
        this.categoryRepository = categoryRepository;
        this.categoryAdminService = categoryAdminService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAll() {
        List<CategoryDto> categories = CategoryMapper.toDtoList(categoryRepository.findAll());
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDto>> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Kategori berhasil dibuat", categoryAdminService.create(request.name())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> rename(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Kategori berhasil diubah", categoryAdminService.rename(id, request.name())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryAdminService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Kategori berhasil dihapus", null));
    }
}