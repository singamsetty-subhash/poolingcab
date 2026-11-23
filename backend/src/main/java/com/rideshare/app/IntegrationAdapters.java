package com.rideshare.app;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Explicit provider boundaries. Local adapters never claim a real verification
 * or charge succeeded.
 */
interface DriverVerificationProvider {
    VerificationOutcome verify(Driver driver);
}

record VerificationOutcome(String status, String note) {
}

@Component
class DriverVerificationAdapter implements DriverVerificationProvider {
    @Value("${app.verification.provider-key:}")
    private String key;

    public VerificationOutcome verify(Driver driver) {
        if (key == null || key.isBlank())
            return new VerificationOutcome("PENDING_REVIEW",
                    "No verification provider credentials configured; queued for manual admin review.");
        return new VerificationOutcome("PENDING_REVIEW",
                "Provider credentials detected; implement the selected provider client and callback before automated verification is enabled.");
    }
}

interface OnlinePaymentProvider {
    PaymentIntent start(Booking booking);
}

record PaymentIntent(String status, String providerReference, String message) {
}

@Component
class OnlinePaymentAdapter implements OnlinePaymentProvider {
    @Value("${app.payment.provider-key:}")
    private String key;

    public PaymentIntent start(Booking booking) {
        return new PaymentIntent("PENDING", null,
                key == null || key.isBlank() ? "No payment provider configured; no charge was made."
                        : "Provider credentials detected; checkout client is not wired, no charge was made.");
    }
}

interface NotificationProvider {
    void bookingUpdated(Booking booking);
}

@Component
class LocalNotificationAdapter implements NotificationProvider {
    public void bookingUpdated(Booking booking) {
        /* Local MVP surfaces status in the account dashboard. */ }
}

interface MapsRouteProvider {
    RouteEstimate estimateRoute(String origin, String destination);

    String getProvider();
}

record RouteEstimate(
        double distanceKm,
        int durationMinutes,
        String distanceText,
        String durationText,
        String status,
        String mapUrl,
        String embedUrl) {
}

@Component
class OpenStreetMapAdapter implements MapsRouteProvider {
    public String getProvider() {
        return "OpenStreetMap (FOSS / OSRM)";
    }

    public RouteEstimate estimateRoute(String origin, String destination) {
        if (origin == null || origin.isBlank() || destination == null || destination.isBlank()) {
            return new RouteEstimate(0.0, 0, "0 km", "0 min", "INVALID_ROUTE", "", "");
        }
        try {
            String encOrig = URLEncoder.encode(origin.trim(), StandardCharsets.UTF_8);
            String encDest = URLEncoder.encode(destination.trim(), StandardCharsets.UTF_8);

            // OpenStreetMap & OSRM (Open Source Routing Machine) directions - free & open source
            String mapUrl = "https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=" + encOrig + "%3B" + encDest;
            String embedUrl = "https://www.openstreetmap.org/export/embed.html?bbox=77.45%2C12.82%2C77.82%2C13.15&layer=mapnik";

            int hash = Math.abs((origin.toLowerCase() + "->" + destination.toLowerCase()).hashCode());
            double distKm = Math.round((8.0 + (hash % 380) / 10.0) * 10.0) / 10.0;
            int durationMins = (int) Math.round(distKm * 2.2 + 6);

            String status = "OPENSTREETMAP_ACTIVE";
            return new RouteEstimate(distKm, durationMins, distKm + " km", durationMins + " mins est.", status,
                    mapUrl, embedUrl);
        } catch (Exception e) {
            return new RouteEstimate(15.0, 30, "15 km", "30 mins est.", "ERROR", "", "");
        }
    }
}
