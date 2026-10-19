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
import com.hasta.ecommerce.security.SecurityUtils;
import com.hasta.ecommerce.store.entity.Store;
import com.hasta.ecommerce.store.repository.StoreRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Objects;

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

    // ---------- Admin: produk platform ----------

    @Override
    public ProductDto create(CreateProductRequest request) {
        Category category = findCategory(request.categoryId());

        String slug = ensureUniqueSlug(SlugGenerator.generate(request.name()));

        Product product = new Product(
                category, request.name(), slug, request.description(),
                request.price(), request.stock());
        
        // Simpan diskon (jika ada)
        product.setDiscountPercent(discountOf(request.discountPercent()));

        return ProductMapper.toDto(productRepository.save(product));
    }

    @Override
    public ProductDto update(Long id, UpdateProductRequest request) {
        Product product = findProduct(id);
        Category category = findCategory(request.categoryId());

        product.setCategory(category);
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        
        // Produk bervarian: stok adalah total stok varian, hanya diubah lewat varian
        if (product.getVariants().isEmpty()) {
            product.setStock(request.stock());
        }
        
        // Update diskon (jika ada perubahan)
        product.setDiscountPercent(discountOf(request.discountPercent()));

        return ProductMapper.toDto(product);
    }

    @Override
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product dengan id " + id + " tidak ditemukan");
        }
        productRepository.deleteById(id);
    }

    // ---------- Publik ----------

    @Override
    @Transactional(readOnly = true)
    public ProductDto getById(Long id) {
        Product product = productRepository.findByIdWithImages(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product dengan id " + id + " tidak ditemukan"));
        return ProductMapper.toDto(requireVisible(product));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product dengan slug '" + slug + "' tidak ditemukan"));
        return ProductMapper.toDto(requireVisible(product));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> getAll(Long categoryId, String keyword, boolean onSale, Pageable pageable) {
        return productRepository.browse(
                ProductStatus.APPROVED,
                categoryId == null ? 0L : categoryId,
                onSale,
                keyword == null ? "" : keyword.trim(),
                pageable)
                .map(ProductMapper::toDto);
    }

    // ---------- Seller ----------

    @Override
    public ProductDto createAsSeller(Long sellerId, CreateProductRequest request) {
        Store store = storeRepository.findBySellerId(sellerId)
                .orElseThrow(() -> new BadRequestException(
                        "Anda belum punya toko, buat toko dulu sebelum upload produk"));

        Category category = findCategory(request.categoryId());

        String slug = ensureUniqueSlug(SlugGenerator.generate(request.name()));

        Product product = new Product(store, category, request.name(), slug, request.description(),
                request.price(), request.stock());

        // Simpan diskon (jika ada)
        product.setDiscountPercent(discountOf(request.discountPercent()));

        return ProductMapper.toDto(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDto> getMyProducts(Long sellerId, boolean archived, Pageable pageable) {
        Store store = storeRepository.findBySellerId(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Anda belum punya toko"));

        Page<Product> products = archived
                ? productRepository.findByStoreIdAndStatus(store.getId(), ProductStatus.ARCHIVED, pageable)
                : productRepository.findByStoreIdAndStatusNot(store.getId(), ProductStatus.ARCHIVED, pageable);

        return products.map(ProductMapper::toDto);
    }

    @Override
    public ProductDto updateAsSeller(Long sellerId, Long productId, UpdateProductRequest request) {
        Product product = findOwnedBySeller(sellerId, productId);
        Category category = findCategory(request.categoryId());

        // Konten yang berubah menentukan perlu tidaknya review ulang (dibandingkan
        // SEBELUM nilai baru dipasang)
        boolean contentChanged = !Objects.equals(norm(product.getName()), norm(request.name()))
                || !Objects.equals(norm(product.getDescription()), norm(request.description()))
                || !product.getCategory().getId().equals(category.getId());

        product.setCategory(category);
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        
        // Produk bervarian: stok adalah total stok varian, hanya diubah lewat varian
        if (product.getVariants().isEmpty()) {
            product.setStock(request.stock());
        }
        
        // Update diskon
        product.setDiscountPercent(discountOf(request.discountPercent()));

        if (product.getStatus() == ProductStatus.REJECTED) {
            // Produk yang ditolak dianggap diajukan ulang begitu penjual memperbaikinya
            product.setStatus(ProductStatus.PENDING);
            product.setRejectionReason(null);
        } else if (product.getStatus() == ProductStatus.APPROVED && contentChanged) {
            // Produk yang sudah tayang dan kontennya berubah harus ditinjau ulang
            product.setStatus(ProductStatus.PENDING);
        }

        return ProductMapper.toDto(product);
    }

    @Override
    public ProductDto archive(Long sellerId, Long productId) {
        Product product = findOwnedBySeller(sellerId, productId);

        if (product.getStatus() == ProductStatus.ARCHIVED) {
            throw new BadRequestException("Produk sudah diarsipkan");
        }

        product.setStatus(ProductStatus.ARCHIVED);
        return ProductMapper.toDto(product);
    }

    @Override
    public ProductDto restore(Long sellerId, Long productId) {
        Product product = findOwnedBySeller(sellerId, productId);

        if (product.getStatus() != ProductStatus.ARCHIVED) {
            throw new BadRequestException("Produk ini tidak sedang diarsipkan");
        }

        // Kembali ke antrean review, bukan langsung tayang
        product.setStatus(ProductStatus.PENDING);
        product.setRejectionReason(null);
        return ProductMapper.toDto(product);
    }

    // ---------- Admin: review ----------

    @Override
    public ProductDto approve(Long productId) {
        Product product = findProduct(productId);
        rejectIfArchived(product);

        product.setStatus(ProductStatus.APPROVED);
        product.setRejectionReason(null);
        return ProductMapper.toDto(product);
    }

    @Override
    public ProductDto reject(Long productId, RejectProductRequest request) {
        Product product = findProduct(productId);
        rejectIfArchived(product);

        product.setStatus(ProductStatus.REJECTED);
        product.setRejectionReason(request.reason());
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

    // ---------- Gambar ----------

    @Override
    public ProductImageDto addImage(Long userId, Long productId, MultipartFile file, boolean isPrimary) {
        Product product = findProduct(productId);
        checkOwnership(userId, product);

        String imageUrl = imageUploadService.upload(file);

        ProductImage image = new ProductImage(imageUrl, isPrimary);

        // Cuma boleh ada 1 gambar utama per produk
        if (isPrimary) {
            product.getImages().forEach(img -> img.setPrimary(false));
        }

        product.addImage(image);

        // Gambar baru adalah konten baru: produk seller yang sudah tayang ditinjau ulang.
        // Produk platform (tanpa toko) dikecualikan.
        if (product.getStore() != null && product.getStatus() == ProductStatus.APPROVED) {
            product.setStatus(ProductStatus.PENDING);
        }

        productRepository.save(product);

        return new ProductImageDto(image.getId(), image.getImageUrl(), image.isPrimary());
    }

    @Override
    public void removeImage(Long userId, Long productId, Long imageId) {
        Product product = findProduct(productId);
        checkOwnership(userId, product);

        ProductImage image = findImage(product, imageId);
        boolean wasPrimary = image.isPrimary();

        imageUploadService.delete(image.getImageUrl());
        product.getImages().remove(image);

        // Kalau yang dihapus gambar utama, gambar berikutnya (kalau ada) naik jadi utama
        if (wasPrimary && !product.getImages().isEmpty()) {
            product.getImages().get(0).setPrimary(true);
        }

        productRepository.save(product);
    }

    @Override
    public ProductImageDto setPrimaryImage(Long userId, Long productId, Long imageId) {
        Product product = findProduct(productId);
        checkOwnership(userId, product);

        ProductImage target = findImage(product, imageId);

        product.getImages().forEach(img -> img.setPrimary(false));
        target.setPrimary(true);

        return new ProductImageDto(target.getId(), target.getImageUrl(), target.isPrimary());
    }

    // ---------- Helper ----------

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product dengan id " + id + " tidak ditemukan"));
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category dengan id " + id + " tidak ditemukan"));
    }

    private ProductImage findImage(Product product, Long imageId) {
        return product.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Gambar dengan id " + imageId + " tidak ditemukan di produk ini"));
    }

    // Produk non-APPROVED hanya terlihat oleh admin dan pemilik tokonya.
    // Selain itu dijawab 404 (bukan 403) supaya keberadaan produknya tidak bocor.
    private Product requireVisible(Product product) {
        if (product.getStatus() == ProductStatus.APPROVED || SecurityUtils.hasRole("ADMIN")) {
            return product;
        }

        Long viewerId = SecurityUtils.getCurrentUserIdOrNull();
        boolean isOwner = viewerId != null
                && product.getStore() != null
                && product.getStore().getSeller().getId().equals(viewerId);

        if (!isOwner) {
            throw new ResourceNotFoundException("Product tidak ditemukan");
        }
        return product;
    }

    // Lebih ketat dari checkOwnership(): produk platform (tanpa toko) bukan milik seller manapun
    private Product findOwnedBySeller(Long sellerId, Long productId) {
        Product product = findProduct(productId);

        if (product.getStore() == null || !product.getStore().getSeller().getId().equals(sellerId)) {
            throw new BadRequestException("Anda bukan pemilik produk ini");
        }
        return product;
    }

    // Dipakai untuk kelola gambar oleh ADMIN atau SELLER: peran sudah disaring di SecurityConfig,
    // jadi di sini cukup memblokir seller yang mengutak-atik produk toko lain.
    private void checkOwnership(Long userId, Product product) {
        boolean isProductOwner = product.getStore() != null
                && product.getStore().getSeller().getId().equals(userId);

        if (product.getStore() != null && !isProductOwner && !SecurityUtils.hasRole("ADMIN")) {
            throw new BadRequestException("Anda bukan pemilik produk ini");
        }
    }

    private void rejectIfArchived(Product product) {
        if (product.getStatus() == ProductStatus.ARCHIVED) {
            throw new BadRequestException("Produk ini diarsipkan oleh penjual dan tidak bisa diproses");
        }
    }

    private static String norm(String value) {
        return value == null ? "" : value.trim();
    }
    
    // Helper diskon
    private static int discountOf(Integer value) {
        return value == null ? 0 : value;
    }

    private String ensureUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (productRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }
}