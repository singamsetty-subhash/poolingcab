package com.rideshare.app;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class TokenService {

    private final String secret;

    public TokenService() {
        this("local-dev-change-this-secret-before-deploying-2026");
    }

    @Autowired
    public TokenService(@Value("${app.jwt.secret:local-dev-change-this-secret-before-deploying-2026}") String secret) {
        this.secret = (secret != null && !secret.isBlank()) ? secret : "local-dev-change-this-secret-before-deploying-2026";
    }

    public String issue(User u) {
        if (u == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        String data = u.id + ":" + u.email + ":" + u.role + ":" + (System.currentTimeMillis() + 86400000L);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data.getBytes(StandardCharsets.UTF_8)) + "." + sig(data);
    }

    private String sig(String s) {
        try {
            Mac m = Mac.getInstance("HmacSHA256");
            m.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(m.doFinal(s.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Error signing token", e);
        }
    }

    public User principal(String token, UserRepo users) {
        if (token == null || token.isBlank() || users == null) {
            return null;
        }
        try {
            String[] p = token.split("\\.");
            if (p.length != 2) {
                return null;
            }
            String d = new String(Base64.getUrlDecoder().decode(p[0]), StandardCharsets.UTF_8);
            String expectedSig = sig(d);
            if (!MessageDigest.isEqual(expectedSig.getBytes(StandardCharsets.UTF_8), p[1].getBytes(StandardCharsets.UTF_8))) {
                return null;
            }
            String[] f = d.split(":");
            if (f.length < 4) {
                return null;
            }
            long expiry = Long.parseLong(f[3]);
            if (expiry < System.currentTimeMillis()) {
                return null;
            }
            long userId = Long.parseLong(f[0]);
            return users.findById(userId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}
