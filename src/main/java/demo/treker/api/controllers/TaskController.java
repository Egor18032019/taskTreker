package demo.treker.api.controllers;

import demo.treker.api.dto.AckDto;
import demo.treker.api.dto.TaskDto;
import demo.treker.api.dto.TaskPatchRequestDto;
import demo.treker.api.dto.TaskRequestDto;
import demo.treker.api.factories.TaskDtoFactory;
import demo.treker.enums.TaskStatus;
import demo.treker.service.TaskRecommendationService;
import demo.treker.service.TaskService;
import demo.treker.store.entities.TaskEntity;
import io.swagger.v3.oas.annotations.Operation;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
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
    TaskRecommendationService recommendationService;

    @Operation(summary = " Рекомендации на сегодня " )
    @GetMapping("/recommended/today")
    public ResponseEntity<List<TaskDto>> getRecommendedForToday() {
        List<TaskEntity> activeTasks = taskService.findActiveTasksByCurrentUser();
        List<TaskEntity> recommended = recommendationService.getRecommendedTasksForToday(activeTasks);
        return ResponseEntity.ok(recommended.stream()
                .map(taskDtoFactory::toTaskDto)
                .collect(Collectors.toList()));
    }


    @GetMapping
    public List<TaskDto> fetchTasks(
            @RequestParam(value = "project_id", required = false) Long projectId,
            @RequestParam(value = "status", required = false) Optional<TaskStatus> status,
            @RequestParam(value = "name_prefix", required = false) Optional<String> namePrefix,
            @RequestParam(value = "deadline", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> deadline,
            @RequestParam(value = "size_category", required = false) Optional<String> sizeCategory,
            @RequestParam(value = "priority", required = false) Optional<String> priority,
            @RequestParam(value = "sort_by", required = false) Optional<String> sortBy,
            @RequestParam(value = "sort_dir", defaultValue = "asc", required = false) Optional<String> sortDir) {

        return taskService.fetchTasks(projectId, status, namePrefix, deadline, sortBy, sortDir).stream()
                .map(taskDtoFactory::toTaskDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Выдача одной задачи" )
    public TaskDto getTask(@PathVariable Long id) {
        return taskDtoFactory.toTaskDto(taskService.getTaskOrThrow(id));
    }


    @PostMapping
    @Operation(summary = "Создание" )
    public TaskDto createTask(@RequestBody TaskRequestDto request) {
        TaskEntity entity = taskService.createTask(
                request.getName(), request.getDescription(), request.getProjectId(),
                request.getCheckList(), request.getSizeCategory(), request.getDeadline(),
                request.getComplexity(), request.getPriority()
        );
        return taskDtoFactory.toTaskDto(entity);
    }


    @PutMapping("/{id}")
    @Operation(summary = "Полное обновление" )
    public TaskDto updateTask(@PathVariable Long id, @RequestBody TaskRequestDto request) {
        TaskEntity entity = taskService.updateTask(
                id, request.getName(), request.getDescription(),
                request.getSizeCategory(), request.getCheckList(),
                request.getDeadline(), request.getComplexity(), request.getPriority()
        );
        return taskDtoFactory.toTaskDto(entity);
    }


    @PatchMapping("/{id}")
    @Operation(summary = "Частичное обновление" )
    public TaskDto patchTask(@PathVariable Long id, @RequestBody TaskPatchRequestDto patch) {
        return taskDtoFactory.toTaskDto(taskService.patchTask(id, patch));
    }


    @DeleteMapping("/{id}")
    @Operation(summary = "Удаление" )
    public AckDto deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return AckDto.makeDefault(true);
    }


    @PatchMapping("/{id}/status")
    @Operation(summary = "Смена статуса" )
    public TaskDto updateStatus(@PathVariable Long id, @RequestParam TaskStatus status) {
        return taskDtoFactory.toTaskDto(taskService.updateStatus(id, status));
    }

    // 🔹 Пагинация (раскомментировать как сделаю на фронте)
    /*
    @GetMapping("/paginated")
    public Page<TaskDto> fetchTasksPaginated(
            @RequestParam(value = "project_id", required = false) Long projectId,
            @RequestParam(value = "status", required = false) Optional<TaskStatus> status,
            @RequestParam(value = "name_prefix", required = false) Optional<String> namePrefix,
            @RequestParam(value = "deadline", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> deadline,
            @RequestParam(value = "size_category", required = false) Optional<String> sizeCategory,
            @RequestParam(value = "priority", required = false) Optional<String> priority,
            @RequestParam(value = "sort_by", required = false) Optional<String> sortBy,
            @RequestParam(value = "sort_dir", defaultValue = "asc", required = false) Optional<String> sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return taskService.fetchTasksPaginated(projectId, status, namePrefix, deadline, sizeCategory, priority,
                        sortBy, sortDir, page, size)
                .map(taskDtoFactory::toTaskDto);
    }
    */
}