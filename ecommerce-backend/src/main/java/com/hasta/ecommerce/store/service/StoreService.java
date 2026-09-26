package com.hasta.ecommerce.store.service;

import com.hasta.ecommerce.store.dto.CreateStoreRequest;
import com.hasta.ecommerce.store.dto.StoreDto;

public interface StoreService {
    StoreDto createStore(Long sellerId, CreateStoreRequest request);
    StoreDto getMyStore(Long sellerId);
    StoreDto getBySlug(String slug);
}