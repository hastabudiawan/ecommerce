package com.hasta.ecommerce.product.service;

import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.common.util.SlugGenerator;
import com.hasta.ecommerce.product.dto.CreateProductRequest;
import com.hasta.ecommerce.product.dto.ProductDto;
import com.hasta.ecommerce.product.dto.ProductImageDto;
import com.hasta.ecommerce.product.dto.ProductMapper;
import com.hasta.ecommerce.product.dto.RejectProductRequest;
import com.hasta.ecommerce.product.dto.UpdateProductRequest;
import com.hasta.ecommerce.product.entity.Category;
import com.hasta.ecommerce.product.entity.Product;
import com.hasta.ecommerce.product.entity.ProductImage;
import com.hasta.ecommerce.product.entity.ProductStatus;
import com.hasta.ecommerce.product.repository.CategoryRepository;
import com.hasta.ecommerce.product.repository.ProductRepository;
import com.hasta.ecommerce.store.entity.Store;
import com.hasta.ecommerce.store.repository.StoreRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StoreRepository storeRepository;
    private final ImageUploadService imageUploadService;

    public ProductServiceImpl(ProductRepository productRepository, CategoryRepository categoryRepository,
            StoreRepository storeRepository, ImageUploadService imageUploadService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.storeRepository = storeRepository;
        this.imageUploadService = imageUploadService;
    }

    @Override
    public ProductDto create(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category dengan id " + request.categoryId() + " tidak ditemukan"));

        String baseSlug = SlugGenerator.generate(request.name());
        String slug = ensureUniqueSlug(baseSlug);

        Product product = new Product(
                category, request.name(), slug, request.description(),
                request.price(), request.stock());

        Product saved = productRepository.save(product);
        return ProductMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto getById(Long id) {
        Product product = productRepository.findByIdWithImages(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product dengan id " + id + " tidak ditemukan"));
        return ProductMapper.toDto(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product dengan slug '" + slug + "' tidak ditemukan"));
        return ProductMapper.toDto(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> getAll(Long categoryId, String keyword, Pageable pageable) {
        Page<Product> products;
        if (keyword != null && !keyword.isBlank()) {
            products = productRepository.searchByNameAndStatus(keyword, ProductStatus.APPROVED, pageable);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryIdAndStatus(categoryId, ProductStatus.APPROVED, pageable);
        } else {
            products = productRepository.findByStatus(ProductStatus.APPROVED, pageable);
        }
        return products.map(ProductMapper::toDto);
    }

    @Override
    public ProductDto update(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product dengan id " + id + " tidak ditemukan"));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category dengan id " + request.categoryId() + " tidak ditemukan"));

        product.setCategory(category);
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStock(request.stock());

        return ProductMapper.toDto(product);
    }

    @Override
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product dengan id " + id + " tidak ditemukan");
        }
        productRepository.deleteById(id);
    }

    @Override
    public ProductDto createAsSeller(Long sellerId, CreateProductRequest request) {
        Store store = storeRepository.findBySellerId(sellerId)
                .orElseThrow(
                        () -> new BadRequestException("Anda belum punya toko, buat toko dulu sebelum upload produk"));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category dengan id " + request.categoryId() + " tidak ditemukan"));

        String baseSlug = SlugGenerator.generate(request.name());
        String slug = ensureUniqueSlug(baseSlug);

        Product product = new Product(store, category, request.name(), slug, request.description(),
                request.price(), request.stock());

        Product saved = productRepository.save(product);
        return ProductMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> getMyProducts(Long sellerId, Pageable pageable) {
        Store store = storeRepository.findBySellerId(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Anda belum punya toko"));
        return productRepository.findByStoreId(store.getId(), pageable).map(ProductMapper::toDto);
    }

    @Override
    public ProductDto approve(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Product dengan id " + productId + " tidak ditemukan"));
        product.setStatus(ProductStatus.APPROVED);
        product.setRejectionReason(null);
        return ProductMapper.toDto(product);
    }

    @Override
    public ProductDto reject(Long productId, RejectProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Product dengan id " + productId + " tidak ditemukan"));
        product.setStatus(ProductStatus.REJECTED);
        product.setRejectionReason(request.reason());
        return ProductMapper.toDto(product);
    }

    private String ensureUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (productRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }

    @Override
    public ProductImageDto addImage(Long userId, Long productId, MultipartFile file, boolean isPrimary) {
        Product product = productRepository.findById(productId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Product dengan id " + productId + " tidak ditemukan"));

        checkOwnership(userId, product);

        String imageUrl = imageUploadService.upload(file);

        ProductImage image = new ProductImage(imageUrl, isPrimary);

        if (isPrimary) {
            product.getImages().forEach(img -> img.setPrimary(false));
        }

        product.addImage(image);
        productRepository.save(product);

        return new ProductImageDto(image.getId(), image.getImageUrl(), image.isPrimary());
    }

    @Override
    public void removeImage(Long userId, Long productId, Long imageId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Product dengan id " + productId + " tidak ditemukan"));

        checkOwnership(userId, product);

        ProductImage image = product.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Gambar dengan id " + imageId + " tidak ditemukan di produk ini"));

        imageUploadService.delete(image.getImageUrl());
        product.getImages().remove(image);
        productRepository.save(product);
    }

    private void checkOwnership(Long userId, Product product) {
        boolean isProductOwner = product.getStore() != null
                && product.getStore().getSeller().getId().equals(userId);

        if (product.getStore() != null && !isProductOwner) {
            throw new BadRequestException("Anda bukan pemilik produk ini");
        }
    }

    @Override
    public ProductDto updateAsSeller(Long sellerId, Long productId, UpdateProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product dengan id " + productId + " tidak ditemukan"));

        // Lebih ketat dari checkOwnership(): produk platform (tanpa toko) bukan milik
        // seller manapun
        if (product.getStore() == null || !product.getStore().getSeller().getId().equals(sellerId)) {
            throw new BadRequestException("Anda bukan pemilik produk ini");
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category dengan id " + request.categoryId() + " tidak ditemukan"));

        product.setCategory(category);
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStock(request.stock());

        // Produk yang ditolak dianggap diajukan ulang begitu penjual memperbaikinya.
        // Tanpa ini, produk REJECTED tidak punya jalan keluar.
        if (product.getStatus() == ProductStatus.REJECTED) {
            product.setStatus(ProductStatus.PENDING);
            product.setRejectionReason(null);
        }

        return ProductMapper.toDto(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> getForAdmin(ProductStatus status, Pageable pageable) {
        Page<Product> products = status != null
                ? productRepository.findByStatus(status, pageable)
                : productRepository.findAll(pageable);
        return products.map(ProductMapper::toDto);
    }
}