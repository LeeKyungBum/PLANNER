package com.example.planner.ai.util;

import com.example.planner.ai.dto.MessageDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Component
public class GPTClient {

    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${openai.api.key}")
    private String apiKey;

    public GPTClient() {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String generateReply(String type, List<MessageDTO> history) throws Exception {
        String systemPrompt = switch (type) {
            case "resume" -> "너는 HR 전문가이자 커리어 코치야. 사용자의 자기소개서를 분석하고 구체적인 피드백을 제공해.";
            case "spec" -> "너는 진로 상담 전문가야. 사용자의 스펙(학력, 자격증, 경력, 프로젝트 등)을 분석하고 진로 조언을 제시해.";
            default -> "너는 도움이 되는 AI 조력자야.";
        };

        var messages = Stream.concat(
                Stream.of(Map.of("role", "system", "content", systemPrompt)),
                history.stream().map(m -> Map.of("role", m.getRole(), "content", m.getContent()))
        ).toList();

        Map<String, Object> payload = Map.of(
                "model", "gpt-4o-mini",
                "messages", messages
        );

        String responseBody = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(payload), Map.class)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        JsonNode json = mapper.readTree(responseBody);
        return json.get("choices").get(0).get("message").get("content").asText();
    }
}
