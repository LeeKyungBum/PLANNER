package com.example.planner.network.dto;

import lombok.*;

import com.google.cloud.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NetworkCommentDTO {
    private String id;
    private String postId;
    private String uid;
    private String author;
    private String content;
    private Timestamp createdAt;
}
