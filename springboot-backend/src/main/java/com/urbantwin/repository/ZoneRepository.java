package com.urbantwin.repository;

import com.urbantwin.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ZoneRepository extends JpaRepository<Zone, Long> {
    Optional<Zone> findByZoneId(String zoneId);
}
