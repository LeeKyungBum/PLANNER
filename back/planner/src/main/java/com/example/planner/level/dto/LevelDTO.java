package com.example.planner.level.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LevelDTO {
    private Date updatedAt;
    private int currentLevel;
    private int currentXP;
    private int nextRequiredXP;
    private List<Map<String, Object>> activityLog;
}
