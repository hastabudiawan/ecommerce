package com.hasta.ecommerce.settlement.controller;

import com.hasta.ecommerce.common.response.ApiResponse;
import com.hasta.ecommerce.common.response.PageResponse;
import com.hasta.ecommerce.security.SecurityUtils;
import com.hasta.ecommerce.settlement.dto.SettlementDto;
import com.hasta.ecommerce.settlement.dto.SettlementSummaryDto;
import com.hasta.ecommerce.settlement.entity.SettlementStatus;
import com.hasta.ecommerce.settlement.service.SettlementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @GetMapping("/seller/settlements")
    public ResponseEntity<ApiResponse<PageResponse<SettlementDto>>> getMySettlements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long sellerId = SecurityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<SettlementDto> result = settlementService.getMySettlements(sellerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(result)));
    }

    @GetMapping("/seller/settlements/summary")
    public ResponseEntity<ApiResponse<SettlementSummaryDto>> getMySummary() {
        Long sellerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(settlementService.getMySummary(sellerId)));
    }

    @PutMapping("/admin/settlements/{id}/release")
    public ResponseEntity<ApiResponse<SettlementDto>> release(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Settlement berhasil dicairkan", settlementService.release(id)));
    }

    @GetMapping("/admin/settlements")
    public ResponseEntity<ApiResponse<PageResponse<SettlementDto>>> getForAdmin(
            @RequestParam(required = false) SettlementStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<SettlementDto> result = settlementService.getAllForAdmin(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(new PageResponse<>(result)));
    }
}