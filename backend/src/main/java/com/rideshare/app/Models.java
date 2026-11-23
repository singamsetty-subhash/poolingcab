package com.rideshare.app;
import jakarta.persistence.*;import java.time.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity @Table(name="users") class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(unique=true,nullable=false) public String email; public String name; public String phone; @JsonIgnore public String passwordHash; public String role="USER"; public boolean active=true;
 public User(){} User(String n,String e,String p,String h){name=n;email=e;phone=p;passwordHash=h;}
}
@Entity @Table(name="drivers") class Driver {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; @OneToOne public User user; public String licenseNumber; public String vehicleMake; public String vehicleModel; public String vehiclePlate; public Integer vehicleSeats; public String verificationStatus="PENDING_REVIEW"; public String verificationNote="Provider credentials missing; queued for manual review.";
 public Driver(){} Driver(User u,String l,String make,String model,String plate,Integer seats){user=u;licenseNumber=l;vehicleMake=make;vehicleModel=model;vehiclePlate=plate;vehicleSeats=seats;}
}
@Entity @Table(name="rides") class Ride {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; @Version public long version; @ManyToOne public User driver; public String origin; public String destination; public LocalDateTime departure; public int totalSeats; public int availableSeats; public double pricePerSeat; public String status="OPEN"; public String notes;
 public Ride(){} Ride(User d,String o,String dest,LocalDateTime t,int seats,double price,String n){driver=d;origin=o;destination=dest;departure=t;totalSeats=seats;availableSeats=seats;pricePerSeat=price;notes=n;}
}
@Entity @Table(name="bookings") class Booking {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; @ManyToOne public Ride ride; @ManyToOne public User passenger; public int seats; public double amount; public String status="PENDING"; public String paymentMethod; public String paymentStatus="UNPAID"; public LocalDateTime createdAt=LocalDateTime.now();
 public Booking(){} Booking(Ride r,User u,int s,String m){ride=r;passenger=u;seats=s;amount=s*r.pricePerSeat;paymentMethod=m;}
}
@Entity @Table(name="pool_request") class PoolRequest {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; @Version public long version; @ManyToOne public User creator; public String origin; public String destination; public LocalDateTime departure; public int seatsNeeded; public int seatsJoined=1; public double targetPrice; public String status="OPEN"; @ManyToOne public User offeredBy; public Long offeredRideId;
 public PoolRequest(){} PoolRequest(User u,String o,String d,LocalDateTime t,int seats,double price){creator=u;origin=o;destination=d;departure=t;seatsNeeded=seats;targetPrice=price;}
}
@Entity @Table(name="pool_member") class PoolMember {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; @ManyToOne public PoolRequest pool; @ManyToOne public User user; public String status="JOINED";
 public PoolMember(){} PoolMember(PoolRequest p,User u){pool=p;user=u;}
}
@Entity @Table(name="payment") class Payment {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id; @ManyToOne public Booking booking; public String method; public String status; public String providerReference; public LocalDateTime createdAt=LocalDateTime.now();
 public Payment(){} Payment(Booking b,String m,String s,String ref){booking=b;method=m;status=s;providerReference=ref;}
}
