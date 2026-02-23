package com.taskmanager.service;

import com.taskmanager.dto.task.TaskRequest;
import com.taskmanager.dto.task.TaskResponse;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(String userEmail) {
        return taskRepository.findByUserEmailOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id, String userEmail) {
        Task task = taskRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found."));

        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));

        Task task = new Task();
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setStatus(request.getStatus());
        task.setUser(user);

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request, String userEmail) {
        Task task = taskRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found."));

        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setStatus(request.getStatus());

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long id, String userEmail) {
        Task task = taskRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found."));

        taskRepository.delete(task);
    }
}
