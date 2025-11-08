package com.example.planner.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private String role;
    private String content;
    private String createdAt;

    public MessageDTO(String role, String content) { // gpt에 대화 요청을 보낼 때 사용
        this.role = role;
        this.content = content;
    }
}
