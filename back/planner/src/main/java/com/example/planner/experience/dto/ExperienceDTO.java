package com.example.planner.experience.dto;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceDTO {
    private String id;              // 문서 ID
    private String uid;             // 사용자 UID
    private String category;        // career / certificate 인지 분류
    private String title;           // 제목
    private String organization;    // 소속 / 회사
    private String position;        // 직위
    private String startDate;       // 시작일
    private String endDate;         // 종료일
    private boolean ongoing;        // 진행 여부
    private String description;     // 내용
    private String fileUrl;         // 업로드된 파일 URL
    private long createdAt;         // 생성 시각
    private MultipartFile file;     // 파일 업로드용
}
