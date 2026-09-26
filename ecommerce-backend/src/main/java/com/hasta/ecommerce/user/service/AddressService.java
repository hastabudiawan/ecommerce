package com.hasta.ecommerce.user.service;

import com.hasta.ecommerce.user.dto.AddressDto;
import com.hasta.ecommerce.user.dto.CreateAddressRequest;
import java.util.List;

public interface AddressService {
    List<AddressDto> getMyAddresses(Long userId);
    AddressDto create(Long userId, CreateAddressRequest request);
    void delete(Long userId, Long addressId);
}