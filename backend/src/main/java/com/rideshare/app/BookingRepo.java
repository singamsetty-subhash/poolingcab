package com.rideshare.app;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepo extends JpaRepository<Booking, Long> {
    List<Booking> findByPassengerId(Long id);
    List<Booking> findByRideDriverId(Long id);
    List<Booking> findByRideId(Long rideId);
    List<Booking> findAllByOrderByCreatedAtDesc();
}
