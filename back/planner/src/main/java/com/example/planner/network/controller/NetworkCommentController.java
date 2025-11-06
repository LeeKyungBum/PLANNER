package com.example.planner.network.controller;

import com.example.planner.network.dto.NetworkCommentDTO;
import com.example.planner.network.service.NetworkCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/planner/posts/{postId}/comments")
@RequiredArgsConstructor
public class NetworkCommentController {

    private final NetworkCommentService commentService;

    // 댓글 목록
    @GetMapping
    public ResponseEntity<List<NetworkCommentDTO>> getComments(@PathVariable String postId) {
        List<NetworkCommentDTO> comments = commentService.getComments(postId);
        return ResponseEntity.ok(comments);
    }

    // 댓글 등록
    @PostMapping
    public ResponseEntity<String> addComment(
            @PathVariable String postId,
            @RequestBody NetworkCommentDTO commentDTO) {

        commentService.addComment(postId, commentDTO);
        return ResponseEntity.ok("댓글이 등록되었습니다.");
    }

    // 댓글 수정
    @PutMapping("/{commentId}")
    public ResponseEntity<String> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody NetworkCommentDTO commentDTO) {

        commentService.updateComment(postId, commentId, commentDTO);
        return ResponseEntity.ok("댓글이 수정되었습니다.");
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId) {

        commentService.deleteComment(postId, commentId);
        return ResponseEntity.ok("댓글이 삭제되었습니다.");
    }
}
