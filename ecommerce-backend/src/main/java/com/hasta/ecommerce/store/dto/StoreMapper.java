package com.hasta.ecommerce.store.dto;

import com.hasta.ecommerce.store.entity.Store;

public class StoreMapper {
    private StoreMapper() {}

    public static StoreDto toDto(Store store) {
        return new StoreDto(store.getId(), store.getStoreName(), store.getSlug(),
                store.getDescription(), store.getCity());
    }
}