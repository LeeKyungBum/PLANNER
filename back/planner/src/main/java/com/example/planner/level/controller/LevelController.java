package com.example.planner.level.controller;

import com.example.planner.level.dto.LevelDTO;
import com.example.planner.level.service.LevelService;
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
}
