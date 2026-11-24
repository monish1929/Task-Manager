package com.example.task_manager.service;

import com.example.task_manager.entity.Task;
import com.example.task_manager.entity.User;
import com.example.task_manager.repository.TaskRepository;
import com.example.task_manager.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    //constructor injection
    public TaskService(TaskRepository taskRepository, UserRepository userRepository){
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }
    public Task createTask(Task task){
        Authentication authentication=SecurityContextHolder.getContext().getAuthentication();
        String username=authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        task.setUser(user);
        return taskRepository.save(task);
    }
    public List<Task> getparticulartask(){
        Authentication authentication=SecurityContextHolder.getContext().getAuthentication();
        String username=authentication.getName();
        User user=userRepository.findByUsername(username)
                .orElseThrow(()->new RuntimeException("user not found"));
        return taskRepository.findByUser(user);
    }
    public User getcurrentuser(){
        Authentication authentication=SecurityContextHolder.getContext().getAuthentication();
        String username=authentication.getName();
        User user=userRepository.findByUsername(username).orElseThrow(()->
            new RuntimeException("User not found")
        );
        return user;
    }
    public Task getTaskById(Long id) {
        User user=getcurrentuser();
        return taskRepository.findByIdAndUser_Username(id, user.getUsername()).orElseThrow(()->new RuntimeException(("Task not found")));
    }
    public Task UpdateTask(Long id,Task updatedtask){
        User user=getcurrentuser();
        Task existing=taskRepository.findByIdAndUser_Username(id,user.getUsername()).orElseThrow(()->new RuntimeException(""));
        existing.setTitle(updatedtask.getTitle());
        existing.setDescription(updatedtask.getDescription());
        existing.setStatus(updatedtask.getStatus());
        existing.setPriority(updatedtask.getPriority());

        return taskRepository.save(existing);
    }
    public boolean DeleteTask(Long id) {
        User user = getcurrentuser();

        Task task = taskRepository
                .findByIdAndUser_Username(id, user.getUsername())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        taskRepository.delete(task);
        return true;
    }
    public Page<Task> getTask(Pageable pageable) {
        User user = getcurrentuser();

        return taskRepository.findByUser_Username(
                user.getUsername(), pageable
        );
    }

}

