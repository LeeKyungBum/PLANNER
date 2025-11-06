package com.example.planner.network.service;

import com.example.planner.network.dto.NetworkPostDTO;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Slf4j
@Service
public class NetworkPostService {

    private final Firestore firestore = FirestoreClient.getFirestore();
    private static final String COLLECTION = "network_posts";

    // 게시글 목록 조회
    public List<NetworkPostDTO> getAllPosts(String category) {
        List<NetworkPostDTO> result = new ArrayList<>();
        try {
            Query query = firestore.collection(COLLECTION)
                    .orderBy("createdAt", Query.Direction.DESCENDING);

            if (category != null && !category.equals("전체")) {
                query = query.whereEqualTo("category", category);
            }

            ApiFuture<QuerySnapshot> future = query.get();
            for (DocumentSnapshot doc : future.get().getDocuments()) {
                NetworkPostDTO post = doc.toObject(NetworkPostDTO.class);
                post.setId(doc.getId());
                result.add(post);
            }
        } catch (Exception e) {
            log.error("게시글 목록 조회 실패: {}", e.getMessage());
        }
        return result;
    }

    // 게시글 상세 조회
    public NetworkPostDTO getPostById(String id) {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION).document(id).get().get();
            if (doc.exists()) {
                NetworkPostDTO post = doc.toObject(NetworkPostDTO.class);
                post.setId(doc.getId());
                return post;
            }
        } catch (Exception e) {
            log.error("게시글 조회 실패: {}", e.getMessage());
        }
        return null;
    }

    // 게시글 등록
    public void createPost(String uid, String title, String content, String category, MultipartFile image) {
        try {
            String imageUrl = (image != null && !image.isEmpty()) ? uploadImage(image) : null;

            Map<String, Object> data = new HashMap<>();
            data.put("uid", uid);
            data.put("author", getAuthorName(uid));
            data.put("category", category);
            data.put("title", title);
            data.put("content", content);
            data.put("imageUrl", imageUrl);
            data.put("createdAt", com.google.cloud.Timestamp.now());
            data.put("updatedAt", com.google.cloud.Timestamp.now());

            firestore.collection(COLLECTION).add(data);
        } catch (Exception e) {
            log.error("게시글 등록 실패: {}", e.getMessage());
        }
    }

    // 게시글 수정
    public void updatePost(String id, String title, String content, String category, MultipartFile image) {
        try {
            DocumentReference ref = firestore.collection(COLLECTION).document(id);
            Map<String, Object> updates = new HashMap<>();
            updates.put("title", title);
            updates.put("content", content);
            updates.put("category", category);
            updates.put("updatedAt", com.google.cloud.Timestamp.now());

            if (image != null && !image.isEmpty()) {
                String newUrl = uploadImage(image);
                updates.put("imageUrl", newUrl);
            }

            ref.update(updates);
        } catch (Exception e) {
            log.error("게시글 수정 실패: {}", e.getMessage());
        }
    }

    // 게시글 삭제
    public void deletePost(String id) {
        try {
            firestore.collection(COLLECTION).document(id).delete();
        } catch (Exception e) {
            log.error("게시글 삭제 실패: {}", e.getMessage());
        }
    }

    // Storage 업로드 구현
    private String uploadImage(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String bucketName = StorageClient.getInstance().bucket().getName();

            try (InputStream inputStream = file.getInputStream()) {
                StorageClient.getInstance().bucket()
                        .create("network/" + fileName, inputStream, file.getContentType());
            }

            // 다운로드 URL 생성
            String encodedName = URLEncoder.encode("network/" + fileName, StandardCharsets.UTF_8);
            return "https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" + encodedName + "?alt=media";

        } catch (Exception e) {
            log.error("이미지 업로드 실패: {}", e.getMessage());
            return null;
        }
    }

    // users/{uid}에서 작성자 이름 가져오기
    private String getAuthorName(String uid) throws ExecutionException, InterruptedException {
        DocumentSnapshot userDoc = firestore.collection("users").document(uid).get().get();
        if (userDoc.exists() && userDoc.contains("name")) {
            return userDoc.getString("name");
        }
        return "익명";
    }
}
