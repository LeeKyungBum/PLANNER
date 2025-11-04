package com.example.planner.portfolio.service;

import com.example.planner.portfolio.dto.PortfolioDTO;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.cloud.storage.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class PortfolioService {

    private static final String UPLOAD_DIR = "uploads/portfolio/";

    public String uploadPortfolio(String uid, String title, String description, MultipartFile file) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Bucket bucket = StorageClient.getInstance().bucket();

        bucket.create("portfolio/" + uid + "/" + fileName, file.getBytes(), file.getContentType());

        String fileUrl = String.format(
                "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                bucket.getName(),
                java.net.URLEncoder.encode("portfolio/" + uid + "/" + fileName, "UTF-8")
        );

        // 문서 참조를 미리 생성해서 ID 확보
        DocumentReference docRef = db.collection("portfolio").document();
        String id = docRef.getId();

        PortfolioDTO dto = new PortfolioDTO(
                id, uid, title, description, fileUrl, System.currentTimeMillis()
        );

        // 명시적으로 저장
        docRef.set(dto);

        return id;
    }

    public List<PortfolioDTO> getPortfolioList(String uid) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();

        ApiFuture<QuerySnapshot> future = db.collection("portfolio")
                .whereEqualTo("uid", uid)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get();

        List<PortfolioDTO> list = new ArrayList<>();
        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            PortfolioDTO dto = doc.toObject(PortfolioDTO.class);
            dto.setId(doc.getId());
            list.add(dto);
        }

        return list;
    }
}
