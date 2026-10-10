package com.hasta.ecommerce.product.service;

import com.hasta.ecommerce.product.dto.CreateProductRequest;
import com.hasta.ecommerce.product.dto.ProductDto;
import com.hasta.ecommerce.product.dto.ProductImageDto;
import com.hasta.ecommerce.product.dto.RejectProductRequest;
import com.hasta.ecommerce.product.dto.UpdateProductRequest;
import com.hasta.ecommerce.product.entity.ProductStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
public interface ProductService {
    ProductDto create(CreateProductRequest request);
    ProductDto getById(Long id);
    ProductDto getBySlug(String slug);
    Page<ProductDto> getAll(Long categoryId, String keyword, Pageable pageable);
    ProductDto update(Long id, UpdateProductRequest request);
    void delete(Long id);

    ProductDto createAsSeller(Long sellerId, CreateProductRequest request);
    Page<ProductDto> getMyProducts(Long sellerId, Pageable pageable);
    ProductDto approve(Long productId);
    ProductDto reject(Long productId, RejectProductRequest request);
    ProductImageDto addImage(Long userId, Long productId, MultipartFile file, boolean isPrimary);
    void removeImage(Long userId, Long productId, Long imageId);

    ProductDto updateAsSeller(Long sellerId, Long productId, UpdateProductRequest request);

    Page<ProductDto> getForAdmin(ProductStatus status, Pageable pageable);
}