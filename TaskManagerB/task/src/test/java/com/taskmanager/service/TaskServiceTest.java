package com.taskmanager.service;

import com.taskmanager.dto.task.TaskRequest;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.model.User;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    @Test
    void createTaskShouldAssignAuthenticatedUser() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Task A");
        request.setDescription("Desc");
        request.setDueDate(LocalDate.now().plusDays(1));
        request.setStatus(TaskStatus.TODO);

        User user = new User();
        user.setEmail("john@example.com");

        Task saved = new Task();
        saved.setId(1L);
        saved.setTitle("Task A");
        saved.setDescription("Desc");
        saved.setDueDate(request.getDueDate());
        saved.setStatus(TaskStatus.TODO);
        saved.setUser(user);

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(taskRepository.save(org.mockito.ArgumentMatchers.any(Task.class))).thenReturn(saved);

        var response = taskService.createTask(request, "john@example.com");

        assertEquals(1L, response.getId());
        assertEquals("Task A", response.getTitle());
    }

    @Test
    void getTaskByIdShouldThrowForNonOwner() {
        when(taskRepository.findByIdAndUserEmail(1L, "john@example.com")).thenReturn(Optional.empty());

        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> taskService.getTaskById(1L, "john@example.com"));
    }
}
