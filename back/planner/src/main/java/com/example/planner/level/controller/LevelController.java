package com.example.planner.level.controller;

import com.example.planner.auth.dto.ResponseDTO;
import com.example.planner.level.dto.LevelDTO;
import com.example.planner.level.dto.RankingDTO;
import com.example.planner.level.service.LevelService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/planner/level")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"}, allowCredentials = "true")
public class LevelController {

    private final LevelService levelService;

    public LevelController(LevelService levelService) {
        this.levelService = levelService;
    }

    @GetMapping("/{uid}")
    public LevelDTO getLevel(@PathVariable String uid) throws Exception {
        return levelService.getLevelInfo(uid);
    }

    @PostMapping("/{uid}/add-xp")
    public LevelDTO addXP(@PathVariable String uid, @RequestParam String activity, @RequestParam int gain) throws Exception {
        return levelService.addXP(uid, activity, gain);
    }

    @GetMapping("/ranking")
    public ResponseEntity<ResponseDTO<?>> getRanking() {
        try {
            List<RankingDTO> rankingList = levelService.getTopRanking(5);
            return ResponseEntity.ok(new ResponseDTO<>(true, "랭킹 조회 성공", rankingList));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ResponseDTO<>(false, "랭킹 조회 실패: " + e.getMessage(), null));
        }
    }
}
