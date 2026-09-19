package com.urbantwin.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "zones")
public class Zone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "zone_id", nullable = false, unique = true, length = 64)
    private String zoneId;

    @Column(nullable = false)
    private String name;

    @Column
    private String city;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "center_lat")
    private Double centerLat;

    @Column(name = "center_lng")
    private Double centerLng;

    @Column(name = "base_elevation")
    private Double baseElevation;

    @Column(name = "area_km2")
    private Double areaKm2;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void onCreate() { createdAt = Instant.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getZoneId() { return zoneId; }
    public void setZoneId(String zoneId) { this.zoneId = zoneId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getCenterLat() { return centerLat; }
    public void setCenterLat(Double centerLat) { this.centerLat = centerLat; }
    public Double getCenterLng() { return centerLng; }
    public void setCenterLng(Double centerLng) { this.centerLng = centerLng; }
    public Double getBaseElevation() { return baseElevation; }
    public void setBaseElevation(Double baseElevation) { this.baseElevation = baseElevation; }
    public Double getAreaKm2() { return areaKm2; }
    public void setAreaKm2(Double areaKm2) { this.areaKm2 = areaKm2; }
    public Instant getCreatedAt() { return createdAt; }
}
