package com.example.planner.auth.dto;

import lombok.Data;

@Data
public class LoginDTO {
    private String name;
    private String affiliation;
    private String email;
    private String password;
    private String phone;
}
