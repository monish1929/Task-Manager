package com.example.task_manager.security;

import com.example.task_manager.entity.User;
import com.example.task_manager.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    public CustomUserDetailsService(UserRepository userRepository){
        this.userRepository=userRepository;
    }
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
        User dbUser = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("No user was found"));
        return org.springframework.security.core.userdetails.User
                .withUsername(dbUser.getUsername())
                .password(dbUser.getPassword())
                .roles(dbUser.getRole())
                .build();
    }
}
