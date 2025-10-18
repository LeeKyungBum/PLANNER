package com.example.planner.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


// 모든 응답을 JSON으로 주기 위한 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDTO<T> {
    private boolean success; // 성공 여부
    private String message;  // 설명 메시지
    private T data;          // 실제 데이터 (optional)
}