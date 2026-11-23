package com.rideshare.app;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RideRepo extends JpaRepository<Ride, Long> {
    List<Ride> findByStatusAndAvailableSeatsGreaterThan(String status, int seats);
    List<Ride> findByDriverId(Long id);
    List<Ride> findAllByOrderByDepartureDesc();
}
