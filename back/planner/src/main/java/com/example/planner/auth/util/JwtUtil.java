package com.example.planner.auth.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // 사용자 정보를 포함한 JWT 생성
    public String generateToken(String uid, Map<String, Object> userClaims) {
        long now = System.currentTimeMillis();
        long expiry = now + (1000 * 60 * 60); // 1시간 유효

        return Jwts.builder()
                .setSubject(uid)
                .addClaims(userClaims) // 사용자 정보 포함
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(expiry))
                .signWith(key)
                .compact();
    }

    // JWT 검증 및 subject(uid)만 반환
    public String validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // JWT의 모든 claim을 반환하는 메서드
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
