package com.hasta.ecommerce.user.service;

import com.hasta.ecommerce.user.dto.AddressDto;
import com.hasta.ecommerce.user.dto.CreateAddressRequest;

import java.util.List;

public interface AddressService {
    List<AddressDto> getMyAddresses(Long userId);
    AddressDto create(Long userId, CreateAddressRequest request);
    AddressDto update(Long userId, Long addressId, CreateAddressRequest request);
    AddressDto setDefault(Long userId, Long addressId);
    void delete(Long userId, Long addressId);
}