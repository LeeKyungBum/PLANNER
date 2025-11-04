package com.example.planner.portfolio.controller;

import com.example.planner.auth.dto.ResponseDTO;
import com.example.planner.auth.util.JwtUtil;
import com.example.planner.portfolio.dto.PortfolioDTO;
import com.example.planner.portfolio.service.PortfolioService;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;

import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/portfolio")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"}, allowCredentials = "true")
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/upload")
    public ResponseEntity<ResponseDTO<?>> uploadPortfolio(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("file") MultipartFile file) {

        try {
            String token = authorizationHeader.substring(7);
            Claims claims = jwtUtil.getClaims(token);
            String uid = claims.getSubject();

            String id = portfolioService.uploadPortfolio(uid, title, description, file);
            return ResponseEntity.ok(new ResponseDTO<>(true, "포트폴리오 업로드 성공", id));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ResponseDTO<>(false, "업로드 실패: " + e.getMessage(), null));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<ResponseDTO<?>> getPortfolioList(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.badRequest().body(new ResponseDTO<>(false, "토큰이 없습니다.", null));

            String token = authHeader.substring(7);
            String uid = jwtUtil.validateToken(token);

            Firestore db = FirestoreClient.getFirestore();

            // Firestore에서 uid로 필터링된 포트폴리오 가져오기
            ApiFuture<QuerySnapshot> future = db.collection("portfolio")
                    .whereEqualTo("uid", uid)
                    .orderBy("createdAt", Query.Direction.DESCENDING)
                    .get();

            List<QueryDocumentSnapshot> docs = future.get().getDocuments();
            List<Map<String, Object>> list = new ArrayList<>();

            for (QueryDocumentSnapshot doc : docs) {
                Map<String, Object> item = doc.getData();
                item.put("id", doc.getId());
                list.add(item);
            }

            return ResponseEntity.ok(new ResponseDTO<>(true, "포트폴리오 목록 조회 성공", list));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ResponseDTO<>(false, "목록 조회 실패: " + e.getMessage(), null));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseDTO<?>> updatePortfolio(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable String id,
            @RequestBody PortfolioDTO dto) {
        try {
            String token = authorizationHeader.substring(7);
            String uid = jwtUtil.validateToken(token);

            Firestore db = FirestoreClient.getFirestore();
            DocumentReference docRef = db.collection("portfolio").document(id);

            DocumentSnapshot doc = docRef.get().get();
            if (!doc.exists()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>(false, "해당 문서를 찾을 수 없습니다.", null));
            }

            if (!uid.equals(doc.getString("uid"))) {
                return ResponseEntity.status(403).body(new ResponseDTO<>(false, "본인만 수정할 수 있습니다.", null));
            }

            ApiFuture<WriteResult> future = docRef.update(
                    "title", dto.getTitle(),
                    "description", dto.getDescription()
            );

            return ResponseEntity.ok(new ResponseDTO<>(true, "수정 성공", future.get().getUpdateTime().toString()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ResponseDTO<>(false, "수정 실패: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDTO<?>> deletePortfolio(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable String id) {

        try {
            String token = authorizationHeader.substring(7);
            String uid = jwtUtil.validateToken(token);

            Firestore db = FirestoreClient.getFirestore();
            DocumentReference docRef = db.collection("portfolio").document(id);

            DocumentSnapshot doc = docRef.get().get();
            if (!doc.exists()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>(false, "문서가 존재하지 않습니다.", null));
            }

            if (!uid.equals(doc.getString("uid"))) {
                return ResponseEntity.status(403).body(new ResponseDTO<>(false, "본인만 삭제할 수 있습니다.", null));
            }

            ApiFuture<WriteResult> result = docRef.delete();
            return ResponseEntity.ok(new ResponseDTO<>(true, "삭제 성공", result.get().getUpdateTime()));

        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.internalServerError()
                    .body(new ResponseDTO<>(false, "삭제 실패: " + e.getMessage(), null));
        }
    }
}
