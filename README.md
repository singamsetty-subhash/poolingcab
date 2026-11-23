# Commonway — Cab Pooling MVP

A responsive cab-pooling web app for public users, passengers, drivers, and administrators. It supports the two finalized pooling models: passengers request seats on driver-created rides (the driver approves each booking), and passengers create/join a pool request which a driver can offer to fulfil. Both cash and online payment paths are present. Online payments stay **pending** until a real payment-provider checkout and webhook integration is configured; this app never invents a successful charge.

## Run with Docker (MySQL 8)

Requirements: Docker Desktop with Compose enabled.

1. Copy `.env.example` to `.env` and change `ADMIN_PASSWORD` and `JWT_SECRET` before exposing the app beyond your computer.
2. From this folder run `docker compose up --build`.
3. Open [http://localhost:5173](http://localhost:5173). API docs are at [http://localhost:8080/docs](http://localhost:8080/docs).
4. Create a public account. The admin account is created on the first successful sign-in using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.
5. Register a driver profile in Driver space. With no verification provider credentials, it enters manual review. Sign in as the admin to approve it, then publish a ride.
6. As another user, request seats. The ride driver approves/rejects each request from Driver space. After approval, cash marks cash due; online creates a pending payment record and does not charge.
7. To try the other pooling model, create a pool request, join it from a second account, and let a verified driver offer a ride.

Stop the stack with `docker compose down`. `docker compose down -v` also deletes the local MySQL data.

## Run locally without Docker

Requirements: Java 17, Maven 3.9+, Node 20+.

1. Start the API with `cd backend; mvn spring-boot:run`. By default it uses an in-memory H2 database and Flyway migration.
2. In a second terminal run `cd frontend; npm install; npm run dev`.
3. Open [http://localhost:5173](http://localhost:5173). Local API docs: [http://localhost:8080/docs](http://localhost:8080/docs).

For a local MySQL run, set `DB_URL`, `DB_USER`, `DB_PASSWORD`, and `DB_DRIVER=com.mysql.cj.jdbc.Driver`. The default admin credentials are `admin@rideshare.local` / `ChangeMe123!`; set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to override them.

## Integration configuration

| Capability | Local behavior | External integration needed |
|---|---|---|
| Driver verification | Driver profile goes to admin manual review; no driver can publish until approved | `DRIVER_VERIFICATION_API_KEY` plus a provider-specific adapter and credentials |
| Online payments | An online payment attempt is recorded as `PENDING`; no success/failure is fabricated | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, checkout/session creation and verified webhook handling |
| Maps and route matching | OpenStreetMap (OSM) & OSRM routing | 100% Free & Open Source (No API key needed) |
| OTP / SMS | Not enabled; account creation uses email and password | SMS/OTP provider credentials and delivery adapter |
| Notifications | In-app status feedback only; no fake email/SMS delivery | Email/SMS provider and event delivery integration |

## Architecture and current MVP boundary

The repository is organized around the requested service responsibilities: API gateway, auth/user, driver/vehicle, ride/pooling, booking, payment, and notification. `gateway/` is a separately deployed Nginx API gateway. The runnable business API in `backend/` is currently one Spring Boot deployment with domain-separated controller/entity/repository responsibilities and one MySQL schema. This keeps this starter easy to boot locally; the domain boundaries are ready to split into independently deployed Spring Boot services, but the included MVP does **not** claim independent service deployment or per-service databases yet. API routes are grouped under `/api/auth`, `/api/drivers`, `/api/rides`, `/api/pools`, `/api/bookings`, and `/api/admin`.

```text
React/Vite web (:5173) → Nginx API gateway (:8080) → Spring Boot domain API → MySQL 8
                                                         ├ auth & user
                                                         ├ driver & vehicle verification
                                                         ├ ride & passenger-created pool
                                                         ├ driver-approved booking
                                                         ├ payment adapter boundary
                                                         └ notification adapter boundary
```

Flyway migration: `backend/src/main/resources/db/migration/V1__initial_schema.sql`. OpenAPI UI: `/docs`; OpenAPI JSON: `/v3/api-docs`.

## Safety and MVP notes

- Passwords are BCrypt-hashed; API access uses signed, expiring bearer tokens. Change the local JWT secret before sharing/deploying.
- Ride rows use optimistic versioning; seat changes run in a transaction and conflicting requests cannot quietly claim the same remaining seats.
- A booking reserves requested seats while pending; rejection releases them. Only the ride's driver can approve/reject.
- A passenger-created pool is not a confirmed ride until a verified driver offers a ride. Passengers can join the open pool request.
- Admin review is manual when automated-verification credentials are absent. Configuring a key alone does not make a provider integration; wire a provider-specific adapter before representing it as automated verification.
- MVP does not include production rate limiting, account recovery, OTP, route-distance matching, webhook signature verification, or external message delivery.
# poolingcab
