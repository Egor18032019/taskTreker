package demo.treker.api.controllers;

import demo.treker.api.dto.AckDto;
import demo.treker.api.dto.TaskDto;
import demo.treker.api.dto.TaskStateDto;
import demo.treker.api.factories.TaskDtoFactory;
import demo.treker.api.factories.TaskStateDtoFactory;
import demo.treker.service.TaskStateService;
import demo.treker.store.entities.TaskStateEntity;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
@RestController
@RequestMapping("/api/task-states")
public class TaskStateController {

    TaskStateService taskStateService;
    TaskStateDtoFactory taskStateDtoFactory;
    TaskDtoFactory taskDtoFactory;

    // 🔹 GET /api/task-states?project_id=...&name_prefix=...
    @GetMapping
    public List<TaskStateDto> fetchTaskStates(
            @RequestParam(value = "project_id", required = false) Long projectId
            ) {

        return taskStateService.fetchTaskStates(projectId).stream()
                .map(taskStateDtoFactory::toTaskStateDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public TaskStateDto getTaskState(@PathVariable Long id) {
        return taskStateDtoFactory.toTaskStateDto(taskStateService.getTaskStateOrThrow(id));
    }

    // 🔹 POST /api/task-states — создание
    @PostMapping
    public TaskStateDto createTaskState(
            @RequestParam Long project_id,
            @RequestParam(value = "left_state_id", required = false) Optional<Long> leftStateId,
            @RequestParam(value = "right_state_id", required = false) Optional<Long> rightStateId) {

        TaskStateEntity entity = taskStateService.createTaskState(project_id,
                leftStateId.orElse(null), rightStateId.orElse(null));
        return taskStateDtoFactory.toTaskStateDto(entity);
    }

    // 🔹 PUT /api/task-states/{id} — полное обновление
    @PutMapping("/{id}")
    public TaskStateDto updateTaskState(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(value = "project_id", required = false) Optional<Long> projectId,
            @RequestParam(value = "left_state_id", required = false) Optional<Long> leftStateId,
            @RequestParam(value = "right_state_id", required = false) Optional<Long> rightStateId) {

        TaskStateEntity entity = taskStateService.updateTaskState(id, name,
                projectId.orElse(null), leftStateId.orElse(null), rightStateId.orElse(null));
        return taskStateDtoFactory.toTaskStateDto(entity);
    }

    // 🔹 PATCH /api/task-states/{id} — частичное обновление
    @PatchMapping("/{id}")
    public TaskStateDto patchTaskState(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(value = "project_id", required = false) Optional<Long> projectId,
            @RequestParam(value = "left_state_id", required = false) Optional<Long> leftStateId,
            @RequestParam(value = "right_state_id", required = false) Optional<Long> rightStateId) {

        return updateTaskState(id, name, projectId, leftStateId, rightStateId);
    }

    // 🔹 GET /api/task-states/workflow?project_id=... — цепочка воркфлоу
    @GetMapping("/workflow")
    public List<TaskStateDto> getWorkflow(@RequestParam Long project_id) {
        return taskStateService.getWorkflowChain(project_id).stream()
                .map(taskStateDtoFactory::toTaskStateDto)
                .collect(Collectors.toList());
    }

    // 🔹 GET /api/task-states/{id}/tasks — задачи в состоянии
    @GetMapping("/{id}/tasks")
    public List<TaskDto> getTasksInState(@PathVariable Long id) {
        // Предполагается, что TaskDtoFactory инжектирован или используется TaskService
        return taskStateService.getTasksInState(id).stream()
                .map(taskDtoFactory::toTaskDto)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/{id}")
    public AckDto deleteTaskState(@PathVariable Long id) {
        taskStateService.deleteTaskState(id);
        return AckDto.makeDefault(true);
    }
}