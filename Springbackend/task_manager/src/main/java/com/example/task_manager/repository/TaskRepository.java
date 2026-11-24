package com.example.task_manager.repository;

import com.example.task_manager.entity.Task;
import com.example.task_manager.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task,Long> {
    public List<Task> findByPriority(String priority);
    public List<Task> findByTitleContaining(String keyword);
    public List<Task> findByUser(User user);
    public Optional<Task> findByIdAndUser_Username(Long id,String username);
    public Page<Task> findByUser_Username(String username, Pageable pageable);
}
