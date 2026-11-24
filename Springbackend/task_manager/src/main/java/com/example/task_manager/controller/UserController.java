package com.example.task_manager.controller;

import com.example.task_manager.dto.AuthResponse;
import com.example.task_manager.dto.LoginRequest;
import com.example.task_manager.dto.UserRequest;
import com.example.task_manager.dto.UserResponse;
import com.example.task_manager.entity.User;
import com.example.task_manager.security.JwtSecurity;
import com.example.task_manager.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class UserController {
    private final UserService userService;
    private final JwtSecurity jwtSecurity;
    public UserController(UserService userService, JwtSecurity jwtSecurity){
        this.userService=userService;
        this.jwtSecurity=jwtSecurity;
    }
    @PostMapping("/register")
    public UserResponse register(@RequestBody UserRequest userRequest){
        String user=userRequest.getUsername();
        String pass=userRequest.getPassword();
        User user1=userService.registerUser(user,pass);
        return new UserResponse(
                user1.getId(),
                user1.getUsername(),
                user1.getRole()
        );
    }
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest loginRequest){
        boolean valid=userService.loginUser(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );
        if(!valid){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid username or password");
        }
        return new AuthResponse(jwtSecurity.generatejwt(loginRequest.getUsername()));
    }


}
