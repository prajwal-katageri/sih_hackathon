package com.urbantwin.controller;

import com.urbantwin.dto.ApiResponse;
import com.urbantwin.entity.Simulation;
import com.urbantwin.service.SimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/simulations")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostMapping("/run")
    public ResponseEntity<ApiResponse<Map<String, Object>>> runSimulation(
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> result = simulationService.runSimulation(payload);
        return ResponseEntity.ok(ApiResponse.ok("Simulation completed successfully", result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Simulation>>> getAllSimulations() {
        return ResponseEntity.ok(ApiResponse.ok(simulationService.getAllSimulations()));
    }

    @GetMapping("/zone/{zoneId}")
    public ResponseEntity<ApiResponse<List<Simulation>>> getByZone(@PathVariable String zoneId) {
        return ResponseEntity.ok(ApiResponse.ok(simulationService.getSimulationsByZone(zoneId)));
    }
}
