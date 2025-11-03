package com.example.planner.auth.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret; // application.properties에서 불러옴

    // 동적으로 Key 생성
    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // JWT 생성
    public String generateToken(String uid, Map<String, Object> userClaims) {
        long now = System.currentTimeMillis();
        long expiry = now + (1000L * 60 * 60); // 1시간 유효

        return Jwts.builder()
                .setSubject(uid)
                .addClaims(userClaims)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(expiry))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // JWT 검증 및 uid 추출
    public String validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // JWT Claims 반환
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
