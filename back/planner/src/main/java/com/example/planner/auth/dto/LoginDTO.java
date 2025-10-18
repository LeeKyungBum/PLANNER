package com.example.planner.auth.dto;

import lombok.Data;

@Data
public class LoginDTO {
    private String name;
    private String affiliation; // 소속(학교나 회사 또는 무직)
    private String email;
    private String password;
    private String phone;
}
