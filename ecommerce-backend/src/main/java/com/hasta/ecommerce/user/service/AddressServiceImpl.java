package com.hasta.ecommerce.user.service;

import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.common.exception.ResourceNotFoundException;
import com.hasta.ecommerce.user.dto.AddressDto;
import com.hasta.ecommerce.user.dto.AddressMapper;
import com.hasta.ecommerce.user.dto.CreateAddressRequest;
import com.hasta.ecommerce.user.entity.Address;
import com.hasta.ecommerce.user.entity.User;
import com.hasta.ecommerce.user.repository.AddressRepository;
import com.hasta.ecommerce.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressServiceImpl(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressDto> getMyAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(AddressMapper::toDto)
                .toList();
    }

    @Override
    public AddressDto create(Long userId, CreateAddressRequest request) {
        User user = userRepository.findByIdOrThrow(userId);

        Address address = new Address();
        address.setUser(user);
        address.setRecipientName(request.recipientName());
        address.setPhone(request.phone());
        address.setAddressLine(request.addressLine());
        address.setCity(request.city());
        address.setProvince(request.province());
        address.setPostalCode(request.postalCode());
        address.setDefault(request.isDefault());

        Address saved = addressRepository.save(address);
        return AddressMapper.toDto(saved);
    }

    @Override
    public void delete(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address dengan id " + addressId + " tidak ditemukan"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address ini bukan milik Anda");
        }

        addressRepository.delete(address);
    }
}