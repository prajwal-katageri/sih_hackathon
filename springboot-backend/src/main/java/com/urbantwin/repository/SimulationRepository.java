package com.urbantwin.repository;

import com.urbantwin.entity.Simulation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SimulationRepository extends JpaRepository<Simulation, Long> {
    Optional<Simulation> findBySimulationCode(String code);
    List<Simulation> findByZoneIdOrderByCreatedAtDesc(String zoneId);
}
