package com.example.planner.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioDTO {
    private String id;          // 문서 ID (Firestore 자동 생성)
    private String uid;         // 업로더 UID
    private String title;       // 제목
    private String description; // 설명
    private String fileUrl;     // 파일 경로
    private long createdAt;     // 등록 시각
}
