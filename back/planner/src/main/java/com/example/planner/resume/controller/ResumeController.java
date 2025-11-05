package com.example.planner.resume.controller;

import com.example.planner.level.service.LevelService;
import com.example.planner.resume.dto.ResumeDTO;
import com.example.planner.resume.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/planner/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final LevelService levelService;

    // CREATE
    @PostMapping("/{uid}")
    public ResponseEntity<?> createResume(@PathVariable String uid, @RequestBody ResumeDTO dto) {
        try {
            resumeService.addResume(uid, dto);
            levelService.addXP(uid, "이력서/자기소개서 작성", 3);

            return ResponseEntity.ok("자기소개서 저장 완료");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("저장 실패: " + e.getMessage());
        }
    }

    // READ (List)
    @GetMapping("/{uid}")
    public ResponseEntity<?> getResumes(@PathVariable String uid) {
        try {
            List<ResumeDTO> list = resumeService.getResumes(uid);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("조회 실패: " + e.getMessage());
        }
    }

    // READ (Detail)
    @GetMapping("/{uid}/{id}")
    public ResponseEntity<?> getResumeDetail(@PathVariable String uid, @PathVariable String id) {
        try {
            ResumeDTO resume = resumeService.getResumeDetail(uid, id);
            if (resume == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(resume);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("상세 조회 실패: " + e.getMessage());
        }
    }

    // UPDATE
    @PutMapping("/{uid}/{id}")
    public ResponseEntity<?> updateResume(@PathVariable String uid,
                                          @PathVariable String id,
                                          @RequestBody ResumeDTO dto) {
        try {
            boolean result = resumeService.updateResume(uid, id, dto);
            if (!result) return ResponseEntity.notFound().build();
            return ResponseEntity.ok("수정 완료");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("수정 실패: " + e.getMessage());
        }
    }

    // DELETE
    @DeleteMapping("/{uid}/{id}")
    public ResponseEntity<?> deleteResume(@PathVariable String uid, @PathVariable String id) {
        try {
            boolean result = resumeService.deleteResume(uid, id);
            if (!result) return ResponseEntity.notFound().build();
            return ResponseEntity.ok("삭제 완료");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("삭제 실패: " + e.getMessage());
        }
    }
}
