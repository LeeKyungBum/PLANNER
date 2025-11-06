package com.example.planner.network.dto;

import com.google.cloud.Timestamp;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NetworkPostDTO {
    private String id;
    private String uid;
    private String author;
    private String category;
    private String title;
    private String content;
    private String imageUrl;
    private Timestamp createdAt;
    private Timestamp updatedAt;   

    private MultipartFile image;//이미지 용 필드
}
