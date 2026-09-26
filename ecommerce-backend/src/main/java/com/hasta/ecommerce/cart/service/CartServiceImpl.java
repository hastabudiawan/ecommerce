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
import com.hasta.ecommerce.product.repository.ProductRepository;
import com.hasta.ecommerce.user.entity.User;
import com.hasta.ecommerce.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        getOrCreateCart(userId); // pastikan row cart sudah ada
        Cart cart = cartRepository.findByUserIdWithItems(userId).orElseThrow();

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product dengan id " + request.productId() + " tidak ditemukan"));

        CartItem existingItem = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElse(null);

        int newQuantity = (existingItem != null ? existingItem.getQuantity() : 0) + request.quantity();

        if (product.getStock() < newQuantity) {
            throw new InsufficientStockException(
                    "Stok produk '" + product.getName() + "' tidak cukup. Tersedia: " + product.getStock()
                            + ", diminta: " + newQuantity);
        }

        if (existingItem != null) {
            existingItem.setQuantity(newQuantity);
        } else {
            CartItem newItem = new CartItem(cart, product, request.quantity(), product.getPrice());
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem); // sinkronkan list in-memory juga
        }

        return CartMapper.toDto(cart);
    }

    @Override
    public CartDto updateItemQuantity(Long userId, Long itemId, UpdateCartItemRequest request) {
        CartItem item = getOwnedCartItem(userId, itemId);

        if (item.getProduct().getStock() < request.quantity()) {
            throw new InsufficientStockException(
                    "Stok produk '" + item.getProduct().getName() + "' tidak cukup. Tersedia: "
                            + item.getProduct().getStock());
        }

        item.setQuantity(request.quantity());

        Cart cart = cartRepository.findByUserIdWithItems(userId).orElseThrow();
        return CartMapper.toDto(cart);
    }

    @Override
    public CartDto removeItem(Long userId, Long itemId) {
        CartItem item = getOwnedCartItem(userId, itemId);
        Cart cart = item.getCart();
        cart.getItems().remove(item); // hapus dari list in-memory dulu
        cartItemRepository.delete(item); // baru hapus dari database

        return CartMapper.toDto(cart);
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart tidak ditemukan"));
        cart.getItems().clear(); // orphanRemoval = true di entity Cart akan otomatis hapus dari DB
    }

    // ==== Helper methods privat ====

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
        // bukan cart item milik user lain (mencegah IDOR - Insecure Direct Object
        // Reference)
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