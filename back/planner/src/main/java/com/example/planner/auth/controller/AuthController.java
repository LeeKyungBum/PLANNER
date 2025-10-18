package com.example.planner.auth.controller;

import com.example.planner.auth.dto.ResponseDTO;
import com.example.planner.auth.dto.LoginDTO;
import com.example.planner.auth.service.AuthService;
import com.example.planner.auth.util.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    // 회원가입
    @PostMapping("/register")
    public ResponseEntity<ResponseDTO<?>> register(@RequestBody LoginDTO loginDTO) {
        try {
            String uid = authService.registerUser(loginDTO);
            return ResponseEntity.ok(new ResponseDTO<>(true, "회원가입 성공", uid));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(false, e.getMessage(), null));
        }
    }

    // 로그인 (이메일+비밀번호 = JWT 발급)
    @PostMapping("/login")
    public ResponseEntity<ResponseDTO<?>> login(@RequestBody LoginDTO loginDTO) {
        try {
            JsonNode firebaseResponse = authService.loginUser(loginDTO.getEmail(), loginDTO.getPassword());

            String uid = firebaseResponse.get("localId").asText();
            String email = firebaseResponse.get("email").asText();

            // JWT 생성
            String jwtToken = jwtUtil.generateToken(uid, email);

            var data = new java.util.HashMap<String, Object>();
            data.put("uid", uid);
            data.put("email", email);
            data.put("jwtToken", jwtToken);

            return ResponseEntity.ok(new ResponseDTO<>(true, "로그인 성공", data));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new ResponseDTO<>(false, "로그인 실패: " + e.getMessage(), null));
        }
    }
}