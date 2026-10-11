package com.hasta.ecommerce.user.service;

import com.hasta.ecommerce.common.exception.BadRequestException;
import com.hasta.ecommerce.store.repository.StoreRepository;
import com.hasta.ecommerce.user.dto.UserDto;
import com.hasta.ecommerce.user.entity.Role;
import com.hasta.ecommerce.user.entity.User;
import com.hasta.ecommerce.user.repository.RoleRepository;
import com.hasta.ecommerce.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserAdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StoreRepository storeRepository;

    public UserAdminService(UserRepository userRepository, RoleRepository roleRepository,
                             StoreRepository storeRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.storeRepository = storeRepository;
    }

    @Transactional(readOnly = true)
    public Page<UserDto> search(String q, String role, Pageable pageable) {
        return userRepository.search(q.trim(), role, pageable).map(this::toDto);
    }

    public UserDto changeRole(Long adminId, Long targetId, String roleName) {
        if (adminId.equals(targetId)) {
            throw new BadRequestException("Tidak bisa mengubah role akunmu sendiri");
        }

        User target = userRepository.findByIdOrThrow(targetId);

        if (storeRepository.existsBySellerId(targetId)) {
            throw new BadRequestException("Akun ini punya toko, role-nya tidak bisa diubah");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new BadRequestException("Role tidak dikenal: " + roleName));

        target.setRole(role);
        return toDto(target);
    }

    public UserDto setEnabled(Long adminId, Long targetId, boolean enabled) {
        if (adminId.equals(targetId)) {
            throw new BadRequestException("Tidak bisa menonaktifkan akunmu sendiri");
        }

        User target = userRepository.findByIdOrThrow(targetId);
        target.setEnabled(enabled);
        return toDto(target);
    }

    private UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().getName(),
                user.isEnabled(),
                storeRepository.existsBySellerId(user.getId()),
                user.getCreatedAt()
        );
    }
}