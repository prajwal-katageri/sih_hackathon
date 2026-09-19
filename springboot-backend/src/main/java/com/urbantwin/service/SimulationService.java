package com.urbantwin.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.urbantwin.entity.FloodResult;
import com.urbantwin.entity.Simulation;
import com.urbantwin.entity.Zone;
import com.urbantwin.repository.FloodResultRepository;
import com.urbantwin.repository.SimulationRepository;
import com.urbantwin.repository.ZoneRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SimulationService {

    private static final Logger log = LoggerFactory.getLogger(SimulationService.class);

    private final SimulationRepository simRepo;
    private final FloodResultRepository floodRepo;
    private final ZoneRepository zoneRepo;
    private final FlaskClientService flaskClient;
    private final ObjectMapper objectMapper;

    public SimulationService(SimulationRepository simRepo,
                             FloodResultRepository floodRepo,
                             ZoneRepository zoneRepo,
                             FlaskClientService flaskClient,
                             ObjectMapper objectMapper) {
        this.simRepo = simRepo;
        this.floodRepo = floodRepo;
        this.zoneRepo = zoneRepo;
        this.flaskClient = flaskClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> runSimulation(Map<String, Object> payload) {
        String zoneId = (String) payload.getOrDefault("zoneId", "unknown");
        String changeType = (String) payload.getOrDefault("changeType", "NEW_CONSTRUCTION");

        // Enrich payload with zone elevation/coords from DB if not provided
        Optional<Zone> zoneOpt = zoneRepo.findByZoneId(zoneId);
        zoneOpt.ifPresent(zone -> {
            if (!payload.containsKey("baseElevation") && zone.getBaseElevation() != null) {
                payload.put("baseElevation", zone.getBaseElevation());
            }
            if (!payload.containsKey("centerLat") && zone.getCenterLat() != null) {
                payload.put("centerLat", zone.getCenterLat());
                payload.put("centerLng", zone.getCenterLng());
            }
        });

        // Create and persist simulation record
        Simulation sim = new Simulation();
        sim.setZoneId(zoneId);
        sim.setChangeType(changeType);
        sim.setStatus("RUNNING");
        try {
            sim.setPayloadJson(objectMapper.writeValueAsString(payload));
        } catch (JsonProcessingException e) {
            sim.setPayloadJson("{}");
        }
        sim = simRepo.save(sim);
        final Long simId = sim.getId();

        try {
            // Call Python Flask simulation engine
            Map<String, Object> result = flaskClient.runCombinedSimulation(payload);

            // Persist flood result
            Map<String, Object> floodRisk = (Map<String, Object>) result.get("floodRisk");
            if (floodRisk != null) {
                FloodResult fr = new FloodResult();
                fr.setSimulationId(simId);
                fr.setRiskScore(toInt(floodRisk.get("riskScore")));
                fr.setRiskLevel((String) floodRisk.get("riskLevel"));
                fr.setEstMaxWaterDepthM(toDouble(floodRisk.get("estMaxWaterDepthM")));
                fr.setAffectedAreaKm2(toDouble(floodRisk.get("affectedAreaKm2")));
                fr.setBuildingsAtRiskCount(toInt(floodRisk.get("buildingsAtRiskCount")));
                fr.setMajorWaterloggingPointsCount(toInt(floodRisk.get("majorWaterloggingPointsCount")));
                try {
                    fr.setContributingFactorsJson(objectMapper.writeValueAsString(floodRisk.get("contributingFactors")));
                } catch (JsonProcessingException ignored) {}
                floodRepo.save(fr);
                log.info("[SIM] FloodResult saved for simId={} riskScore={}", simId, fr.getRiskScore());
            }

            // Update simulation record to COMPLETED
            Object simCode = result.get("simulationCode");
            sim.setSimulationCode(simCode != null ? simCode.toString() : "SIM-" + simId);
            sim.setStatus("COMPLETED");
            sim.setCompletedAt(Instant.now());
            simRepo.save(sim);

            result.put("dbSimulationId", simId);
            return result;

        } catch (Exception e) {
            log.error("[SIM ERROR] simId={} error={}", simId, e.getMessage(), e);
            sim.setStatus("FAILED");
            simRepo.save(sim);
            throw new RuntimeException("Simulation failed: " + e.getMessage(), e);
        }
    }

    public List<Simulation> getSimulationsByZone(String zoneId) {
        return simRepo.findByZoneIdOrderByCreatedAtDesc(zoneId);
    }

    public List<Simulation> getAllSimulations() {
        return simRepo.findAll();
    }

    private Integer toInt(Object val) {
        if (val == null) return null;
        if (val instanceof Number n) return n.intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return null; }
    }

    private Double toDouble(Object val) {
        if (val == null) return null;
        if (val instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return null; }
    }
}
