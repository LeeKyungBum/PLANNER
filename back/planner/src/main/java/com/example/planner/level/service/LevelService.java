package com.example.planner.level.service;

import com.example.planner.level.dto.LevelDTO;
import com.example.planner.level.util.LevelUtil;
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
}
