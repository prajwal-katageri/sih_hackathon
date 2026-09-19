package com.urbantwin.repository;

import com.urbantwin.entity.FloodResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FloodResultRepository extends JpaRepository<FloodResult, Long> {
    List<FloodResult> findBySimulationId(Long simulationId);
}
