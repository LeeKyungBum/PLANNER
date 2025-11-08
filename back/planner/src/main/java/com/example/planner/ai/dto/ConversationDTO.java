package com.example.planner.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private String uid;
    private String conversationId;
    private String type;      // "resume" or "spec"
    private String title;     // 대화방 제목
    private String createdAt;
    private String updatedAt;
}
