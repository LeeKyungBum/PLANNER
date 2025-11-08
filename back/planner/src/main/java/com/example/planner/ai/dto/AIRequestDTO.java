package com.example.planner.ai.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AIRequestDTO {
    private String uid;
    private String conversationId;
    private String type; // resume, spec 두 가지 챗봇
    private String message;
}
