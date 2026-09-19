package com.urbantwin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class FlaskClientService {

    private static final Logger log = LoggerFactory.getLogger(FlaskClientService.class);

    @Value("${simulation.engine.url:http://localhost:5001}")
    private String simEngineUrl;

    private final RestTemplate restTemplate;

    public FlaskClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> runCombinedSimulation(Map<String, Object> payload) {
        String url = simEngineUrl + "/simulation/combined";
        log.info("[FLASK] POST {} zoneId={}", url, payload.get("zoneId"));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
        log.info("[FLASK] Response status={}", response.getStatusCode());
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> runFloodSimulation(Map<String, Object> payload) {
        String url = simEngineUrl + "/simulation/flood";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        return restTemplate.postForEntity(url, request, Map.class).getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> runEvacuationRouting(Map<String, Object> payload) {
        String url = simEngineUrl + "/routing/evacuation";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        return restTemplate.postForEntity(url, request, Map.class).getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getSimEngineHealth() {
        String url = simEngineUrl + "/health";
        return restTemplate.getForObject(url, Map.class);
    }
}
