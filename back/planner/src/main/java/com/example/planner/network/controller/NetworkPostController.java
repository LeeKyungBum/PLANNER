package com.example.planner.network.controller;

import com.example.planner.network.dto.NetworkPostDTO;
import com.example.planner.network.service.NetworkPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/planner/posts")
@RequiredArgsConstructor
public class NetworkPostController {

    private final NetworkPostService postService;

    // 게시글 목록 (카테고리별 필터)
    @GetMapping
    public ResponseEntity<List<NetworkPostDTO>> getAllPosts(@RequestParam(required = false) String category) {
        List<NetworkPostDTO> posts = postService.getAllPosts(category);
        return ResponseEntity.ok(posts);
    }

    // 게시글 상세
    @GetMapping("/{id}")
    public ResponseEntity<NetworkPostDTO> getPostById(@PathVariable String id) {
        NetworkPostDTO post = postService.getPostById(id);
        if (post == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(post);
    }

    // 게시글 작성
    @PostMapping
    public ResponseEntity<String> createPost(
            @RequestParam("uid") String uid,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        postService.createPost(uid, title, content, category, image);
        return ResponseEntity.ok("게시글이 등록되었습니다.");
    }

    // 게시글 수정
    @PutMapping("/{id}")
    public ResponseEntity<String> updatePost(
            @PathVariable String id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        postService.updatePost(id, title, content, category, image);
        return ResponseEntity.ok("게시글이 수정되었습니다.");
    }

    // 게시글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(@PathVariable String id) {
        postService.deletePost(id);
        return ResponseEntity.ok("게시글이 삭제되었습니다.");
    }
}
