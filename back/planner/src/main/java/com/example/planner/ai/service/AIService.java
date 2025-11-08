package com.example.planner.ai.service;

import com.example.planner.ai.dto.*;
import com.example.planner.ai.util.FirestoreAIUtil;
import com.example.planner.ai.util.GPTClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AIService {

    private final GPTClient gptClient;
    private final FirestoreAIUtil firestoreAIUtil;

    public AIService(GPTClient gptClient, FirestoreAIUtil firestoreAIUtil) {
        this.gptClient = gptClient;
        this.firestoreAIUtil = firestoreAIUtil;
    }

    // GPT 대화 요청
    public AIResponseDTO chat(String uid, String conversationId, String type, String message) throws Exception {
        List<MessageDTO> history = firestoreAIUtil.getMessages(uid, conversationId);
        history.add(new MessageDTO("user", message));

        String reply = gptClient.generateReply(type, history);

        firestoreAIUtil.saveMessage(uid, conversationId, "user", message);
        firestoreAIUtil.saveMessage(uid, conversationId, "assistant", reply);
        firestoreAIUtil.updateConversationTime(uid, conversationId);

        return new AIResponseDTO(reply);
    }

    // 대화방 생성
    public String createConversation(String uid, String type, String title) throws Exception {
        return firestoreAIUtil.createConversation(uid, type, title);
    }

    // 대화방 목록 조회
    public List<ConversationDTO> listConversations(String uid) throws Exception {
        return firestoreAIUtil.listConversations(uid);
    }

    // 대화방 삭제
    public void deleteConversation(String uid, String conversationId) throws Exception {
        firestoreAIUtil.deleteConversation(uid, conversationId);
    }
}
