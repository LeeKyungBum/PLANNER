package com.example.planner.experience.service;

import com.example.planner.experience.dto.ExperienceDTO;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class ExperienceService {

    // 등록 (Upload)
    public String uploadExperience(String uid, ExperienceDTO dto) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        String fileUrl = null;
        MultipartFile file = dto.getFile();

        if (file != null && !file.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String path = "experience/" + uid + "/" + fileName;

            Bucket bucket = StorageClient.getInstance().bucket();
            bucket.create(path, file.getBytes(), file.getContentType());

            fileUrl = String.format(
                    "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                    bucket.getName(),
                    URLEncoder.encode(path, "UTF-8")
            );
        }

        DocumentReference docRef = db.collection("experience").document();
        String id = docRef.getId();

        ExperienceDTO data = ExperienceDTO.builder()
                .id(id)
                .uid(uid)
                .category(dto.getCategory())
                .title(dto.getTitle())
                .organization(dto.getOrganization())
                .position(dto.getPosition())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .ongoing(dto.isOngoing())
                .description(dto.getDescription())
                .fileUrl(fileUrl)
                .createdAt(System.currentTimeMillis())
                .build();

        docRef.set(data).get();
        return id;
    }

    // 목록 조회 (uid 기준)
    public List<ExperienceDTO> getExperienceList(String uid)
            throws ExecutionException, InterruptedException {

        Firestore db = FirestoreClient.getFirestore();

        ApiFuture<QuerySnapshot> future = db.collection("experience")
                .whereEqualTo("uid", uid)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get();

        List<ExperienceDTO> list = new ArrayList<>();
        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            ExperienceDTO dto = doc.toObject(ExperienceDTO.class);
            dto.setId(doc.getId());
            list.add(dto);
        }
        return list;
    }

    // 상세보기 (id 기준)
    public ExperienceDTO getExperienceDetail(String id)
            throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        DocumentSnapshot doc = db.collection("experience").document(id).get().get();

        if (!doc.exists()) {
            return null;
        }

        ExperienceDTO dto = doc.toObject(ExperienceDTO.class);
        dto.setId(doc.getId());
        return dto;
    }

    // 수정 (업데이트)
    public void updateExperience(String id, ExperienceDTO dto) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference docRef = db.collection("experience").document(id);

        Map<String, Object> updateData = new HashMap<>();
        updateData.put("category", dto.getCategory());
        updateData.put("title", dto.getTitle());
        updateData.put("organization", dto.getOrganization());
        updateData.put("position", dto.getPosition());
        updateData.put("startDate", dto.getStartDate());
        updateData.put("endDate", dto.getEndDate());
        updateData.put("ongoing", dto.isOngoing());
        updateData.put("description", dto.getDescription());

        MultipartFile file = dto.getFile();
        if (file != null && !file.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String path = "experience/" + dto.getUid() + "/" + fileName;

            Bucket bucket = StorageClient.getInstance().bucket();
            bucket.create(path, file.getBytes(), file.getContentType());

            String fileUrl = String.format(
                    "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                    bucket.getName(),
                    URLEncoder.encode(path, "UTF-8")
            );
            updateData.put("fileUrl", fileUrl);
        }

        docRef.update(updateData).get();
    }

    // 삭제
    public void deleteExperience(String id)
            throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        db.collection("experience").document(id).delete().get();
    }
}
