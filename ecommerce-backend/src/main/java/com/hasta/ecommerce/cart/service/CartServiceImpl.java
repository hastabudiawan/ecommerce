package com.hasta.ecommerce.cart.service;

import com.hasta.ecommerce.cart.dto.AddCartItemRequest;
import com.hasta.ecommerce.cart.dto.CartDto;
import com.hasta.ecommerce.cart.dto.CartMapper;
import com.hasta.ecommerce.cart.dto.UpdateCartItemRequest;
import com.hasta.ecommerce.cart.entity.Cart;
import com.hasta.ecommerce.cart.entity.CartItem;
import com.hasta.ecommerce.cart.repository.CartItemRepository;
import com.hasta.ecommerce.cart.repository.CartRepository;
import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.common.exception.InsufficientStockException;
import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.product.entity.Product;
import com.hasta.ecommerce.product.entity.ProductStatus;
import com.hasta.ecommerce.product.entity.ProductVariant;
import com.hasta.ecommerce.product.repository.ProductRepository;
import com.hasta.ecommerce.user.entity.User;
import com.hasta.ecommerce.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(CartRepository cartRepository, CartItemRepository cartItemRepository,
                            ProductRepository productRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public CartDto getCart(Long userId) {
        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> emptyCartView(userId));
        return CartMapper.toDto(cart);
    }

    @Override
    public CartDto addItem(Long userId, AddCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product dengan id " + request.productId() + " tidak ditemukan"));

        if (product.getStatus() != ProductStatus.APPROVED) {
            throw new BadRequestException("Produk ini tidak tersedia");
        }

        ProductVariant variant = resolveVariant(product, request.variantId());

        Optional<CartItem> existingItem = variant == null
                ? cartItemRepository.findByCartIdAndProductIdAndVariantIsNull(cart.getId(), product.getId())
                : cartItemRepository.findByCartIdAndProductIdAndVariantId(
                        cart.getId(), product.getId(), variant.getId());

        int newQuantity = existingItem.map(CartItem::getQuantity).orElse(0) + request.quantity();
        int available = variant != null ? variant.getStock() : product.getStock();

        if (available < newQuantity) {
            throw new InsufficientStockException(
                    "Stok '" + displayName(product, variant) + "' tidak cukup. Tersedia: " + available
                            + ", diminta: " + newQuantity);
        }

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(newQuantity);
        } else {
            CartItem newItem = new CartItem(cart, product, variant, request.quantity(), product.getFinalPrice());
            cartItemRepository.save(newItem);
        }

        Cart refreshed = cartRepository.findByUserIdWithItems(userId).orElseThrow();
        return CartMapper.toDto(refreshed);
    }

    @Override
    public CartDto updateItemQuantity(Long userId, Long itemId, UpdateCartItemRequest request) {
        CartItem item = getOwnedCartItem(userId, itemId);

        ProductVariant variant = item.getVariant();
        int available = variant != null ? variant.getStock() : item.getProduct().getStock();

        if (available < request.quantity()) {
            throw new InsufficientStockException(
                    "Stok '" + displayName(item.getProduct(), variant) + "' tidak cukup. Tersedia: " + available);
        }

        item.setQuantity(request.quantity());

        Cart refreshed = cartRepository.findByUserIdWithItems(userId).orElseThrow();
        return CartMapper.toDto(refreshed);
    }

    @Override
    public CartDto removeItem(Long userId, Long itemId) {
        CartItem item = getOwnedCartItem(userId, itemId);
        cartItemRepository.delete(item);

        Cart refreshed = cartRepository.findByUserIdWithItems(userId).orElseThrow();
        return CartMapper.toDto(refreshed);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart tidak ditemukan"));
        cart.getItems().clear(); // orphanRemoval = true di entity Cart akan otomatis hapus dari DB
    }

    // ==== Helper methods privat ====

    // Produk dengan varian wajib memilih varian milik produk itu. Produk tanpa varian tidak boleh membawa varian.
    private ProductVariant resolveVariant(Product product, Long variantId) {
        boolean hasVariants = !product.getVariants().isEmpty();

        if (!hasVariants) {
            if (variantId != null) {
                throw new BadRequestException("Produk ini tidak punya pilihan varian");
            }
            return null;
        }

        if (variantId == null) {
            throw new BadRequestException("Pilih warna atau ukuran dulu");
        }

        return product.getVariants().stream()
                .filter(v -> v.getId().equals(variantId))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Varian tidak ditemukan pada produk ini"));
    }

    private String displayName(Product product, ProductVariant variant) {
        return variant != null ? product.getName() + " (" + variant.getLabel() + ")" : product.getName();
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findByIdOrThrow(userId);
                    return cartRepository.save(new Cart(user));
                });
    }

    private CartItem getOwnedCartItem(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item dengan id " + itemId + " tidak ditemukan"));

        // Pastikan item ini benar-benar milik cart user yang sedang login,
        // bukan cart item milik user lain (mencegah IDOR - Insecure Direct Object Reference)
        if (!item.getCart().getUser().getId().equals(userId)) {
            throw new BadRequestException("Cart item ini bukan milik Anda");
        }
        return item;
    }

    private Cart emptyCartView(Long userId) {
        // Representasi cart kosong buat ditampilkan (belum tentu tersimpan di DB),
        // dipakai supaya GET /api/cart tidak error walau user belum pernah nambah item
        User user = userRepository.findByIdOrThrow(userId);
        return new Cart(user);
    }
}