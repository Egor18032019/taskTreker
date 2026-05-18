package demo.treker.api.controllers;

import demo.treker.api.dto.AckDto;
import demo.treker.api.dto.ChecklistItemDto;
import demo.treker.api.dto.TaskDto;
import demo.treker.api.dto.TaskPatchRequestDto;
import demo.treker.api.dto.TaskRequestDto;
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

        return taskService.fetchTasks(taskStateId, namePrefix, projectId, sortBy, Optional.of(sortDir)).stream()
                .map(taskDtoFactory::toTaskDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public TaskDto getTask(@PathVariable Long id) {
        return taskDtoFactory.toTaskDto(taskService.getTaskOrThrow(id));
    }

    @PostMapping
    public TaskDto createTask(@RequestBody TaskRequestDto request) {
        TaskEntity entity = taskService.createTask(
                request.getName(), request.getDescription(), request.getProjectId(),
                request.getCheckList(), request.getSizeCategory(), request.getDeadline(),
                request.getComplexity(), request.getPriority()
        );
        return taskDtoFactory.toTaskDto(entity);
    }

    @PutMapping("/{id}")
    public TaskDto updateTask(@PathVariable Long id, @RequestBody TaskRequestDto request) {
        TaskEntity entity = taskService.updateTask(
                id, request.getName(), request.getDescription(),
                request.getSizeCategory(),
                request.getCheckList(),
                request.getDeadline(),
                request.getComplexity(), request.getPriority()
        );
        return taskDtoFactory.toTaskDto(entity);
    }

    @PatchMapping("/{id}")
    public TaskDto patchTask(@PathVariable Long id, @RequestBody TaskPatchRequestDto patch) {
        TaskEntity updated = taskService.patchTask(id, patch);
        return taskDtoFactory.toTaskDto(updated);
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