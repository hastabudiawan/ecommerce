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
        return addressRepository.findByUserIdAndActiveTrue(userId).stream()
                .map(AddressMapper::toDto)
                .toList();
    }

    @Override
    public AddressDto create(Long userId, CreateAddressRequest request) {
        User user = userRepository.findByIdOrThrow(userId);

        // Alamat pertama otomatis jadi alamat utama
        boolean first = addressRepository.findByUserIdAndActiveTrue(userId).isEmpty();
        boolean makeDefault = request.isDefault() || first;
        if (makeDefault) {
            clearDefaults(userId);
        }

        Address saved = addressRepository.save(build(user, request, makeDefault));
        return AddressMapper.toDto(saved);
    }

    @Override
    public AddressDto update(Long userId, Long addressId, CreateAddressRequest request) {
        Address old = findOwnedActive(userId, addressId);
        boolean makeDefault = request.isDefault() || old.isDefault();

        // Alamat lama diarsipkan, tidak diubah di tempat, supaya pesanan lama
        // yang merujuknya tetap menampilkan alamat yang dulu dipakai
        old.setActive(false);
        old.setDefault(false);

        if (makeDefault) {
            clearDefaults(userId);
        }

        Address saved = addressRepository.save(build(old.getUser(), request, makeDefault));
        return AddressMapper.toDto(saved);
    }

    @Override
    public AddressDto setDefault(Long userId, Long addressId) {
        Address address = findOwnedActive(userId, addressId);
        clearDefaults(userId);
        address.setDefault(true);
        return AddressMapper.toDto(address);
    }

    @Override
    public void delete(Long userId, Long addressId) {
        Address address = findOwnedActive(userId, addressId);
        boolean wasDefault = address.isDefault();

        address.setActive(false);
        address.setDefault(false);

        // Kalau yang dihapus adalah alamat utama, alamat aktif lain (kalau ada) naik jadi utama
        if (wasDefault) {
            addressRepository.findByUserIdAndActiveTrue(userId).stream()
                    .findFirst()
                    .ifPresent(a -> a.setDefault(true));
        }
    }

    private Address findOwnedActive(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address dengan id " + addressId + " tidak ditemukan"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address ini bukan milik Anda");
        }
        if (!address.isActive()) {
            throw new ResourceNotFoundException("Address dengan id " + addressId + " sudah dihapus");
        }
        return address;
    }

    private void clearDefaults(Long userId) {
        addressRepository.findByUserIdAndActiveTrue(userId).forEach(a -> a.setDefault(false));
    }

    private Address build(User user, CreateAddressRequest request, boolean isDefault) {
        Address address = new Address();
        address.setUser(user);
        address.setRecipientName(request.recipientName());
        address.setPhone(request.phone());
        address.setAddressLine(request.addressLine());
        address.setCity(request.city());
        address.setProvince(request.province());
        address.setPostalCode(request.postalCode());
        address.setDefault(isDefault);
        return address;
    }
}