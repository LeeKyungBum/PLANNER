package com.example.planner.resume.service;

import com.example.planner.resume.dto.ResumeDTO;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final Firestore firestore;

    // CREATE
    public void addResume(String uid, ResumeDTO resume) throws Exception {
        DocumentReference docRef = firestore.collection("users")
                .document(uid)
                .collection("resume")
                .document();

        resume.setId(docRef.getId());
        resume.setUid(uid);
        resume.setCreatedAt(System.currentTimeMillis());
        resume.setUpdatedAt(System.currentTimeMillis());

        docRef.set(resume).get();
    }

    // READ - 리스트
    public List<ResumeDTO> getResumes(String uid) throws ExecutionException, InterruptedException {
        CollectionReference colRef = firestore.collection("users")
                .document(uid)
                .collection("resume");

        ApiFuture<QuerySnapshot> future = colRef.orderBy("createdAt", Query.Direction.DESCENDING).get();
        List<QueryDocumentSnapshot> docs = future.get().getDocuments();

        List<ResumeDTO> resumes = new ArrayList<>();
        for (QueryDocumentSnapshot doc : docs) {
            ResumeDTO resume = doc.toObject(ResumeDTO.class);
            resume.setId(doc.getId());
            resumes.add(resume);
        }
        return resumes;
    }

    // READ - 상세 보기
    public ResumeDTO getResumeDetail(String uid, String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("users")
                .document(uid)
                .collection("resume")
                .document(id);

        DocumentSnapshot doc = docRef.get().get();
        if (!doc.exists()) return null;

        ResumeDTO resume = doc.toObject(ResumeDTO.class);
        resume.setId(doc.getId());
        return resume;
    }

    // UPDATE
    public boolean updateResume(String uid, String id, ResumeDTO updated) throws Exception {
        DocumentReference docRef = firestore.collection("users")
                .document(uid)
                .collection("resume")
                .document(id);

        DocumentSnapshot doc = docRef.get().get();
        if (!doc.exists()) return false;

        updated.setUpdatedAt(System.currentTimeMillis());
        docRef.set(updated, SetOptions.merge()).get();
        return true;
    }

    // DELETE
    public boolean deleteResume(String uid, String id) throws Exception {
        DocumentReference docRef = firestore.collection("users")
                .document(uid)
                .collection("resume")
                .document(id);

        DocumentSnapshot doc = docRef.get().get();
        if (!doc.exists()) return false;

        docRef.delete().get();
        return true;
    }
}
