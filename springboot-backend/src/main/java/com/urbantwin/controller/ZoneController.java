package com.urbantwin.controller;

import com.urbantwin.dto.ApiResponse;
import com.urbantwin.entity.Zone;
import com.urbantwin.repository.ZoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

    private final ZoneRepository zoneRepo;

    public ZoneController(ZoneRepository zoneRepo) {
        this.zoneRepo = zoneRepo;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Zone>>> getAllZones() {
        return ResponseEntity.ok(ApiResponse.ok(zoneRepo.findAll()));
    }

    @GetMapping("/{zoneId}")
    public ResponseEntity<ApiResponse<Zone>> getZone(@PathVariable String zoneId) {
        return zoneRepo.findByZoneId(zoneId)
                .map(z -> ResponseEntity.ok(ApiResponse.ok(z)))
                .orElse(ResponseEntity.notFound().build());
    }
}
