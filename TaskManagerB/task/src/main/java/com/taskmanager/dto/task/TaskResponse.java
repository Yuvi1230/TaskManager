package com.taskmanager.dto.task;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;

import java.time.LocalDate;

public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private TaskStatus status;

    public static TaskResponse from(Task task) {
        TaskResponse response = new TaskResponse();
        response.id = task.getId();
        response.title = task.getTitle();
        response.description = task.getDescription();
        response.dueDate = task.getDueDate();
        response.status = task.getStatus();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public TaskStatus getStatus() {
        return status;
    }
}
