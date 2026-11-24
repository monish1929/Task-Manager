package com.example.task_manager.service;

import com.example.task_manager.entity.User;
import com.example.task_manager.exception.UserAlreadyExistsException;
import com.example.task_manager.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public UserService(UserRepository userRepository,PasswordEncoder passwordEncoder){
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
    }
    public User registerUser(String username,String password){
        boolean exist = userRepository.existsByUsername(username);
        if(exist){
            throw new UserAlreadyExistsException("Username already exist");
        }
        User user=new User();
        user.setUsername(username);
        String hashpass=passwordEncoder.encode(password);
        user.setPassword(hashpass);
        user.setRole("USER");
        return userRepository.save(user);
    }
    public boolean loginUser(String username,String password){
        Optional<User> user=userRepository.findByUsername(username);
        if(user.isEmpty()){
            return false;
        }
        String pass=user.get().getPassword();
        boolean res=passwordEncoder.matches(password,pass);
        return res;
    }
    public List<User> getalluser(){
       return userRepository.findAll();
    }

}
