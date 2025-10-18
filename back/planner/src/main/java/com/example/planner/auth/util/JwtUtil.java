package com.example.planner.auth.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // JWT 생성
    public String generateToken(String uid, String email) {
        long now = System.currentTimeMillis();
        long expiry = now + (1000 * 60 * 60); // 1시간 유효

        return Jwts.builder()
                .setSubject(uid)
                .claim("email", email)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(expiry))
                .signWith(key)
                .compact();
    }

    // JWT 검증 (옵션)
    public String validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
