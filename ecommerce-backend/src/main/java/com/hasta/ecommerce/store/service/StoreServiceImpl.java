package com.hasta.ecommerce.store.service;

import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.common.util.SlugGenerator;
import com.hasta.ecommerce.store.dto.CreateStoreRequest;
import com.hasta.ecommerce.store.dto.StoreDto;
import com.hasta.ecommerce.store.dto.StoreMapper;
import com.hasta.ecommerce.store.entity.Store;
import com.hasta.ecommerce.store.repository.StoreRepository;
import com.hasta.ecommerce.user.entity.User;
import com.hasta.ecommerce.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    public StoreServiceImpl(StoreRepository storeRepository, UserRepository userRepository) {
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public StoreDto createStore(Long sellerId, CreateStoreRequest request) {
        if (storeRepository.existsBySellerId(sellerId)) {
            throw new BadRequestException("Anda sudah punya toko, tidak bisa membuat toko lagi");
        }

        User seller = userRepository.findByIdOrThrow(sellerId);

        String baseSlug = SlugGenerator.generate(request.storeName());
        String slug = ensureUniqueSlug(baseSlug);

        Store store = new Store(seller, request.storeName(), slug, request.description(), request.city());
        Store saved = storeRepository.save(store);
        return StoreMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public StoreDto getMyStore(Long sellerId) {
        Store store = storeRepository.findBySellerId(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Anda belum punya toko"));
        return StoreMapper.toDto(store);
    }

    @Override
    @Transactional(readOnly = true)
    public StoreDto getBySlug(String slug) {
        Store store = storeRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Toko dengan slug '" + slug + "' tidak ditemukan"));
        return StoreMapper.toDto(store);
    }

    private String ensureUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (storeRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }
}