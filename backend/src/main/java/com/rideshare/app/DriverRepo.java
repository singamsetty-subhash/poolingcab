package com.rideshare.app;import org.springframework.data.jpa.repository.JpaRepository;import java.util.Optional;
public interface DriverRepo extends JpaRepository<Driver,Long>{Optional<Driver> findByUserId(Long id);}
