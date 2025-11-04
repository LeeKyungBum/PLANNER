package com.example.planner.experience.controller;

import com.example.planner.experience.dto.ExperienceDTO;
import com.example.planner.experience.service.ExperienceService;
import com.example.planner.level.service.LevelService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/planner/experience")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"}, allowCredentials = "true")
public class ExperienceController {

    private final ExperienceService service;
    private final LevelService levelService;

    public ExperienceController(ExperienceService service, LevelService levelService) {
        this.service = service;
        this.levelService = levelService;
    }

    // 등록
    @PostMapping("/{uid}")
    public ResponseEntity<String> upload(
            @PathVariable String uid,
            @ModelAttribute ExperienceDTO dto
    ) throws Exception {
        String id = service.uploadExperience(uid, dto);

        levelService.addXP(uid, "경력/자격증 등록", 5);

        return ResponseEntity.ok(id);
    }

    // 목록 조회
    @GetMapping("/list/{uid}")
    public ResponseEntity<List<ExperienceDTO>> list(@PathVariable String uid)
            throws Exception {
        return ResponseEntity.ok(service.getExperienceList(uid));
    }

    // 상세보기
    @GetMapping("/detail/{id}")
    public ResponseEntity<ExperienceDTO> detail(@PathVariable String id)
            throws Exception {
        ExperienceDTO dto = service.getExperienceDetail(id);
        return (dto != null) ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    // 수정
    @PutMapping("/{id}")
    public ResponseEntity<String> update(
            @PathVariable String id,
            @ModelAttribute ExperienceDTO dto
    ) throws Exception {
        service.updateExperience(id, dto);
        return ResponseEntity.ok("수정 완료");
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable String id)
            throws Exception {
        service.deleteExperience(id);
        return ResponseEntity.ok("삭제 완료");
    }
}
