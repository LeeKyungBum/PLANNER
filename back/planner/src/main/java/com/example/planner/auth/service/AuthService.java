package com.example.planner.auth.service;

import com.example.planner.auth.dto.LoginDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class AuthService {

    @Value("${firebase.api.key}")
    private String firebaseApiKey;

    private final ObjectMapper mapper = new ObjectMapper();

    // 회원가입
    public String registerUser(LoginDTO loginDTO) throws Exception {
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(loginDTO.getEmail())
                .setPassword(loginDTO.getPassword())
                .setDisplayName(loginDTO.getName())
                .setPhoneNumber("+82" + loginDTO.getPhone().substring(1)); // 파이어 베이스에 저장하기 위해 +82

        UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
        return userRecord.getUid();
    }

    // 로그인 (Firebase REST API 호출)
    public JsonNode loginUser(String email, String password) throws Exception {
        String endpoint = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + firebaseApiKey;
        URL url = new URL(endpoint);

        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        String body = String.format("{\"email\":\"%s\",\"password\":\"%s\",\"returnSecureToken\":true}", email, password);
        try (OutputStream os = conn.getOutputStream()) {
            os.write(body.getBytes());
        }

        JsonNode response = mapper.readTree(conn.getInputStream());
        return response;
    }
}