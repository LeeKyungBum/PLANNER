package com.example.planner.resume.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeDTO {
    private String id;                      // 문서 ID
    private String uid;                     // 사용자 UID
    private String title;                   // 자기소개서 제목
    private String company;                 // 지원 회사
    private List<Map<String, String>> questions;  // [{question, answer}]
    private long createdAt;                 // 작성 시각
    private long updatedAt;                 // 수정 시각
}
