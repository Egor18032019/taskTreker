package demo.treker.service;

import demo.treker.api.dto.ChecklistItemDto;
import demo.treker.api.dto.TaskPatchRequestDto;
import demo.treker.api.exceptoins.BadRequestException;
import demo.treker.api.exceptoins.NotFoundException;
import demo.treker.enums.TaskComplexity;
import demo.treker.enums.TaskPriority;
import demo.treker.enums.TaskSizeCategory;
import demo.treker.enums.TaskStatus;
import demo.treker.security.SecurityUtil;
import demo.treker.store.entities.ChecklistItemEntity;
import demo.treker.store.entities.ProjectEntity;
import demo.treker.store.entities.TaskEntity;
import demo.treker.store.repositories.ProjectRepository;
import demo.treker.store.repositories.TaskRepository;
import demo.treker.store.specifications.TaskSpecifications;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class TaskService {
    ProjectRepository projectRepository;
    TaskRepository taskRepository;
    SecurityUtil securityUtil;

    public TaskEntity createTask(String name, String description, Long projectId,
            List<ChecklistItemDto> checklist, TaskSizeCategory sizeCategory,
            LocalDate deadline, String complexity, String priority) {

        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("Task name can't be empty.");
        }

        Long currentUserId = securityUtil.getCurrentUserId();

        // 🔐 Проверяем, что проект существует И принадлежит текущему пользователю
        ProjectEntity project = projectRepository.findByUserIdAndId(currentUserId, projectId)
                .orElseThrow(() -> new NotFoundException(
                        String.format("Project with id \"%s\" doesn't exist or access denied.", projectId)));

        TaskEntity task = TaskEntity.builder()
                .project(project)
                .name(name)
                .description(description)
                .sizeCategory(sizeCategory)
                .deadline(deadline)
                .complexity(complexity != null ? TaskComplexity.valueOf(complexity.toUpperCase()) : null)
                .priority(priority != null ? TaskPriority.valueOf(priority.toUpperCase()) : null)
                .status(TaskStatus.BACKLOG)
                .build();

        if (checklist != null) {
            for (int i = 0; i < checklist.size(); i++) {
                ChecklistItemDto dto = checklist.get(i);
                ChecklistItemEntity item = ChecklistItemEntity.builder()
                        .text(dto.getText())
                        .completed(dto.isCompleted())
                        .orderIndex(i)
                        .build();
                task.addChecklistItem(item);
            }
        }
        return taskRepository.saveAndFlush(task);
    }


    public TaskEntity updateTask(Long taskId, String name, String description, TaskSizeCategory sizeCategory,
            List<ChecklistItemDto> checklist, LocalDate deadline,
            String complexity, String priority) {

        TaskEntity task = getTaskOrThrow(taskId); // уже проверяет права

        if (name != null && !name.trim().isEmpty()) task.setName(name);
        if (description != null) task.setDescription(description);
        if (sizeCategory != null) task.setSizeCategory(sizeCategory);
        if (deadline != null) task.setDeadline(deadline);
        if (complexity != null) task.setComplexity(TaskComplexity.valueOf(complexity.toUpperCase()));
        if (priority != null) task.setPriority(TaskPriority.valueOf(priority.toUpperCase()));

        if (checklist != null) syncChecklist(task, checklist);

        return taskRepository.saveAndFlush(task);
    }

    //   умная синхронизация чек-листа
    private void syncChecklist(TaskEntity task, List<ChecklistItemDto> newItems) {
        Map<Long, ChecklistItemDto> newMap = newItems.stream()
                .filter(i -> i.getId() != null)
                .collect(Collectors.toMap(ChecklistItemDto::getId, i -> i));

        // 1. Обновляем существующие или помечаем на удаление
        List<ChecklistItemEntity> toRemove = new ArrayList<>();
        for (ChecklistItemEntity existing : task.getChecklist()) {
            ChecklistItemDto updated = newMap.get(existing.getId());
            if (updated != null) {
                existing.setText(updated.getText());
                existing.setCompleted(updated.isCompleted());
                existing.setOrderIndex(updated.getOrderIndex());
                newMap.remove(existing.getId());
            } else {
                toRemove.add(existing); // orphanRemoval удалит из БД
            }
        }
        task.getChecklist().removeAll(toRemove);

        // 2. Добавляем новые (без ID)
        for (ChecklistItemDto item : newItems) {
            if (item.getId() == null) {
                ChecklistItemEntity newEntity = ChecklistItemEntity.builder()
                        .text(item.getText())
                        .completed(item.isCompleted())
                        .orderIndex(item.getOrderIndex())
                        .build();
                task.addChecklistItem(newEntity);
            }
        }
    }

    @Transactional
    public void deleteTask(Long taskId) {
        TaskEntity task = getTaskOrThrow(taskId); // проверка прав внутри
        taskRepository.deleteById(taskId);
    }

    public TaskEntity getTaskOrThrow(Long taskId) {
        Long currentUserId = securityUtil.getCurrentUserId();
        return taskRepository.findByUserIdAndId(currentUserId, taskId)
                .orElseThrow(() -> new NotFoundException(
                        String.format("Task with id \"%s\" doesn't exist or access denied.", taskId)));
    }

    // Получение задач с фильтрацией
    public List<TaskEntity> fetchTasks(Long projectId, Optional<TaskStatus> status,
            Optional<String> namePrefix, Optional<LocalDate> deadline,
            Optional<String> sortBy, Optional<String> sortDir) {

        Long currentUserId = securityUtil.getCurrentUserId();

        Specification<TaskEntity> spec = TaskSpecifications.buildFilter(
                projectId,
                status.orElse(null),
                namePrefix.filter(p -> !p.isEmpty()).orElse(null),
                deadline.orElse(null)
        );

        // 🔹 Добавляем обязательную фильтрацию по пользователю
        Specification<TaskEntity> userSpec = (root, query, cb) ->
                cb.equal(root.get("project").get("user").get("id"), currentUserId);

        Sort sort = buildSort(sortBy, sortDir);

        return taskRepository.findAll(userSpec.and(spec), sort);
    }

    public TaskEntity patchTask(Long taskId, TaskPatchRequestDto patch) {
        TaskEntity task = getTaskOrThrow(taskId);

        if (patch.getName() != null && !patch.getName().isBlank()) {
            task.setName(patch.getName());
        }
        if (patch.getDescription() != null) {
            task.setDescription(patch.getDescription());
        }
        if (patch.getSizeCategory() != null) {
            task.setSizeCategory(patch.getSizeCategory());
        }
        if (patch.getDeadline() != null) {
            task.setDeadline(patch.getDeadline());
        }
        if (patch.getComplexity() != null) {
            task.setComplexity(patch.getComplexity());
        }
        if (patch.getPriority() != null) {
            task.setPriority(patch.getPriority());
        }

        // 🔹 Чек-лист: используем syncChecklist вместо полной перезаписи
        if (patch.getCheckList() != null) {
            syncChecklist(task, patch.getCheckList());
        }

        return taskRepository.save(task);
    }

    public TaskEntity updateStatus(Long taskId, TaskStatus newStatus) {
        TaskEntity task = getTaskOrThrow(taskId);
        task.setStatus(newStatus);
        return taskRepository.saveAndFlush(task);
    }

    //    Для рекомендаций: активные задачи пользователя
    public List<TaskEntity> findActiveTasksByCurrentUser() {
        Long userId = securityUtil.getCurrentUserId();
        return taskRepository.findAllActiveByUserId(userId);
    }

    /**
     * Строит объект Sort для JPA на основе параметров сортировки
     *
     * @param sortBy  поле для сортировки (name, deadline, priority, createdAt, status)
     * @param sortDir направление: "asc" или "desc"
     * @return готовый Sort для использования в repository.findAll(spec, sort)
     */
    private Sort buildSort(Optional<String> sortBy, Optional<String> sortDir) {
        if (sortBy.isEmpty() || sortBy.get().trim().isEmpty()) {
            return Sort.unsorted();
        }

        // Определяем направление
        Sort.Direction direction = sortDir
                .filter(d -> d.equalsIgnoreCase("asc") || d.equalsIgnoreCase("desc"))
                .map(d -> d.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC)
                .orElse(Sort.Direction.ASC);

        String property;
        switch (sortBy.get().toLowerCase()) {
            case "deadline":
                property = "deadline";
                break;
            case "priority":
                property = "priority";
                break;
            case "complexity":
                property = "complexity";
                break;
            case "createdat":
            case "created_at":
                property = "createdAt";
                break;
            case "name":
                property = "name";
                break;
            case "status":
                property = "status";
                break;
            default:
                property = "id";
        }

        return Sort.by(direction, property);
    }

    // 🔹 Пагинация задач с фильтрацией
    public Page<TaskEntity> fetchTasksPaginated(
            Long projectId,
            Optional<TaskStatus> status,
            Optional<String> namePrefix,
            Optional<LocalDate> deadline,
            Optional<String> sizeCategory,
            Optional<String> priority,
            Optional<String> sortBy,
            Optional<String> sortDir,
            int page,
            int size) {

        Long currentUserId = securityUtil.getCurrentUserId();

        // 1. Строим спецификацию фильтрации
        Specification<TaskEntity> spec = TaskSpecifications.buildFilter(
                currentUserId,
                projectId,
                status.orElse(null),
                namePrefix.filter(p -> !p.isEmpty()).orElse(null),
                deadline.orElse(null),
                sizeCategory.filter(s -> !s.isEmpty()).orElse(null),
                priority.filter(p -> !p.isEmpty()).orElse(null)
        );


        // 2. Строим сортировку
        Sort sort = buildSort(sortBy, sortDir);
        Pageable pageable = PageRequest.of(page, size, sort);

        return taskRepository.findAll(spec, pageable);
    }
}