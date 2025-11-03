package com.example.planner.auth.service;

import com.example.planner.auth.dto.LoginDTO;
import com.example.planner.auth.util.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class AuthService {

    @Value("${firebase.api.key}")
    private String firebaseApiKey;

    private final ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private JwtUtil jwtUtil;

    // 회원가입
    public String registerUser(LoginDTO loginDTO) throws Exception {
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(loginDTO.getEmail())
                .setPassword(loginDTO.getPassword())
                .setDisplayName(loginDTO.getName())
                .setPhoneNumber("+82" + loginDTO.getPhone().substring(1));

        UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);

        saveUserToFirestore(userRecord.getUid(), loginDTO);

        return userRecord.getUid();
    }

    // 로그인 (Firebase REST API + Firestore 정보 + JWT 발급)
    public Map<String, Object> loginUser(String email, String password) throws Exception {
        // Firebase 로그인 요청
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
        String uid = response.get("localId").asText();

        // Firestore에서 사용자 정보 조회
        Map<String, Object> userData = getUserFromFirestore(uid);

        // JWT 발급용 claim 구성
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", userData.get("email"));
        claims.put("name", userData.get("name"));
        claims.put("phone", userData.get("phone"));
        claims.put("affiliation", userData.get("affiliation"));

        // JWT 생성
        String token = jwtUtil.generateToken(uid, claims);

        // 응답 데이터 구성
        Map<String, Object> result = new HashMap<>();
        result.put("uid", uid);
        result.put("email", userData.get("email"));
        result.put("name", userData.get("name"));
        result.put("affiliation", userData.get("affiliation"));
        result.put("phone", userData.get("phone"));
        result.put("token", token);

        return result;
    }

    // Firestore에 사용자 정보 저장
    private void saveUserToFirestore(String uid, LoginDTO user) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();

        Map<String, Object> data = new HashMap<>();
        data.put("uid", uid);
        data.put("email", user.getEmail());
        data.put("name", user.getName());
        data.put("phone", user.getPhone());
        data.put("createdAt", System.currentTimeMillis());
        if (user.getAffiliation() != null) {
            data.put("affiliation", user.getAffiliation());
        }

        ApiFuture<com.google.cloud.firestore.WriteResult> writeResult =
                db.collection("users").document(uid).set(data);
        writeResult.get();

        //System.out.println("Firestore users 컬렉션에 회원 정보 저장 완료: " + uid);
    }

    // Firestore에서 사용자 정보 조회
    private Map<String, Object> getUserFromFirestore(String uid) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<DocumentSnapshot> future = db.collection("users").document(uid).get();
        DocumentSnapshot snapshot = future.get();

        if (snapshot.exists()) {
            return snapshot.getData();
        } else {
            throw new RuntimeException("해당 사용자의 Firestore 정보가 존재하지 않습니다.");
        }
    }
}
