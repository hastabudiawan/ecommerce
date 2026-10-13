package com.hasta.ecommerce.order.service;

import com.hasta.ecommerce.cart.entity.Cart;
import com.hasta.ecommerce.cart.entity.CartItem;
import com.hasta.ecommerce.cart.repository.CartRepository;
import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.common.exception.InsufficientStockException;
import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.common.util.OrderNumberGenerator;
import com.hasta.ecommerce.order.dto.CheckoutRequest;
import com.hasta.ecommerce.order.dto.OrderGroupDto;
import com.hasta.ecommerce.order.dto.OrderMapper;
import com.hasta.ecommerce.order.dto.StoreShippingCost;
import com.hasta.ecommerce.order.entity.Order;
import com.hasta.ecommerce.order.entity.OrderGroup;
import com.hasta.ecommerce.order.entity.OrderItem;
import com.hasta.ecommerce.order.repository.OrderGroupRepository;
import com.hasta.ecommerce.order.repository.OrderRepository;
import com.hasta.ecommerce.product.entity.Product;
import com.hasta.ecommerce.product.entity.ProductStatus;
import com.hasta.ecommerce.product.repository.ProductRepository;
import com.hasta.ecommerce.store.entity.Store;
import com.hasta.ecommerce.store.repository.StoreRepository;
import com.hasta.ecommerce.user.entity.Address;
import com.hasta.ecommerce.user.entity.User;
import com.hasta.ecommerce.user.repository.AddressRepository;
import com.hasta.ecommerce.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CheckoutServiceImpl implements CheckoutService {

    // Sentinel value: mewakili "produk platform" (tanpa toko) di dalam grouping internal.
    // Collectors.groupingBy() tidak mengizinkan null sebagai key, jadi dipakai 0L sebagai
    // penanda, karena ID toko asli selalu mulai dari 1 (BIGSERIAL).
    private static final Long PLATFORM_KEY = 0L;

    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderGroupRepository orderGroupRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;

    public CheckoutServiceImpl(CartRepository cartRepository, AddressRepository addressRepository,
                                UserRepository userRepository, OrderRepository orderRepository,
                                OrderGroupRepository orderGroupRepository, StoreRepository storeRepository,
                                ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.orderGroupRepository = orderGroupRepository;
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public OrderGroupDto checkout(Long userId, CheckoutRequest request) {

        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new BadRequestException("Cart kosong, tidak bisa checkout"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart kosong, tidak bisa checkout");
        }

        Address address = addressRepository.findById(request.addressId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address dengan id " + request.addressId() + " tidak ditemukan"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address ini bukan milik Anda");
        }
        if (!address.isActive()) {
            throw new BadRequestException("Alamat ini sudah tidak dipakai, pilih alamat lain");
        }

        User user = userRepository.findByIdOrThrow(userId);

        // LANGKAH 1: Validasi SEMUA item dulu, sebelum ada perubahan apa pun.
        // Ini pemeriksaan awal supaya pesan errornya jelas; penjaga stok yang sebenarnya
        // adalah update atomik di langkah 2.
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (product.getStatus() != ProductStatus.APPROVED) {
                throw new BadRequestException("Produk '" + product.getName()
                        + "' sudah tidak tersedia, hapus dari keranjang untuk melanjutkan");
            }
            if (product.getStock() < cartItem.getQuantity()) {
                throw new InsufficientStockException(
                        "Stok produk '" + product.getName() + "' tidak cukup. Tersedia: "
                                + product.getStock() + ", di cart: " + cartItem.getQuantity());
            }
        }

        // LANGKAH 2: Kurangi stok secara atomik. Dua checkout bersamaan untuk stok yang sama
        // tidak mungkin sama-sama berhasil. Diurutkan menurut id produk supaya dua checkout
        // dengan produk sama dalam urutan berbeda tidak saling mengunci (deadlock).
        // Kalau ada yang gagal, exception membatalkan seluruh transaksi, termasuk
        // pengurangan stok produk sebelumnya.
        cart.getItems().stream()
                .sorted(Comparator.comparing(item -> item.getProduct().getId()))
                .forEach(item -> {
                    int updated = productRepository.decreaseStock(
                            item.getProduct().getId(), item.getQuantity());
                    if (updated == 0) {
                        throw new InsufficientStockException("Stok produk '"
                                + item.getProduct().getName()
                                + "' tidak cukup. Stoknya baru saja berubah, coba lagi.");
                    }
                });

        // LANGKAH 3: Kelompokkan cart items berdasarkan toko.
        // PLATFORM_KEY dipakai buat produk tanpa toko, karena groupingBy tidak boleh pakai null.
        Map<Long, List<CartItem>> groupedByStore = cart.getItems().stream()
                .collect(Collectors.groupingBy(item -> {
                    Store store = item.getProduct().getStore();
                    return store != null ? store.getId() : PLATFORM_KEY;
                }, LinkedHashMap::new, Collectors.toList()));

        // LANGKAH 4: Siapkan lookup shipping cost per toko dari request.
        // storeId null dari client (representasi platform di sisi API) dipetakan ke PLATFORM_KEY juga.
        Map<Long, BigDecimal> shippingLookup = new HashMap<>();
        if (request.shippingCosts() != null) {
            for (StoreShippingCost sc : request.shippingCosts()) {
                Long key = sc.storeId() != null ? sc.storeId() : PLATFORM_KEY;
                shippingLookup.put(key, sc.shippingCost());
            }
        }

        // LANGKAH 5: Buat 1 Order per toko
        List<Order> createdOrders = new ArrayList<>();
        BigDecimal groupSubtotal = BigDecimal.ZERO;
        BigDecimal groupShippingCost = BigDecimal.ZERO;

        for (Map.Entry<Long, List<CartItem>> entry : groupedByStore.entrySet()) {
            Long storeId = entry.getKey();
            List<CartItem> items = entry.getValue();

            // PLATFORM_KEY berarti tidak ada toko sungguhan - store tetap null di Order
            Store store = storeId.equals(PLATFORM_KEY)
                    ? null
                    : storeRepository.findById(storeId).orElse(null);

            BigDecimal storeSubtotal = items.stream()
                    .map(i -> i.getPriceSnapshot().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal storeShippingCost = shippingLookup.getOrDefault(storeId, BigDecimal.ZERO);
            BigDecimal storeTotal = storeSubtotal.add(storeShippingCost);

            Order order = new Order(user, address, OrderNumberGenerator.generate(),
                    storeSubtotal, storeShippingCost, storeTotal);
            order.setStore(store);

            for (CartItem cartItem : items) {
                Product product = cartItem.getProduct();
                BigDecimal itemSubtotal = cartItem.getPriceSnapshot()
                        .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

                OrderItem orderItem = new OrderItem(
                        product, product.getName(), cartItem.getPriceSnapshot(),
                        cartItem.getQuantity(), itemSubtotal
                );
                order.addItem(orderItem);
            }

            createdOrders.add(order);
            groupSubtotal = groupSubtotal.add(storeSubtotal);
            groupShippingCost = groupShippingCost.add(storeShippingCost);
        }

        BigDecimal groupTotal = groupSubtotal.add(groupShippingCost);

        // LANGKAH 6: Buat OrderGroup, lalu simpan, baru kaitkan tiap Order ke group ini
        OrderGroup orderGroup = new OrderGroup(user, address, OrderNumberGenerator.generateGroupNumber(),
                groupSubtotal, groupShippingCost, groupTotal);
        OrderGroup savedGroup = orderGroupRepository.save(orderGroup);

        for (Order order : createdOrders) {
            order.setOrderGroup(savedGroup);
            orderRepository.save(order);
        }

        // LANGKAH 7: Kosongkan cart
        cart.getItems().clear();

        return OrderMapper.toGroupDto(savedGroup, createdOrders);
    }
}