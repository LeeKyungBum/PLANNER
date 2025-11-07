package com.example.planner.level.service;

import com.example.planner.level.dto.LevelDTO;
import com.example.planner.level.dto.RankingDTO;
import com.example.planner.level.util.LevelUtil;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class LevelService {

    public LevelDTO getLevelInfo(String uid) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();
        DocumentReference docRef = firestore.collection("users")
                .document(uid)
                .collection("level")
                .document("progress");

        DocumentSnapshot snapshot = docRef.get().get();

        if (!snapshot.exists()) {
            LevelDTO defaultLevel = new LevelDTO(new Date(), 1, 0, 1, new ArrayList<>());
            docRef.set(Map.of(
                    "currentLevel", 1,
                    "currentXP", 0,
                    "nextRequiredXP", 1,
                    "activityLog", new ArrayList<>(),
                    "updatedAt", new Date()
            ), SetOptions.merge());
            return defaultLevel;
        }

        return snapshot.toObject(LevelDTO.class);
    }

    public LevelDTO addXP(String uid, String activity, int gain) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        DocumentReference docRef = firestore.collection("users")
                .document(uid)
                .collection("level")
                .document("progress");
        DocumentSnapshot snapshot = docRef.get().get();

        int currentLevel = 1;
        int currentXP = 0;

        if (snapshot.exists()) {
            Long levelVal = snapshot.getLong("currentLevel");
            Long xpVal = snapshot.getLong("currentXP");

            currentLevel = (levelVal != null) ? levelVal.intValue() : 1;
            currentXP = (xpVal != null) ? xpVal.intValue() : 0;
        }

        int requiredXP = LevelUtil.getXPForLevel(currentLevel);
        currentXP += gain;

        List<Map<String, Object>> logs = (List<Map<String, Object>>) snapshot.get("activityLog");
        if (logs == null) logs = new ArrayList<>();
        logs.add(Map.of(
                "date", new Date(),
                "activity", activity,
                "gain", gain
        ));

        while (currentXP >= requiredXP) {
            currentXP -= requiredXP;
            currentLevel++;
            requiredXP = LevelUtil.getXPForLevel(currentLevel);
        }

        LevelDTO updated = new LevelDTO(new Date(), currentLevel, currentXP, requiredXP, logs);

        docRef.set(Map.of(
                "currentLevel", currentLevel,
                "currentXP", currentXP,
                "nextRequiredXP", requiredXP,
                "activityLog", logs,
                "updatedAt", new Date()
        ), SetOptions.merge());

        System.out.println("XP updated for UID: " + uid);
        return updated;
    }
    public List<RankingDTO> getTopRanking(int limit) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        List<RankingDTO> rankingList = new ArrayList<>();

        // "level" 하위의 모든 문서를 가져온다
        ApiFuture<QuerySnapshot> future = db.collectionGroup("level").get();
        List<QueryDocumentSnapshot> docs = future.get().getDocuments();

        for (QueryDocumentSnapshot doc : docs) {
            // 문서 이름이 "progress"인지 확인
            if (!doc.getId().equals("progress")) continue;

            try {
                String uid = doc.getReference().getParent().getParent().getId();

                Long levelVal = doc.getLong("currentLevel");
                Long xpVal = doc.getLong("currentXP");
                int level = (levelVal != null) ? levelVal.intValue() : 0;
                int xp = (xpVal != null) ? xpVal.intValue() : 0;

                // 닉네임 가져오기
                String nickname = "익명";
                DocumentSnapshot userDoc = db.collection("users").document(uid).get().get();
                if (userDoc.exists() && userDoc.contains("name")) {
                    nickname = userDoc.getString("name");
                }

                rankingList.add(new RankingDTO(uid, nickname, level, xp));
            } catch (Exception e) {
                System.err.println("Error processing user ranking: " + e.getMessage());
            }
        }

        rankingList.sort((a, b) -> {
            if (b.getCurrentLevel() == a.getCurrentLevel()) {
                return Integer.compare(b.getCurrentXP(), a.getCurrentXP());
            }
            return Integer.compare(b.getCurrentLevel(), a.getCurrentLevel());
        });

        return rankingList.stream().limit(limit).toList();
    }

}
