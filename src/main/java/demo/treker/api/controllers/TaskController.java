package demo.treker.api.controllers;

import demo.treker.api.dto.AckDto;
import demo.treker.api.dto.TaskDto;
import demo.treker.api.factories.TaskDtoFactory;
import demo.treker.service.TaskService;
import demo.treker.store.entities.TaskEntity;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    TaskService taskService;
    TaskDtoFactory taskDtoFactory;

    // 🔹 GET /api/tasks?name_prefix=...&task_state_id=...&sort_by=...
    @GetMapping
    public List<TaskDto> fetchTasks(
            @RequestParam(value = "name_prefix", required = false) Optional<String> namePrefix,
            @RequestParam(value = "task_state_id", required = false) Optional<Long> taskStateId,
            @RequestParam(value = "project_id", required = false) Optional<Long> projectId,
            @RequestParam(value = "sort_by", required = false) Optional<String> sortBy,
            @RequestParam(value = "sort_dir", defaultValue = "asc", required = false) String sortDir) {

        return taskService.fetchTasks(taskStateId, namePrefix,projectId, sortBy, Optional.of(sortDir)).stream()
                .map(taskDtoFactory::toTaskDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public TaskDto getTask(@PathVariable Long id) {
        return taskDtoFactory.toTaskDto(taskService.getTaskOrThrow(id));
    }

    // 🔹 POST /api/tasks — создание через @RequestParam
    @PostMapping
    public TaskDto createTask(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(value = "project_id", required = false) Long project_id,
            @RequestParam(value = "size_points", required = false) Optional<Integer> sizePoints,
            @RequestParam(value = "size_category", required = false) Optional<String> sizeCategory,
            @RequestParam(value = "deadline", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> deadline,
            @RequestParam(value = "complexity", required = false) Optional<String> complexity,
            @RequestParam(value = "priority", required = false) Optional<String> priority) {


        TaskEntity entity = taskService.createTask(name, description,project_id,
                sizePoints.orElse(null), sizeCategory.orElse(null),
                deadline.orElse(null), complexity.orElse(null), priority.orElse(null)
                );
        return taskDtoFactory.toTaskDto(entity);
    }

    // 🔹 PUT /api/tasks/{id} — полное обновление через @RequestParam (единый стиль)
    @PutMapping("/{id}")
    public TaskDto updateTask(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(value = "task_state_id", required = false) Optional<Long> taskStateId,
            @RequestParam(value = "size_points", required = false) Optional<Integer> sizePoints,
            @RequestParam(value = "size_category", required = false) Optional<String> sizeCategory,
            @RequestParam(value = "deadline", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> deadline,
            @RequestParam(value = "complexity", required = false) Optional<String> complexity,
            @RequestParam(value = "priority", required = false) Optional<String> priority) {

        TaskEntity entity = taskService.updateTask(id, name, description,
                taskStateId.orElse(null), sizePoints.orElse(null), sizeCategory.orElse(null),
                deadline.orElse(null), complexity.orElse(null), priority.orElse(null));
        return taskDtoFactory.toTaskDto(entity);
    }

    // 🔹 PATCH /api/tasks/{id} — частичное обновление (алиас на PUT для гибкости)
    @PatchMapping("/{id}")
    public TaskDto patchTask(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(value = "task_state_id", required = false) Optional<Long> taskStateId,
            @RequestParam(value = "size_points", required = false) Optional<Integer> sizePoints,
            @RequestParam(value = "size_category", required = false) Optional<String> sizeCategory,
            @RequestParam(value = "deadline", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> deadline,
            @RequestParam(value = "complexity", required = false) Optional<String> complexity,
            @RequestParam(value = "priority", required = false) Optional<String> priority) {

        return updateTask(id, name, description, taskStateId, sizePoints, sizeCategory, deadline, complexity, priority);
    }

    // 🔹 POST /api/tasks/{id}/transition — переход по воркфлоу
    @PostMapping("/{id}/transition")
    public TaskDto transitionTask(
            @PathVariable Long id,
            @RequestParam Long to_state_id) {

            TaskEntity entity = taskService.transitionTask(id, to_state_id);
        return taskDtoFactory.toTaskDto(entity);
    }

    @DeleteMapping("/{id}")
    public AckDto deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return AckDto.makeDefault(true);
    }
}