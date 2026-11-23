package com.rideshare.app;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.LocalDateTime;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    WebMvcConfigurer cors(org.springframework.core.env.Environment env) {
        return new WebMvcConfigurer() {
            public void addCorsMappings(CorsRegistry r) {
                r.addMapping("/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }

    @Bean
    CommandLineRunner seedDemoData(UserRepo userRepo, DriverRepo driverRepo, RideRepo rideRepo, BookingRepo bookingRepo, PoolRepo poolRepo) {
        return args -> {
            if (userRepo.count() > 0) return;

            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            // 1. Admin account
            User admin = new User("Administrator", "admin@commonway.com", "+91 98765 00001", encoder.encode("admin123"));
            admin.role = "ADMIN";
            userRepo.save(admin);

            // 2. Verified Driver account
            User driverUser = new User("Vikram Sharma", "vikram@commonway.com", "+91 98765 11111", encoder.encode("driver123"));
            userRepo.save(driverUser);

            Driver driver = new Driver(driverUser, "DL-04-2021-0098765", "Honda", "City (AC)", "KA-01-AB-1234", 4);
            driver.verificationStatus = "VERIFIED";
            driver.verificationNote = "Documents and background check verified by Commonway Admin";
            driverRepo.save(driver);

            // 3. Customer account
            User customer = new User("Ananya Rao", "ananya@commonway.com", "+91 98765 22222", encoder.encode("user123"));
            userRepo.save(customer);

            // 4. Upcoming Rides with real OpenStreetMap routes
            LocalDateTime now = LocalDateTime.now();
            Ride ride1 = new Ride(
                    driverUser,
                    "Koramangala, Bengaluru",
                    "Whitefield IT Park, Bengaluru",
                    now.plusDays(1).withHour(8).withMinute(30),
                    3,
                    140.0,
                    "Daily tech corridor commute. AC on, quiet & comfortable."
            );
            ride1.availableSeats = 2;
            rideRepo.save(ride1);

            Ride ride2 = new Ride(
                    driverUser,
                    "Indiranagar, Bengaluru",
                    "Electronic City Phase 1, Bengaluru",
                    now.plusDays(1).withHour(9).withMinute(15),
                    3,
                    160.0,
                    "Via Elevated Expressway. Fast and punctual."
            );
            rideRepo.save(ride2);

            Ride ride3 = new Ride(
                    driverUser,
                    "Kempegowda Int'l Airport (BLR)",
                    "MG Road, Bengaluru",
                    now.plusDays(1).withHour(18).withMinute(0),
                    4,
                    250.0,
                    "Airport drop/pickup. Luggage space available."
            );
            rideRepo.save(ride3);

            // 5. Historical / Past Ride & Booking so Admin past data is immediately visible
            Ride pastRide = new Ride(
                    driverUser,
                    "HSR Layout, Bengaluru",
                    "Manyata Tech Park, Bengaluru",
                    now.minusDays(2).withHour(9).withMinute(0),
                    3,
                    150.0,
                    "Previous completed trip."
            );
            pastRide.status = "COMPLETED";
            pastRide.availableSeats = 2;
            rideRepo.save(pastRide);

            Booking pastBooking = new Booking(pastRide, customer, 1, "ONLINE");
            pastBooking.status = "APPROVED";
            pastBooking.paymentStatus = "PAID";
            bookingRepo.save(pastBooking);

            // 6. Active booking on upcoming ride1
            Booking activeBooking = new Booking(ride1, customer, 1, "CASH");
            activeBooking.status = "APPROVED";
            activeBooking.paymentStatus = "CASH_DUE";
            bookingRepo.save(activeBooking);

            // 7. Community Pool Request
            PoolRequest pool = new PoolRequest(
                    customer,
                    "Bellandur, Bengaluru",
                    "Hebbal Outer Ring Road, Bengaluru",
                    now.plusDays(2).withHour(8).withMinute(45),
                    4,
                    130.0
            );
            pool.seatsJoined = 2;
            poolRepo.save(pool);
        };
    }
}

