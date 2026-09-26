package com.hasta.ecommerce.user.dto;

import com.hasta.ecommerce.user.entity.Address;

public class AddressMapper {

    private AddressMapper() {}

    public static AddressDto toDto(Address address) {
        return new AddressDto(
                address.getId(),
                address.getRecipientName(),
                address.getPhone(),
                address.getAddressLine(),
                address.getCity(),
                address.getProvince(),
                address.getPostalCode(),
                address.isDefault()
        );
    }
}