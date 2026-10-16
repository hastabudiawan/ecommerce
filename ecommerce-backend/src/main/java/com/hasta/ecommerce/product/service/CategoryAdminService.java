package com.hasta.ecommerce.product.service;

import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.common.util.SlugGenerator;
import com.hasta.ecommerce.product.dto.CategoryDto;
import com.hasta.ecommerce.product.dto.CategoryMapper;
import com.hasta.ecommerce.product.entity.Category;
import com.hasta.ecommerce.product.repository.CategoryRepository;
import com.hasta.ecommerce.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CategoryAdminService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryAdminService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public CategoryDto create(String name) {
        String trimmed = name.trim();

        if (categoryRepository.existsByNameIgnoreCase(trimmed)) {
            throw new BadRequestException("Kategori dengan nama itu sudah ada");
        }

        String slug = ensureUniqueSlug(SlugGenerator.generate(trimmed));
        Category saved = categoryRepository.save(new Category(null, trimmed, slug));
        return CategoryMapper.toDto(saved);
    }

    // Slug sengaja tidak ikut berubah supaya URL yang sudah beredar tidak putus
    public CategoryDto rename(Long id, String name) {
        Category category = find(id);
        String trimmed = name.trim();

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(trimmed, id)) {
            throw new BadRequestException("Kategori dengan nama itu sudah ada");
        }

        category.setName(trimmed);
        return CategoryMapper.toDto(category);
    }

    public void delete(Long id) {
        Category category = find(id);

        long usedBy = productRepository.countByCategoryId(id);
        if (usedBy > 0) {
            throw new BadRequestException("Kategori masih dipakai " + usedBy
                    + " produk (termasuk yang diarsipkan), tidak bisa dihapus");
        }
        if (categoryRepository.existsByParentId(id)) {
            throw new BadRequestException("Kategori ini punya sub-kategori, tidak bisa dihapus");
        }

        categoryRepository.delete(category);
    }

    private Category find(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category dengan id " + id + " tidak ditemukan"));
    }

    private String ensureUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (categoryRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }
}