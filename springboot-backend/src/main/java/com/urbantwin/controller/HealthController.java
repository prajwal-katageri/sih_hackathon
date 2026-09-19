package com.urbantwin.controller;

import com.urbantwin.dto.ApiResponse;
import com.urbantwin.service.FlaskClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final FlaskClientService flaskClient;

    public HealthController(FlaskClientService flaskClient) {
        this.flaskClient = flaskClient;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> data = new HashMap<>();
        data.put("service", "UrbanTwin Spring Boot Gateway");
        data.put("status", "online");
        data.put("timestamp", Instant.now().toString());
        data.put("database", "postgresql");

        try {
            Map<String, Object> simHealth = flaskClient.getSimEngineHealth();
            data.put("simulationEngine", simHealth);
        } catch (Exception e) {
            data.put("simulationEngine", Map.of("status", "unreachable", "error", e.getMessage()));
        }

        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
