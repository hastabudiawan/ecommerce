package com.hasta.ecommerce.product.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.hasta.ecommerce.common.response.ApiResponse;
import com.hasta.ecommerce.common.response.PageResponse;
import com.hasta.ecommerce.product.dto.CreateProductRequest;
import com.hasta.ecommerce.product.dto.ProductDto;
import com.hasta.ecommerce.product.dto.ProductImageDto;
import com.hasta.ecommerce.product.dto.RejectProductRequest;
import com.hasta.ecommerce.product.dto.UpdateProductRequest;
import com.hasta.ecommerce.product.entity.ProductStatus;
import com.hasta.ecommerce.product.service.ProductService;
import com.hasta.ecommerce.security.SecurityUtils;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDto>> create(@Valid @RequestBody CreateProductRequest request) {
        ProductDto created = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product berhasil dibuat", created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getById(id)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductDto>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(productService.getBySlug(slug)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getAll(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProductDto> result = productService.getAll(categoryId, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(result)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> update(
            @PathVariable Long id, @Valid @RequestBody UpdateProductRequest request) {
        ProductDto updated = productService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product berhasil diupdate", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product berhasil dihapus", null));
    }

    @PostMapping("/seller")
    public ResponseEntity<ApiResponse<ProductDto>> createAsSeller(@Valid @RequestBody CreateProductRequest request) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        ProductDto created = productService.createAsSeller(sellerId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product berhasil diajukan, menunggu approval admin", created));
    }

    @GetMapping("/seller/my-products")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getMyProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        // Pageable pageable = PageRequest.of(page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductDto> result = productService.getMyProducts(sellerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(result)));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ProductDto>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Product disetujui", productService.approve(id)));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ProductDto>> reject(
            @PathVariable Long id, @Valid @RequestBody RejectProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product ditolak", productService.reject(id, request)));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<ProductImageDto>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean isPrimary) {
        Long userId = SecurityUtils.getCurrentUserId();
        ProductImageDto image = productService.addImage(userId, id, file, isPrimary);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gambar berhasil diupload", image));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable Long id, @PathVariable Long imageId) {
        Long userId = SecurityUtils.getCurrentUserId();
        productService.removeImage(userId, id, imageId);
        return ResponseEntity.ok(ApiResponse.success("Gambar berhasil dihapus", null));
    }

    @PutMapping("/seller/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateAsSeller(
            @PathVariable Long id, @Valid @RequestBody UpdateProductRequest request) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        ProductDto updated = productService.updateAsSeller(sellerId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Product berhasil diupdate", updated));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getForAdmin(
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Antrian review: yang paling lama menunggu ditampilkan paling atas
        Sort sort = status == ProductStatus.PENDING
                ? Sort.by(Sort.Direction.ASC, "createdAt")
                : Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProductDto> result = productService.getForAdmin(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(result)));
    }
}