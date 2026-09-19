package com.urbantwin.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "flood_results")
public class FloodResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "simulation_id")
    private Long simulationId;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "est_max_water_depth_m")
    private Double estMaxWaterDepthM;

    @Column(name = "affected_area_km2")
    private Double affectedAreaKm2;

    @Column(name = "buildings_at_risk_count")
    private Integer buildingsAtRiskCount;

    @Column(name = "major_waterlogging_points_count")
    private Integer majorWaterloggingPointsCount;

    @Column(name = "contributing_factors_json", columnDefinition = "TEXT")
    private String contributingFactorsJson;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void onCreate() { createdAt = Instant.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSimulationId() { return simulationId; }
    public void setSimulationId(Long simulationId) { this.simulationId = simulationId; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public Double getEstMaxWaterDepthM() { return estMaxWaterDepthM; }
    public void setEstMaxWaterDepthM(Double v) { this.estMaxWaterDepthM = v; }
    public Double getAffectedAreaKm2() { return affectedAreaKm2; }
    public void setAffectedAreaKm2(Double v) { this.affectedAreaKm2 = v; }
    public Integer getBuildingsAtRiskCount() { return buildingsAtRiskCount; }
    public void setBuildingsAtRiskCount(Integer v) { this.buildingsAtRiskCount = v; }
    public Integer getMajorWaterloggingPointsCount() { return majorWaterloggingPointsCount; }
    public void setMajorWaterloggingPointsCount(Integer v) { this.majorWaterloggingPointsCount = v; }
    public String getContributingFactorsJson() { return contributingFactorsJson; }
    public void setContributingFactorsJson(String v) { this.contributingFactorsJson = v; }
    public Instant getCreatedAt() { return createdAt; }
}
