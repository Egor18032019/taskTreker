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

    @GetMapping("/recommended/today")
    public ResponseEntity<List<TaskDto>> getRecommendedForToday() {
//        List<TaskEntity> allTasks = taskService.findAllByUserId(getCurrentUserId());
        //todo как будет профиль -> поменять
        List<TaskEntity> allTasks =taskService.findAll();
        List<TaskEntity> recommended = recommendationService.getRecommendedTasksForToday(allTasks);
        return ResponseEntity.ok(recommended.stream()
                .map(taskDtoFactory::toTaskDto)
                .collect(Collectors.toList()));
    }

    // 🔹 GET /api/tasks?project_id=1&status=IN_PROGRESS
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

//        todo добавить  sizeCategory и Priority
        return taskService.fetchTasks(projectId, status, namePrefix, deadline, sortBy, sortDir).stream()
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

    @DeleteMapping("/{id}")
    public AckDto deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return AckDto.makeDefault(true);
    }

    @PatchMapping("/{id}/status")
    public TaskDto updateStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status) {  // ?status=IN_PROGRESS

        TaskEntity entity = taskService.updateStatus(id, status);
        return taskDtoFactory.toTaskDto(entity);
    }

//    @GetMapping
//    public Page<TaskDto> fetchTasksPaginated(
//            @RequestParam(value = "project_id", required = false) Long projectId,
//            @RequestParam(value = "status", required = false) Optional<TaskStatus> status,
//            @RequestParam(value = "name_prefix", required = false) Optional<String> namePrefix,
//            @RequestParam(value = "deadline", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> deadline,
//            @RequestParam(value = "size_category", required = false) Optional<String> sizeCategory,
//            @RequestParam(value = "priority", required = false) Optional<String> priority,
//            @RequestParam(value = "sort_by", required = false) Optional<String> sortBy,
//            @RequestParam(value = "sort_dir", defaultValue = "asc", required = false) Optional<String> sortDir,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "20") int size
//    ) {
//
//        return taskService.fetchTasksPaginated(projectId, status, namePrefix, deadline, sizeCategory, priority,
//                        sortBy, sortDir, page, size)
//                .map(taskDtoFactory::toTaskDto);
//    }
}