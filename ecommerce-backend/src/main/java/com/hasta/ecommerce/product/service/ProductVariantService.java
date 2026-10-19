package com.hasta.ecommerce.product.service;

import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.product.dto.ProductDto;
import com.hasta.ecommerce.product.dto.ProductMapper;
import com.hasta.ecommerce.product.dto.VariantRequest;
import com.hasta.ecommerce.product.entity.Product;
import com.hasta.ecommerce.product.entity.ProductVariant;
import com.hasta.ecommerce.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductVariantService {

    private final ProductRepository productRepository;

    public ProductVariantService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Variasi yang sudah dibersihkan: teks kosong menjadi null, dan hex dibuang kalau tidak ada nama warna
    private record Cleaned(Long id, String color, String hex, String size, int stock) {}

    public ProductDto replaceVariants(Long sellerId, Long productId, List<VariantRequest> requests) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product dengan id " + productId + " tidak ditemukan"));

        if (product.getStore() == null || !product.getStore().getSeller().getId().equals(sellerId)) {
            throw new BadRequestException("Anda bukan pemilik produk ini");
        }

        List<Cleaned> cleaned = requests.stream().map(this::clean).toList();
        validateShape(cleaned);
        validateNoDuplicates(cleaned);

        reconcile(product, cleaned);

        // Produk dengan varian: stok produk = total stok semua varian
        if (!product.getVariants().isEmpty()) {
            product.setStock(product.getVariants().stream().mapToInt(ProductVariant::getStock).sum());
        }

        return ProductMapper.toDto(product);
    }

    private Cleaned clean(VariantRequest request) {
        String color = blankToNull(request.colorName());
        String size = blankToNull(request.size());

        if (color == null && size == null) {
            throw new BadRequestException("Setiap varian harus punya warna atau ukuran");
        }

        String hex = color == null ? null : blankToNull(request.colorHex());
        return new Cleaned(request.id(), color, hex, size, request.stock());
    }

    // Semua varian harus memakai kombinasi atribut yang sama
    private void validateShape(List<Cleaned> list) {
        boolean anyColor = list.stream().anyMatch(c -> c.color() != null);
        boolean allColor = list.stream().allMatch(c -> c.color() != null);
        boolean anySize = list.stream().anyMatch(c -> c.size() != null);
        boolean allSize = list.stream().allMatch(c -> c.size() != null);

        if ((anyColor && !allColor) || (anySize && !allSize)) {
            throw new BadRequestException(
                    "Semua varian harus memakai atribut yang sama (warna, ukuran, atau keduanya)");
        }
    }

    private void validateNoDuplicates(List<Cleaned> list) {
        Set<String> seen = new HashSet<>();
        for (Cleaned c : list) {
            if (!seen.add(key(c.color(), c.size()))) {
                throw new BadRequestException("Ada varian yang kembar: " + label(c.color(), c.size()));
            }
        }
    }

    private void reconcile(Product product, List<Cleaned> cleaned) {
        Map<Long, ProductVariant> byId = new HashMap<>();
        Map<String, ProductVariant> byKey = new HashMap<>();
        for (ProductVariant existing : product.getVariants()) {
            byId.put(existing.getId(), existing);
            byKey.put(key(existing.getColorName(), existing.getSize()), existing);
        }

        Set<Long> kept = new HashSet<>();

        // Tahap 1: varian yang membawa id (yang sudah ada), diperbarui apa adanya
        for (Cleaned c : cleaned) {
            if (c.id() == null) continue;

            ProductVariant target = byId.get(c.id());
            if (target == null) {
                throw new BadRequestException("Varian dengan id " + c.id() + " bukan milik produk ini");
            }
            target.update(c.color(), c.hex(), c.size(), c.stock());
            kept.add(target.getId());
        }

        // Tahap 2: varian tanpa id. Kalau kombinasinya sama dengan varian lama yang belum terpakai,
        // varian lama itu dipakai ulang (menghapus lalu menambah kombinasi yang sama tidak boleh
        // menabrak aturan kombinasi unik di database). Selain itu dibuat baru.
        for (Cleaned c : cleaned) {
            if (c.id() != null) continue;

            ProductVariant sameCombo = byKey.get(key(c.color(), c.size()));
            if (sameCombo != null && !kept.contains(sameCombo.getId())) {
                sameCombo.update(c.color(), c.hex(), c.size(), c.stock());
                kept.add(sameCombo.getId());
            } else {
                product.addVariant(new ProductVariant(product, c.color(), c.hex(), c.size(), c.stock()));
            }
        }

        // Varian lama yang tidak ada di daftar baru dihapus (orphanRemoval)
        product.getVariants().removeIf(v -> v.getId() != null && !kept.contains(v.getId()));
    }

    private static String key(String color, String size) {
        return (color == null ? "" : color.toLowerCase()) + "|" + (size == null ? "" : size.toLowerCase());
    }

    private static String label(String color, String size) {
        return java.util.stream.Stream.of(color, size)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.joining(" / "));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}