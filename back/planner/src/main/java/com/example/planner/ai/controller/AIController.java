package com.example.planner.ai.controller;

import com.example.planner.ai.dto.*;
import com.example.planner.ai.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/planner/ai")
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    // GPT 대화 요청
    @PostMapping
    public ResponseEntity<AIResponseDTO> chat(@RequestBody AIRequestDTO request) {
        try {
            AIResponseDTO response = aiService.chat(
                    request.getUid(),
                    request.getConversationId(),
                    request.getType(),
                    request.getMessage()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 새 대화방 생성
    @PostMapping("/create")
    public ResponseEntity<String> createConversation(@RequestBody ConversationDTO dto) {
        try {
            String conversationId = aiService.createConversation(dto.getUid(), dto.getType(), dto.getTitle());
            return ResponseEntity.ok(conversationId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 대화방 목록 조회
    @GetMapping("/list/{uid}")
    public ResponseEntity<List<ConversationDTO>> listConversations(@PathVariable String uid) {
        try {
            List<ConversationDTO> list = aiService.listConversations(uid);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 대화방 삭제
    @DeleteMapping("/delete/{uid}/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable String uid, @PathVariable String conversationId) {
        try {
            aiService.deleteConversation(uid, conversationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
