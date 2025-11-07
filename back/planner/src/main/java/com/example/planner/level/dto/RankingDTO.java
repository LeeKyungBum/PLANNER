package com.example.planner.level.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RankingDTO {
    private String uid;          // 사용자 UID
    private String nickname;     // 사용자 닉네임
    private int currentLevel;    // 현재 레벨
    private int currentXP;       // 현재 XP
}
