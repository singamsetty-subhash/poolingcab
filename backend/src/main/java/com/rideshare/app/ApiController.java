package com.rideshare.app;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final UserRepo users;
    private final DriverRepo drivers;
    private final RideRepo rides;
    private final BookingRepo bookings;
    private final PoolRepo pools;
    private final PoolMemberRepo members;
    private final PaymentRepo payments;
    private final TokenService tokens;
    private final DriverVerificationProvider verification;
    private final OnlinePaymentProvider onlinePayment;
    private final NotificationProvider notifications;
    private final MapsRouteProvider maps;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    private final String adminEmail;
    private final String adminPassword;

    public ApiController(
            UserRepo u,
            DriverRepo d,
            RideRepo r,
            BookingRepo b,
            PoolRepo p,
            PoolMemberRepo m,
            PaymentRepo pay,
            TokenService t,
            DriverVerificationProvider verification,
            OnlinePaymentProvider onlinePayment,
            NotificationProvider notifications,
            MapsRouteProvider maps,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword) {
        this.users = u;
        this.drivers = d;
        this.rides = r;
        this.bookings = b;
        this.pools = p;
        this.members = m;
        this.payments = pay;
        this.tokens = t;
        this.verification = verification;
        this.onlinePayment = onlinePayment;
        this.notifications = notifications;
        this.maps = maps;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    record Register(@NotBlank String name, @Email String email, @NotBlank String password, String phone) {
    }

    record Login(@Email String email, @NotBlank String password) {
    }

    record DriverForm(@NotBlank String licenseNumber, @NotBlank String vehicleMake, @NotBlank String vehicleModel,
            @NotBlank String vehiclePlate, @Min(2) @Max(12) int vehicleSeats) {
    }

    record RideForm(@NotBlank String origin, @NotBlank String destination, @NotBlank String departure, int seats,
            @Positive double pricePerSeat, String notes, String vehicleMake, String vehicleModel, String vehiclePlate) {
    }

    record BookingForm(int seats, @NotBlank String paymentMethod) {
    }

    record PoolForm(@NotBlank String origin, @NotBlank String destination, @NotBlank String departure, int seats,
            @Positive double targetPrice, String notes, String vehicleMake, String vehicleModel, String vehiclePlate) {
    }

    record OfferForm(@NotBlank String departure, int seats, @Positive double pricePerSeat, String notes) {
    }

    record ReviewForm(@NotBlank String decision, String note) {
    }

    record UpdateProfileForm(String name, String email, String phone, String currentPassword, String newPassword) {
    }

    record DriverUpdateForm(String licenseNumber, String vehicleMake, String vehicleModel, String vehiclePlate,
            Integer vehicleSeats) {
    }

    @GetMapping("/maps/route")
    public Object getRoute(@RequestParam String origin, @RequestParam String destination) {
        return maps.estimateRoute(origin, destination);
    }

    @GetMapping("/maps/config")
    public Object getMapsConfig() {
        return Map.of(
                "provider", "OpenStreetMap",
                "type", "Free & Open Source (OSM / OSRM)",
                "free", true,
                "requiresKey", false,
                "status", "ACTIVE");
    }

    @PostMapping("/auth/register")
    public Object register(@Valid @RequestBody Register q) {
        if (users.findByEmail(q.email().toLowerCase()).isPresent()) {
            return err(409, "Email already registered");
        }
        User u = users.save(new User(q.name(), q.email().toLowerCase(), q.phone(), encoder.encode(q.password())));
        return Map.of("token", tokens.issue(u), "user", view(u));
    }

    @PostMapping("/auth/login")
    public Object login(@Valid @RequestBody Login q) {
        User u = users.findByEmail(q.email().toLowerCase()).orElse(null);
        if (u == null && q.email().equalsIgnoreCase(adminEmail) && q.password().equals(adminPassword)) {
            u = users.save(new User("Administrator", adminEmail, null, encoder.encode(adminPassword)));
            u.role = "ADMIN";
            u = users.save(u);
        }
        if (u == null || !encoder.matches(q.password(), u.passwordHash)) {
            return err(401, "Invalid email or password");
        }
        return Map.of("token", tokens.issue(u), "user", view(u));
    }

    @GetMapping("/me")
    public Object me(@RequestHeader(value = "Authorization", required = false) String a) {
        User u = auth(a);
        return u == null ? err(401, "Sign in required") : view(u);
    }

    @GetMapping("/me/profile")
    public Object profile(@RequestHeader(value = "Authorization", required = false) String a) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        long bookingsCount = bookings.findByPassengerId(u.id).size();
        long ridesCount = rides.findByDriverId(u.id).size();
        Driver d = drivers.findByUserId(u.id).orElse(null);
        Map<String, Object> driverMap = d != null ? Map.of(
                "id", d.id,
                "licenseNumber", d.licenseNumber != null ? d.licenseNumber : "",
                "vehicleMake", d.vehicleMake != null ? d.vehicleMake : "",
                "vehicleModel", d.vehicleModel != null ? d.vehicleModel : "",
                "vehiclePlate", d.vehiclePlate != null ? d.vehiclePlate : "",
                "vehicleSeats", d.vehicleSeats != null ? d.vehicleSeats : 4,
                "verificationStatus", d.verificationStatus != null ? d.verificationStatus : "PENDING_REVIEW",
                "verificationNote", d.verificationNote != null ? d.verificationNote : "") : null;

        Map<String, Object> res = new HashMap<>();
        res.put("id", u.id);
        res.put("name", u.name != null ? u.name : "");
        res.put("email", u.email != null ? u.email : "");
        res.put("phone", u.phone != null ? u.phone : "");
        res.put("role", u.role != null ? u.role : "USER");
        res.put("active", u.active);
        res.put("totalBookings", bookingsCount);
        res.put("totalRides", ridesCount);
        res.put("isDriver", d != null);
        if (driverMap != null) {
            res.put("driver", driverMap);
        }
        return res;
    }

    @PutMapping("/me")
    public Object updateProfile(@RequestHeader(value = "Authorization", required = false) String a,
            @RequestBody UpdateProfileForm q) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");

        if (q.name() != null && !q.name().trim().isBlank()) {
            u.name = q.name().trim();
        }

        if (q.phone() != null) {
            u.phone = q.phone().trim();
        }

        if (q.email() != null && !q.email().trim().isBlank() && !q.email().equalsIgnoreCase(u.email)) {
            String newEmail = q.email().trim().toLowerCase();
            if (users.findByEmail(newEmail).isPresent()) {
                return err(409, "Email is already registered by another account");
            }
            u.email = newEmail;
        }

        if (q.newPassword() != null && !q.newPassword().isBlank()) {
            if (q.newPassword().length() < 6) {
                return err(400, "New password must be at least 6 characters long");
            }
            if (u.passwordHash != null && !u.passwordHash.isBlank()) {
                if (q.currentPassword() == null || !encoder.matches(q.currentPassword(), u.passwordHash)) {
                    return err(400, "Current password does not match");
                }
            }
            u.passwordHash = encoder.encode(q.newPassword());
        }

        u = users.save(u);
        return Map.of(
                "message", "Profile updated successfully",
                "token", tokens.issue(u),
                "user", view(u));
    }

    @PostMapping("/drivers/register")
    public Object driver(@RequestHeader(value = "Authorization", required = false) String a,
            @Valid @RequestBody DriverForm q) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        if (drivers.findByUserId(u.id).isPresent())
            return err(409, "Driver profile already exists");
        Driver d = new Driver(u, q.licenseNumber(), q.vehicleMake(), q.vehicleModel(), q.vehiclePlate(),
                q.vehicleSeats());
        VerificationOutcome outcome = verification.verify(d);
        d.verificationStatus = outcome.status();
        d.verificationNote = outcome.note();
        return drivers.save(d);
    }

    @GetMapping("/drivers/mine")
    public Object myDriver(@RequestHeader(value = "Authorization", required = false) String a) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        return drivers.findByUserId(u.id).orElse(null);
    }

    @PutMapping("/drivers/mine")
    public Object updateDriverProfile(@RequestHeader(value = "Authorization", required = false) String a,
            @RequestBody DriverUpdateForm q) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");

        Driver d = drivers.findByUserId(u.id).orElse(null);
        if (d == null) {
            return err(404, "Driver profile not found. Please register as a driver first.");
        }

        if (q.licenseNumber() != null && !q.licenseNumber().isBlank())
            d.licenseNumber = q.licenseNumber().trim();
        if (q.vehicleMake() != null && !q.vehicleMake().isBlank())
            d.vehicleMake = q.vehicleMake().trim();
        if (q.vehicleModel() != null && !q.vehicleModel().isBlank())
            d.vehicleModel = q.vehicleModel().trim();
        if (q.vehiclePlate() != null && !q.vehiclePlate().isBlank())
            d.vehiclePlate = q.vehiclePlate().trim();
        if (q.vehicleSeats() != null && q.vehicleSeats() > 0)
            d.vehicleSeats = q.vehicleSeats();

        VerificationOutcome outcome = verification.verify(d);
        d.verificationStatus = outcome.status();
        d.verificationNote = outcome.note();

        d = drivers.save(d);
        return Map.of(
                "message", "Driver vehicle profile updated successfully",
                "driver", d);
    }

    @PostMapping("/rides")
    public Object createRide(@RequestHeader(value = "Authorization", required = false) String a,
            @Valid @RequestBody RideForm q) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        if (q.seats() < 1)
            return err(400, "Seats must be at least 1");

        // Optional vehicle registration
        Driver d = drivers.findByUserId(u.id).orElse(null);
        if (q.vehiclePlate() != null && !q.vehiclePlate().isBlank()) {
            if (d == null) {
                d = new Driver(u, "DL-OPTIONAL",
                        q.vehicleMake() != null && !q.vehicleMake().isBlank() ? q.vehicleMake().trim() : "Personal",
                        q.vehicleModel() != null && !q.vehicleModel().isBlank() ? q.vehicleModel().trim() : "Car",
                        q.vehiclePlate().trim(),
                        Math.max(q.seats() + 1, 4));
            } else {
                if (q.vehicleMake() != null && !q.vehicleMake().isBlank())
                    d.vehicleMake = q.vehicleMake().trim();
                if (q.vehicleModel() != null && !q.vehicleModel().isBlank())
                    d.vehicleModel = q.vehicleModel().trim();
                d.vehiclePlate = q.vehiclePlate().trim();
                if (q.seats() + 1 > (d.vehicleSeats != null ? d.vehicleSeats : 0))
                    d.vehicleSeats = q.seats() + 1;
            }
            d.verificationStatus = "VERIFIED";
            d.verificationNote = "Active carpool vehicle (optional registration)";
            d = drivers.save(d);
        } else if (d == null) {
            d = new Driver(u, "N/A", "Shared", "Pool Car", "KA-POOL", Math.max(q.seats() + 1, 4));
            d.verificationStatus = "VERIFIED";
            d.verificationNote = "Carpool participant (vehicle optional)";
            d = drivers.save(d);
        }

        try {
            LocalDateTime depTime;
            try {
                depTime = LocalDateTime.parse(q.departure());
            } catch (Exception parseEx) {
                depTime = LocalDateTime.now().plusHours(2);
            }
            Ride r = rides.save(new Ride(u, q.origin().trim(), q.destination().trim(), depTime, q.seats(),
                    q.pricePerSeat(), q.notes() == null ? "" : q.notes().trim()));

            try {
                PoolRequest p = new PoolRequest(u, q.origin().trim(), q.destination().trim(), depTime, q.seats(),
                        q.pricePerSeat());
                p.offeredBy = u;
                p.offeredRideId = r.id;
                p.status = "OPEN";
                p = pools.save(p);
                members.save(new PoolMember(p, u));
            } catch (Exception ignored) {
            }

            return rideView(r);
        } catch (Exception e) {
            return err(400, "Departure must use ISO local date-time format: " + e.getMessage());
        }
    }

    @GetMapping("/rides")
    public Object search(@RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination) {
        return rides.findByStatusAndAvailableSeatsGreaterThan("OPEN", 0).stream()
                .filter(r -> (origin == null || r.origin.toLowerCase().contains(origin.toLowerCase()))
                        && (destination == null || r.destination.toLowerCase().contains(destination.toLowerCase())))
                .map(this::rideView)
                .toList();
    }

    @GetMapping("/rides/mine")
    public Object mine(@RequestHeader(value = "Authorization", required = false) String a) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        return rides.findByDriverId(u.id).stream().map(this::rideView).toList();
    }

    @Transactional
    @PostMapping("/rides/{id}/bookings")
    public Object book(@RequestHeader(value = "Authorization", required = false) String a, @PathVariable Long id,
            @Valid @RequestBody BookingForm q) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        if (q.seats() < 1 || !Set.of("CASH", "ONLINE").contains(q.paymentMethod().toUpperCase())) {
            return err(400, "Choose seats and CASH or ONLINE");
        }
        Ride r = rides.findById(id).orElse(null);
        if (r == null || !"OPEN".equals(r.status))
            return err(404, "Ride unavailable");
        if (r.driver.id.equals(u.id))
            return err(400, "Drivers cannot book their own ride");
        if (r.availableSeats < q.seats())
            return err(409, "Not enough seats remain");
        r.availableSeats -= q.seats();
        if (r.availableSeats == 0)
            r.status = "FULL";
        rides.save(r);
        Booking b = new Booking(r, u, q.seats(), q.paymentMethod().toUpperCase());
        return bookings.save(b);
    }

    @Transactional
    @PatchMapping("/bookings/{id}/{decision}")
    public Object decide(@RequestHeader(value = "Authorization", required = false) String a, @PathVariable Long id,
            @PathVariable String decision) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        Booking b = bookings.findById(id).orElse(null);
        if (b == null)
            return err(404, "Booking not found");
        if (!b.ride.driver.id.equals(u.id))
            return err(403, "Only the driver can decide this booking");
        if (!"PENDING".equals(b.status))
            return err(409, "Booking already decided");
        if (decision.equalsIgnoreCase("approve")) {
            b.status = "APPROVED";
        } else if (decision.equalsIgnoreCase("reject")) {
            b.status = "REJECTED";
            Ride r = b.ride;
            r.availableSeats += b.seats;
            r.status = "OPEN";
            rides.save(r);
        } else {
            return err(400, "Decision must be approve or reject");
        }
        Booking saved = bookings.save(b);
        notifications.bookingUpdated(saved);
        return saved;
    }

    @GetMapping("/bookings/mine")
    public Object myBookings(@RequestHeader(value = "Authorization", required = false) String a) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        return bookings.findByPassengerId(u.id);
    }

    @GetMapping("/bookings/requests")
    public Object requests(@RequestHeader(value = "Authorization", required = false) String a) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        return bookings.findByRideDriverId(u.id);
    }

    @PostMapping("/pools")
    public Object pool(@RequestHeader(value = "Authorization", required = false) String a,
            @Valid @RequestBody PoolForm q) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        if (q.seats() < 1)
            return err(400, "Seats must be at least 1");

        // Optional vehicle registration
        Driver d = drivers.findByUserId(u.id).orElse(null);
        if (q.vehiclePlate() != null && !q.vehiclePlate().isBlank()) {
            if (d == null) {
                d = new Driver(u, "DL-OPTIONAL",
                        q.vehicleMake() != null && !q.vehicleMake().isBlank() ? q.vehicleMake().trim() : "Personal",
                        q.vehicleModel() != null && !q.vehicleModel().isBlank() ? q.vehicleModel().trim() : "Car",
                        q.vehiclePlate().trim(),
                        Math.max(q.seats() + 1, 4));
            } else {
                if (q.vehicleMake() != null && !q.vehicleMake().isBlank())
                    d.vehicleMake = q.vehicleMake().trim();
                if (q.vehicleModel() != null && !q.vehicleModel().isBlank())
                    d.vehicleModel = q.vehicleModel().trim();
                d.vehiclePlate = q.vehiclePlate().trim();
                if (q.seats() + 1 > (d.vehicleSeats != null ? d.vehicleSeats : 0))
                    d.vehicleSeats = q.seats() + 1;
            }
            d.verificationStatus = "VERIFIED";
            d.verificationNote = "Active carpool vehicle (optional registration)";
            d = drivers.save(d);
        } else if (d == null) {
            d = new Driver(u, "N/A", "Shared", "Pool Car", "KA-POOL", Math.max(q.seats() + 1, 4));
            d.verificationStatus = "VERIFIED";
            d.verificationNote = "Carpool participant (vehicle optional)";
            d = drivers.save(d);
        }

        try {
            LocalDateTime depTime;
            try {
                depTime = LocalDateTime.parse(q.departure());
            } catch (Exception ex) {
                depTime = LocalDateTime.now().plusHours(2);
            }

            // Create Ride so it is immediately searchable, visible, and bookable to all
            // users!
            String rideNotes = q.notes() != null && !q.notes().isBlank() ? q.notes().trim()
                    : "Community Pool started by " + (u.name != null ? u.name : "User");
            Ride r = rides.save(new Ride(u, q.origin().trim(), q.destination().trim(), depTime, q.seats(),
                    q.targetPrice(), rideNotes));

            // Create and link PoolRequest
            PoolRequest p = new PoolRequest(u, q.origin().trim(), q.destination().trim(), depTime, q.seats(),
                    q.targetPrice());
            p.offeredBy = u;
            p.offeredRideId = r.id;
            p.status = "OPEN";
            p = pools.save(p);
            members.save(new PoolMember(p, u));

            return rideView(r);
        } catch (Exception e) {
            return err(400, "Departure must use ISO local date-time format: " + e.getMessage());
        }
    }

    @GetMapping("/pools")
    public Object poolList() {
        return pools.findByStatusIn(List.of("OPEN", "OFFERED"));
    }

    @PostMapping("/pools/{id}/join")
    public Object join(@RequestHeader(value = "Authorization", required = false) String a, @PathVariable Long id) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        PoolRequest p = pools.findById(id).orElse(null);
        if (p == null || !"OPEN".equals(p.status))
            return err(404, "Pool is closed");
        if (members.existsByPoolIdAndUserId(id, u.id))
            return err(409, "Already in this pool");
        if (p.seatsJoined >= p.seatsNeeded)
            return err(409, "Pool has no more requested seats");
        members.save(new PoolMember(p, u));
        p.seatsJoined++;
        return pools.save(p);
    }

    @Transactional
    @PostMapping("/pools/{id}/offer")
    public Object offer(@RequestHeader(value = "Authorization", required = false) String a, @PathVariable Long id,
            @Valid @RequestBody OfferForm q) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        Driver d = drivers.findByUserId(u.id).orElse(null);
        if (d == null || !"VERIFIED".equals(d.verificationStatus))
            return err(403, "Verified drivers can offer rides");
        if (q.seats() < 1 || q.seats() > d.vehicleSeats)
            return err(400, "Seats exceed vehicle capacity");
        PoolRequest p = pools.findById(id).orElse(null);
        if (p == null || !"OPEN".equals(p.status))
            return err(404, "Pool is closed");
        try {
            Ride r = rides.save(new Ride(u, p.origin, p.destination, LocalDateTime.parse(q.departure()), q.seats(),
                    q.pricePerSeat(), q.notes()));
            p.status = "OFFERED";
            p.offeredBy = u;
            p.offeredRideId = r.id;
            return pools.save(p);
        } catch (Exception e) {
            return err(400, "Departure must use ISO local date-time format");
        }
    }

    @Transactional
    @PostMapping("/pools/{id}/book")
    public Object bookPool(@RequestHeader(value = "Authorization", required = false) String a, @PathVariable Long id,
            @Valid @RequestBody BookingForm q) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        if (!Set.of("CASH", "ONLINE").contains(q.paymentMethod().toUpperCase()))
            return err(400, "Choose CASH or ONLINE");
        PoolRequest p = pools.findById(id).orElse(null);
        if (p == null || !"OFFERED".equals(p.status) || p.offeredRideId == null) {
            return err(409, "A driver must offer a ride before pool members can request seats");
        }
        if (!members.existsByPoolIdAndUserId(id, u.id))
            return err(403, "Join this pool before requesting its ride");
        Ride r = rides.findById(p.offeredRideId).orElse(null);
        if (r == null || r.availableSeats < 1)
            return err(409, "No seats remain on the offered ride");
        r.availableSeats--;
        if (r.availableSeats == 0)
            r.status = "FULL";
        rides.save(r);
        return bookings.save(new Booking(r, u, 1, q.paymentMethod().toUpperCase()));
    }

    @PostMapping("/bookings/{id}/payment")
    public Object pay(@RequestHeader(value = "Authorization", required = false) String a, @PathVariable Long id) {
        User u = required(a);
        if (u == null)
            return err(401, "Sign in required");
        Booking b = bookings.findById(id).orElse(null);
        if (b == null || !b.passenger.id.equals(u.id))
            return err(404, "Booking not found");
        if (!"APPROVED".equals(b.status))
            return err(409, "Driver approval is required before payment");
        if ("CASH".equals(b.paymentMethod)) {
            b.paymentStatus = "CASH_DUE";
            bookings.save(b);
            return Map.of("status", "CASH_DUE", "message", "Pay the driver in cash at the ride");
        }
        PaymentIntent intent = onlinePayment.start(b);
        Payment payment = payments.save(new Payment(b, "ONLINE", intent.status(), intent.providerReference()));
        return Map.of("status", intent.status(), "paymentId", payment.id, "message", intent.message());
    }

    @GetMapping("/admin/overview")
    public Object overview(@RequestHeader(value = "Authorization", required = false) String a) {
        if (!admin(a))
            return err(403, "Administrator access required");
        LocalDateTime now = LocalDateTime.now();
        List<Ride> allRides = rides.findAll();
        long pastTripsCount = allRides.stream().filter(r -> r.departure != null && r.departure.isBefore(now)).count();
        long upcomingTripsCount = allRides.size() - pastTripsCount;
        List<Booking> allBookings = bookings.findAll();
        double totalRevenue = allBookings.stream()
                .filter(b -> "APPROVED".equalsIgnoreCase(b.status) || "PAID".equalsIgnoreCase(b.paymentStatus)
                        || "CASH_DUE".equalsIgnoreCase(b.paymentStatus))
                .mapToDouble(b -> b.amount)
                .sum();

        return Map.ofEntries(
                Map.entry("users", users.count()),
                Map.entry("drivers", drivers.count()),
                Map.entry("rides", allRides.size()),
                Map.entry("upcomingTrips", upcomingTripsCount),
                Map.entry("pastTrips", pastTripsCount),
                Map.entry("pools", pools.count()),
                Map.entry("bookings", allBookings.size()),
                Map.entry("payments", payments.count()),
                Map.entry("totalRevenue", totalRevenue));
    }

    @GetMapping("/admin/users")
    public Object adminUsers(@RequestHeader(value = "Authorization", required = false) String a) {
        return admin(a) ? users.findAll().stream().map(this::adminUserView).toList()
                : err(403, "Administrator access required");
    }

    @GetMapping("/admin/drivers")
    public Object adminDrivers(@RequestHeader(value = "Authorization", required = false) String a) {
        return admin(a) ? drivers.findAll() : err(403, "Administrator access required");
    }

    @GetMapping("/admin/rides")
    public Object adminRides(@RequestHeader(value = "Authorization", required = false) String a) {
        return admin(a) ? rides.findAllByOrderByDepartureDesc().stream().map(this::adminRideView).toList()
                : err(403, "Administrator access required");
    }

    @GetMapping("/admin/pools")
    public Object adminPools(@RequestHeader(value = "Authorization", required = false) String a) {
        return admin(a) ? pools.findAll().stream().map(this::adminPoolView).toList()
                : err(403, "Administrator access required");
    }

    @GetMapping("/admin/bookings")
    public Object adminBookings(@RequestHeader(value = "Authorization", required = false) String a) {
        return admin(a) ? bookings.findAllByOrderByCreatedAtDesc().stream().map(this::adminBookingView).toList()
                : err(403, "Administrator access required");
    }

    @GetMapping("/admin/payments")
    public Object adminPayments(@RequestHeader(value = "Authorization", required = false) String a) {
        return admin(a) ? payments.findAllByOrderByCreatedAtDesc().stream().map(this::adminPaymentView).toList()
                : err(403, "Administrator access required");
    }

    @PatchMapping("/admin/drivers/{id}/review")
    public Object review(@RequestHeader(value = "Authorization", required = false) String a, @PathVariable Long id,
            @Valid @RequestBody ReviewForm q) {
        if (!admin(a))
            return err(403, "Administrator access required");
        Driver d = drivers.findById(id).orElse(null);
        if (d == null)
            return err(404, "Driver profile not found");
        if (!Set.of("APPROVE", "REJECT").contains(q.decision().toUpperCase()))
            return err(400, "Decision must be APPROVE or REJECT");
        d.verificationStatus = q.decision().equalsIgnoreCase("APPROVE") ? "VERIFIED" : "REJECTED";
        d.verificationNote = q.note();
        return drivers.save(d);
    }

    private User auth(String h) {
        return h != null && h.startsWith("Bearer ") ? tokens.principal(h.substring(7), users) : null;
    }

    private User required(String h) {
        return auth(h);
    }

    private boolean admin(String h) {
        User u = auth(h);
        return u != null && "ADMIN".equals(u.role);
    }

    private Map<String, Object> err(int status, String message) {
        return Map.of("status", status, "error", message);
    }

    private Map<String, Object> view(User u) {
        return Map.of("id", u.id, "name", u.name, "email", u.email, "phone", u.phone == null ? "" : u.phone, "role",
                u.role, "active", u.active);
    }

    private Map<String, Object> adminUserView(User u) {
        long bookingsCount = bookings.findByPassengerId(u.id).size();
        long ridesCount = rides.findByDriverId(u.id).size();
        return Map.ofEntries(
                Map.entry("id", u.id),
                Map.entry("name", u.name != null ? u.name : ""),
                Map.entry("email", u.email != null ? u.email : ""),
                Map.entry("phone", u.phone == null ? "" : u.phone),
                Map.entry("role", u.role != null ? u.role : "USER"),
                Map.entry("active", u.active),
                Map.entry("totalBookings", bookingsCount),
                Map.entry("totalRides", ridesCount));
    }

    private Map<String, Object> rideView(Ride r) {
        RouteEstimate est = maps.estimateRoute(r.origin, r.destination);
        Driver d = drivers.findByUserId(r.driver.id).orElse(null);
        String vehicleInfo = (d != null && d.vehicleMake != null && !d.vehicleMake.isBlank() && !"N/A".equals(d.licenseNumber))
                ? (d.vehicleMake + " " + (d.vehicleModel != null ? d.vehicleModel : "") + (d.vehiclePlate != null && !d.vehiclePlate.isBlank() ? " (" + d.vehiclePlate + ")" : ""))
                : "Pool Car / Shared Vehicle";
        String driverPhone = r.driver.phone != null ? r.driver.phone : "";
        String driverEmail = r.driver.email != null ? r.driver.email : "";

        return Map.ofEntries(
                Map.entry("id", r.id),
                Map.entry("driverId", r.driver.id),
                Map.entry("driverName", r.driver.name != null ? r.driver.name : "Commuter"),
                Map.entry("driverEmail", driverEmail),
                Map.entry("driverPhone", driverPhone),
                Map.entry("vehicleInfo", vehicleInfo),
                Map.entry("origin", r.origin),
                Map.entry("destination", r.destination),
                Map.entry("departure", r.departure != null ? r.departure.toString() : ""),
                Map.entry("totalSeats", r.totalSeats),
                Map.entry("availableSeats", r.availableSeats),
                Map.entry("pricePerSeat", r.pricePerSeat),
                Map.entry("status", r.status),
                Map.entry("notes", r.notes == null ? "" : r.notes),
                Map.entry("distanceText", est.distanceText()),
                Map.entry("durationText", est.durationText()),
                Map.entry("mapUrl", est.mapUrl()),
                Map.entry("embedUrl", est.embedUrl()));
    }

    private Map<String, Object> adminBookingView(Booking b) {
        boolean isPast = b.ride != null && b.ride.departure != null && b.ride.departure.isBefore(LocalDateTime.now());
        RouteEstimate est = b.ride != null ? maps.estimateRoute(b.ride.origin, b.ride.destination)
                : new RouteEstimate(0, 0, "N/A", "N/A", "NONE", "", "");
        return Map.ofEntries(
                Map.entry("id", b.id),
                Map.entry("customerId", b.passenger != null ? b.passenger.id : 0L),
                Map.entry("customerName",
                        b.passenger != null && b.passenger.name != null ? b.passenger.name : "Unknown"),
                Map.entry("customerEmail", b.passenger != null && b.passenger.email != null ? b.passenger.email : ""),
                Map.entry("customerPhone", b.passenger != null && b.passenger.phone != null ? b.passenger.phone : ""),
                Map.entry("seats", b.seats),
                Map.entry("amount", b.amount),
                Map.entry("status", b.status != null ? b.status : "PENDING"),
                Map.entry("paymentMethod", b.paymentMethod != null ? b.paymentMethod : "CASH"),
                Map.entry("paymentStatus", b.paymentStatus != null ? b.paymentStatus : "UNPAID"),
                Map.entry("createdAt", b.createdAt != null ? b.createdAt.toString() : ""),
                Map.entry("rideId", b.ride != null ? b.ride.id : 0L),
                Map.entry("origin", b.ride != null && b.ride.origin != null ? b.ride.origin : ""),
                Map.entry("destination", b.ride != null && b.ride.destination != null ? b.ride.destination : ""),
                Map.entry("departure", b.ride != null && b.ride.departure != null ? b.ride.departure.toString() : ""),
                Map.entry("isPast", isPast),
                Map.entry("tripTiming", isPast ? "PAST" : "UPCOMING"),
                Map.entry("driverName",
                        b.ride != null && b.ride.driver != null && b.ride.driver.name != null ? b.ride.driver.name
                                : ""),
                Map.entry("driverEmail",
                        b.ride != null && b.ride.driver != null && b.ride.driver.email != null ? b.ride.driver.email
                                : ""),
                Map.entry("driverPhone",
                        b.ride != null && b.ride.driver != null && b.ride.driver.phone != null ? b.ride.driver.phone
                                : ""),
                Map.entry("distanceText", est.distanceText()),
                Map.entry("durationText", est.durationText()),
                Map.entry("mapUrl", est.mapUrl()),
                Map.entry("embedUrl", est.embedUrl()));
    }

    private Map<String, Object> adminRideView(Ride r) {
        boolean isPast = r.departure != null && r.departure.isBefore(LocalDateTime.now());
        RouteEstimate est = maps.estimateRoute(r.origin, r.destination);
        List<Map<String, Object>> passengers = bookings.findByRideId(r.id).stream()
                .map(b -> Map.<String, Object>ofEntries(
                        Map.entry("bookingId", b.id),
                        Map.entry("customerId", b.passenger != null ? b.passenger.id : 0L),
                        Map.entry("customerName",
                                b.passenger != null && b.passenger.name != null ? b.passenger.name : "Unknown"),
                        Map.entry("customerEmail",
                                b.passenger != null && b.passenger.email != null ? b.passenger.email : ""),
                        Map.entry("customerPhone",
                                b.passenger != null && b.passenger.phone != null ? b.passenger.phone : ""),
                        Map.entry("seats", b.seats),
                        Map.entry("amount", b.amount),
                        Map.entry("status", b.status != null ? b.status : "PENDING"),
                        Map.entry("paymentMethod", b.paymentMethod != null ? b.paymentMethod : "CASH"),
                        Map.entry("paymentStatus", b.paymentStatus != null ? b.paymentStatus : "UNPAID"),
                        Map.entry("createdAt", b.createdAt != null ? b.createdAt.toString() : "")))
                .toList();

        return Map.ofEntries(
                Map.entry("id", r.id),
                Map.entry("driverId", r.driver != null ? r.driver.id : 0L),
                Map.entry("driverName", r.driver != null && r.driver.name != null ? r.driver.name : ""),
                Map.entry("driverEmail", r.driver != null && r.driver.email != null ? r.driver.email : ""),
                Map.entry("driverPhone", r.driver != null && r.driver.phone != null ? r.driver.phone : ""),
                Map.entry("origin", r.origin != null ? r.origin : ""),
                Map.entry("destination", r.destination != null ? r.destination : ""),
                Map.entry("departure", r.departure != null ? r.departure.toString() : ""),
                Map.entry("totalSeats", r.totalSeats),
                Map.entry("availableSeats", r.availableSeats),
                Map.entry("bookedSeats", Math.max(0, r.totalSeats - r.availableSeats)),
                Map.entry("pricePerSeat", r.pricePerSeat),
                Map.entry("status", r.status != null ? r.status : "OPEN"),
                Map.entry("notes", r.notes == null ? "" : r.notes),
                Map.entry("isPast", isPast),
                Map.entry("tripTiming", isPast ? "PAST" : "UPCOMING"),
                Map.entry("passengers", passengers),
                Map.entry("passengerCount", passengers.size()),
                Map.entry("distanceText", est.distanceText()),
                Map.entry("durationText", est.durationText()),
                Map.entry("mapUrl", est.mapUrl()),
                Map.entry("embedUrl", est.embedUrl()));
    }

    private Map<String, Object> adminPoolView(PoolRequest p) {
        boolean isPast = p.departure != null && p.departure.isBefore(LocalDateTime.now());
        RouteEstimate est = maps.estimateRoute(p.origin, p.destination);
        List<Map<String, Object>> memberList = members.findByPoolId(p.id).stream().map(m -> Map.<String, Object>of(
                "memberId", m.user != null ? m.user.id : 0L,
                "memberName", m.user != null && m.user.name != null ? m.user.name : "Member",
                "memberEmail", m.user != null && m.user.email != null ? m.user.email : "",
                "memberPhone", m.user != null && m.user.phone != null ? m.user.phone : "",
                "status", m.status != null ? m.status : "JOINED")).toList();

        return Map.ofEntries(
                Map.entry("id", p.id),
                Map.entry("creatorId", p.creator != null ? p.creator.id : 0L),
                Map.entry("creatorName", p.creator != null && p.creator.name != null ? p.creator.name : "Unknown"),
                Map.entry("creatorEmail", p.creator != null && p.creator.email != null ? p.creator.email : ""),
                Map.entry("creatorPhone", p.creator != null && p.creator.phone != null ? p.creator.phone : ""),
                Map.entry("origin", p.origin != null ? p.origin : ""),
                Map.entry("destination", p.destination != null ? p.destination : ""),
                Map.entry("departure", p.departure != null ? p.departure.toString() : ""),
                Map.entry("isPast", isPast),
                Map.entry("tripTiming", isPast ? "PAST" : "UPCOMING"),
                Map.entry("seatsNeeded", p.seatsNeeded),
                Map.entry("seatsJoined", p.seatsJoined),
                Map.entry("targetPrice", p.targetPrice),
                Map.entry("status", p.status != null ? p.status : "OPEN"),
                Map.entry("offeredByDriver", p.offeredBy != null && p.offeredBy.name != null ? p.offeredBy.name : ""),
                Map.entry("offeredRideId", p.offeredRideId != null ? p.offeredRideId : 0L),
                Map.entry("members", memberList),
                Map.entry("distanceText", est.distanceText()),
                Map.entry("durationText", est.durationText()),
                Map.entry("mapUrl", est.mapUrl()),
                Map.entry("embedUrl", est.embedUrl()));
    }

    private Map<String, Object> adminPaymentView(Payment p) {
        return Map.ofEntries(
                Map.entry("id", p.id),
                Map.entry("bookingId", p.booking != null ? p.booking.id : 0L),
                Map.entry("customerName",
                        p.booking != null && p.booking.passenger != null && p.booking.passenger.name != null
                                ? p.booking.passenger.name
                                : "Customer"),
                Map.entry("customerEmail",
                        p.booking != null && p.booking.passenger != null && p.booking.passenger.email != null
                                ? p.booking.passenger.email
                                : ""),
                Map.entry("amount", p.booking != null ? p.booking.amount : 0.0),
                Map.entry("method", p.method != null ? p.method : "ONLINE"),
                Map.entry("status", p.status != null ? p.status : "PENDING"),
                Map.entry("providerReference", p.providerReference != null ? p.providerReference : ""),
                Map.entry("createdAt", p.createdAt != null ? p.createdAt.toString() : ""),
                Map.entry("route",
                        p.booking != null && p.booking.ride != null
                                ? p.booking.ride.origin + " → " + p.booking.ride.destination
                                : ""));
    }
}
