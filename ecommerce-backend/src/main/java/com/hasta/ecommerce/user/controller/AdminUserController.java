package com.hasta.ecommerce.user.controller;

import com.hasta.ecommerce.common.response.ApiResponse;
import com.hasta.ecommerce.common.response.PageResponse;
import com.hasta.ecommerce.security.SecurityUtils;
import com.hasta.ecommerce.user.dto.ChangeRoleRequest;
import com.hasta.ecommerce.user.dto.ChangeStatusRequest;
import com.hasta.ecommerce.user.dto.UserDto;
import com.hasta.ecommerce.user.service.UserAdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserAdminService userAdminService;

    public AdminUserController(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserDto>>> list(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "") String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserDto> result = userAdminService.search(q, role, pageable);
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(result)));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserDto>> changeRole(
            @PathVariable Long id, @Valid @RequestBody ChangeRoleRequest request) {
        Long adminId = SecurityUtils.getCurrentUserId();
        UserDto updated = userAdminService.changeRole(adminId, id, request.role());
        return ResponseEntity.ok(ApiResponse.success("Role berhasil diubah", updated));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> setStatus(
            @PathVariable Long id, @Valid @RequestBody ChangeStatusRequest request) {
        Long adminId = SecurityUtils.getCurrentUserId();
        UserDto updated = userAdminService.setEnabled(adminId, id, request.enabled());
        return ResponseEntity.ok(ApiResponse.success("Status akun berhasil diubah", updated));
    }
}