package com.example.task_manager.controller;

import com.example.task_manager.dto.TaskRequest;
import com.example.task_manager.dto.TaskResponse;
import com.example.task_manager.entity.Task;
import com.example.task_manager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/task")
public class TaskContoller {
    private final TaskService taskService;
    public TaskContoller(TaskService taskService){
        this.taskService=taskService;
    }
    @PostMapping
    public TaskResponse createTask(@Valid @RequestBody TaskRequest task) {
        Task newtask=new Task();
        newtask.setTitle(task.getTitle());
        newtask.setDescription(task.getDescription());
        newtask.setStatus(task.getStatus());
        newtask.setPriority(task.getPriority());
        Task savedtask=taskService.createTask(newtask);
        TaskResponse taskResponse=new TaskResponse();
        taskResponse.setId(savedtask.getId());
        taskResponse.setTitle(savedtask.getTitle());
        taskResponse.setDescription(savedtask.getDescription());
        taskResponse.setStatus(savedtask.getStatus());
        taskResponse.setPriority(savedtask.getPriority());
        taskResponse.setUsername(savedtask.getUser().getUsername());
        return taskResponse;
    }
    @GetMapping("/my-tasks")
    public List<TaskResponse> getMyTasks() {
        List<Task> tasks = taskService.getparticulartask();

        return tasks.stream().map(task -> {
            TaskResponse response = new TaskResponse();
            response.setId(task.getId());
            response.setTitle(task.getTitle());
            response.setDescription(task.getDescription());
            response.setStatus(task.getStatus());
            response.setPriority(task.getPriority());
            response.setUsername(task.getUser().getUsername());
            return response;
        }).toList();
    }
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> findTaskById(@PathVariable Long id){
        Task task=taskService.getTaskById(id);
        if(task==null){
            return ResponseEntity.notFound().build();
        }
        TaskResponse taskResponse = new TaskResponse();
        taskResponse.setId(task.getId());
        taskResponse.setTitle(task.getTitle());
        taskResponse.setDescription(task.getDescription());
        taskResponse.setStatus(task.getStatus());
        taskResponse.setPriority(task.getPriority());
        return ResponseEntity.ok(taskResponse);
    }
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTaskById(@PathVariable Long id,@Valid @RequestBody TaskRequest updatedtask){
        Task task=new Task();
        task.setTitle(updatedtask.getTitle());
        task.setDescription(updatedtask.getDescription());
        task.setStatus(updatedtask.getStatus());
        task.setPriority(updatedtask.getPriority());
        Task ta=taskService.UpdateTask(id,task);
        if(ta==null){
            return ResponseEntity.notFound().build();
        }
        TaskResponse taskResponse= new TaskResponse();
        taskResponse.setId(ta.getId());
        taskResponse.setTitle(ta.getTitle());
        taskResponse.setDescription(ta.getDescription());
        taskResponse.setStatus(ta.getStatus());
        taskResponse.setPriority(ta.getPriority());
        return ResponseEntity.ok(taskResponse);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>DeleteTaskById(@PathVariable Long id){
        boolean res=taskService.DeleteTask(id);
        if(!res){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/page")
    public Page<TaskResponse> getTaskByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortby,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortby).descending()
                : Sort.by(sortby).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return taskService.getTask(pageable).map(task -> {
            TaskResponse response = new TaskResponse();
            response.setId(task.getId());
            response.setTitle(task.getTitle());
            response.setDescription(task.getDescription());
            response.setStatus(task.getStatus());
            response.setPriority(task.getPriority());
            response.setUsername(task.getUser().getUsername());
            return response;
        });
    }
}
