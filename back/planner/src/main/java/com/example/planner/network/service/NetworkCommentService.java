package com.example.planner.network.service;

import com.example.planner.network.dto.NetworkCommentDTO;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Slf4j
@Service
public class NetworkCommentService {

    private final Firestore firestore = FirestoreClient.getFirestore();

    // 댓글 목록
    public List<NetworkCommentDTO> getComments(String postId) {
        List<NetworkCommentDTO> result = new ArrayList<>();
        try {
            CollectionReference commentsRef = firestore
                    .collection("network_posts")
                    .document(postId)
                    .collection("comments");

            ApiFuture<QuerySnapshot> future = commentsRef.orderBy("createdAt").get();

            for (DocumentSnapshot doc : future.get().getDocuments()) {
                NetworkCommentDTO c = doc.toObject(NetworkCommentDTO.class);
                c.setId(doc.getId());
                result.add(c);
            }
        } catch (Exception e) {
            log.error("댓글 조회 실패: {}", e.getMessage());
        }
        return result;
    }

    // 댓글 작성
    public void addComment(String postId, NetworkCommentDTO comment) {
        try {
            String author = getAuthorName(comment.getUid());
            Map<String, Object> data = new HashMap<>();
            data.put("uid", comment.getUid());
            data.put("author", author);
            data.put("content", comment.getContent());
            data.put("createdAt", com.google.cloud.Timestamp.now());

            firestore.collection("network_posts")
                    .document(postId)
                    .collection("comments")
                    .add(data);
        } catch (Exception e) {
            log.error("댓글 등록 실패: {}", e.getMessage());
        }
    }

    // 댓글 수정
    public void updateComment(String postId, String commentId, NetworkCommentDTO dto) {
        try {
            firestore.collection("network_posts")
                    .document(postId)
                    .collection("comments")
                    .document(commentId)
                    .update("content", dto.getContent());
        } catch (Exception e) {
            log.error("댓글 수정 실패: {}", e.getMessage());
        }
    }

    // 댓글 삭제
    public void deleteComment(String postId, String commentId) {
        try {
            firestore.collection("network_posts")
                    .document(postId)
                    .collection("comments")
                    .document(commentId)
                    .delete();
        } catch (Exception e) {
            log.error("댓글 삭제 실패: {}", e.getMessage());
        }
    }

    // 작성자 이름 가져오기
    private String getAuthorName(String uid) throws ExecutionException, InterruptedException {
        DocumentSnapshot userDoc = firestore.collection("users").document(uid).get().get();
        if (userDoc.exists() && userDoc.contains("name")) {
            return userDoc.getString("name");
        }
        return "익명";
    }
}
