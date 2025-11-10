package com.example.planner.ai.util;

import com.example.planner.ai.dto.ConversationDTO;
import com.example.planner.ai.dto.MessageDTO;
import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Component
public class FirestoreAIUtil {

    private Firestore db() {
        return FirestoreClient.getFirestore();
    }

    // 메시지 불러오기
    public List<MessageDTO> getMessages(String uid, String conversationId) throws ExecutionException, InterruptedException {
        List<MessageDTO> messages = new ArrayList<>();
        CollectionReference messagesRef = db().collection("users").document(uid)
                .collection("chatbot").document(conversationId)
                .collection("messages");

        ApiFuture<QuerySnapshot> future = messagesRef.orderBy("createdAt").get();
        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            String role = doc.getString("role");
            String content = doc.getString("content");

            Timestamp ts = doc.getTimestamp("createdAt");
            String createdAt = (ts != null) ? ts.toDate().toInstant().toString() : null;

            messages.add(new MessageDTO(role, content, createdAt));
        }
        return messages;
    }

    // 메시지 저장
    public void saveMessage(String uid, String conversationId, String role, String content) throws ExecutionException, InterruptedException {
        DocumentReference messageRef = db().collection("users").document(uid)
                .collection("chatbot").document(conversationId)
                .collection("messages").document();

        Map<String, Object> data = new HashMap<>();
        data.put("role", role);
        data.put("content", content);
        data.put("createdAt", Timestamp.now());
        
        messageRef.set(data).get();
    }

    // 대화방 생성
    public String createConversation(String uid, String type, String title) throws ExecutionException, InterruptedException {
        CollectionReference chatbotRef = db().collection("users").document(uid).collection("chatbot");
        DocumentReference newDoc = chatbotRef.document();

        Map<String, Object> info = new HashMap<>();
        info.put("type", type);
        info.put("title", title);
        info.put("createdAt", FieldValue.serverTimestamp());
        info.put("updatedAt", FieldValue.serverTimestamp());

        newDoc.set(info).get();
        return newDoc.getId();
    }

    // 대화방 목록
    public List<ConversationDTO> listConversations(String uid) throws ExecutionException, InterruptedException {
        List<ConversationDTO> result = new ArrayList<>();
        CollectionReference ref = db().collection("users").document(uid).collection("chatbot");
        ApiFuture<QuerySnapshot> future = ref.orderBy("updatedAt", Query.Direction.DESCENDING).get();

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            ConversationDTO dto = new ConversationDTO();
            dto.setUid(uid);
            dto.setConversationId(doc.getId());
            dto.setType(doc.getString("type"));
            dto.setTitle(doc.getString("title"));

            Timestamp createdTs = doc.getTimestamp("createdAt");
            Timestamp updatedTs = doc.getTimestamp("updatedAt");

            dto.setCreatedAt(createdTs != null ? sdf.format(new Date(createdTs.toDate().getTime())) : null);
            dto.setUpdatedAt(updatedTs != null ? sdf.format(new Date(updatedTs.toDate().getTime())) : null);

            result.add(dto);
        }
        return result;
    }

    public List<MessageDTO> getMessageHistory(String uid, String conversationId) throws Exception {
        List<MessageDTO> result = new ArrayList<>();

        CollectionReference ref = db()
                .collection("users")
                .document(uid)
                .collection("chatbot")
                .document(conversationId)
                .collection("messages");

        ApiFuture<QuerySnapshot> future = ref.orderBy("createdAt").get();

        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            MessageDTO msg = new MessageDTO();
            msg.setRole(doc.getString("role"));
            msg.setContent(doc.getString("content"));

            Timestamp ts = doc.getTimestamp("createdAt");
            if (ts != null) msg.setCreatedAt(ts.toDate().toString());

            result.add(msg);
        }
        return result;
    }

    // 대화방 삭제
    public void deleteConversation(String uid, String conversationId) throws ExecutionException, InterruptedException {
        DocumentReference ref = db().collection("users").document(uid)
                .collection("chatbot").document(conversationId);
        ref.delete().get();
    }

    // 수정시간 업데이트
    public void updateConversationTime(String uid, String conversationId) throws ExecutionException, InterruptedException {
        DocumentReference ref = db().collection("users").document(uid)
                .collection("chatbot").document(conversationId);
        ref.update("updatedAt", FieldValue.serverTimestamp()).get();
    }
}
