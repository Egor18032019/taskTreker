package demo.treker.service;

import demo.treker.api.dto.TaskRequestDto;
import demo.treker.api.exceptoins.BadRequestException;
import demo.treker.api.exceptoins.NotFoundException;
import demo.treker.enums.TaskComplexity;
import demo.treker.enums.TaskPriority;
import demo.treker.enums.TaskSizeCategory;
import demo.treker.store.entities.ProjectEntity;
import demo.treker.store.entities.TaskEntity;
import demo.treker.store.entities.TaskStateEntity;
import demo.treker.store.repositories.ProjectRepository;
import demo.treker.store.repositories.TaskRepository;
import demo.treker.store.repositories.TaskStateRepository;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.config.Task;
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
    TaskStateRepository taskStateRepository;
    TaskStateService taskStateService;

    public List<TaskEntity> fetchTasks(Optional<Long> taskStateId, Optional<String> namePrefix) {
        var tasks = taskRepository.findAll().stream();

        if (taskStateId.isPresent()) {
            tasks = tasks.filter(t -> t.getTaskState() != null &&
                    t.getTaskState().getId().equals(taskStateId.get()));
        }

        if (namePrefix.isPresent() && !namePrefix.get().trim().isEmpty()) {
            tasks = tasks.filter(t -> t.getName() != null &&
                    t.getName().toLowerCase().startsWith(namePrefix.get().toLowerCase()));
        }

        return tasks.collect(Collectors.toList());
    }

    @Transactional
    public TaskEntity createTask(String name, String description,
            Integer sizePoints, String sizeCategory, LocalDate deadline,
            String complexity, String priority,
            Long projectId) { // 👈 project_id теперь обязателен для авто-создания состояния

        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("Task name can't be empty.");
        }

        // 1. Проверяем проект
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));

        // 2. Находим текущий "хвост" воркфлоу (состояние, у которого right = null)
        TaskStateEntity tailState = taskStateRepository
                .findByProjectIdAndRightTaskStateIsNull(projectId)
                .orElse(null);

        // 3. Создаём новое техническое состояние
        TaskStateEntity newState = TaskStateEntity.builder()
                .project(project)
                .leftTaskState(tailState)  // ← линкуем к предыдущему
                .rightTaskState(null)      // → становится новым хвостом
                .build();

        // 4. Обновляем предыдущее состояние (если оно было)
        if (tailState != null) {
            tailState.setRightTaskState(newState);
            taskStateRepository.saveAndFlush(tailState); // сохраняем разрыв старой ссылки
        }

        // 5. Сохраняем новое состояние
        TaskStateEntity savedState = taskStateRepository.saveAndFlush(newState);

        // 6. Создаём задачу и привязываем её к НОВОМУ состоянию
        TaskEntity task = TaskEntity.builder()
                .name(name)
                .description(description)
                .sizePoints(sizePoints)
                .sizeCategory(sizeCategory != null ? TaskSizeCategory.valueOf(sizeCategory.toUpperCase()) : null)
                .deadline(deadline)
                .complexity(complexity != null ? TaskComplexity.valueOf(complexity.toUpperCase()) : null)
                .priority(priority != null ? TaskPriority.valueOf(priority.toUpperCase()) : null)
                .taskState(savedState) // 👈 Привязка к только что созданному техническому узлу
                .build();

        return taskRepository.saveAndFlush(task);
    }

    public TaskEntity updateTask(Long taskId, TaskRequestDto request) {
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException(
                        String.format("Task with id \"%s\" doesn't exist.", taskId)));


        if (request.getName() != null && !request.getName().isBlank()) {
            task.setName(request.getName());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getTaskStateId() != null) {
            TaskStateEntity state = taskStateRepository.findById(request.getTaskStateId())
                    .orElseThrow(() -> new NotFoundException(
                            String.format("TaskState with id \"%s\" doesn't exist.", request.getTaskStateId())));
            task.setTaskState(state);
        }
        if (request.getSizePoints() != null) {
            task.setSizePoints(request.getSizePoints());
        }
        if (request.getSizeCategory() != null) {
            // желательно проверить, что категория допустима (например, из enum)
            task.setSizeCategory(TaskSizeCategory.valueOf(request.getSizeCategory()));
        }
        if (request.getDeadline() != null) {
            task.setDeadline(request.getDeadline());
        }
        if (request.getComplexity() != null) {
            task.setComplexity(TaskComplexity.valueOf(request.getComplexity()));
        }
        if (request.getPriority() != null) {
            task.setPriority(TaskPriority.valueOf(request.getPriority()));
        }

        return taskRepository.save(task);
    }

    public TaskEntity updateTask(Long taskId, String name, String description, Long taskStateId,
            Integer sizePoints, String sizeCategory, LocalDate deadline,
            String complexity, String priority) {

        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException(
                        String.format("Task with id \"%s\" doesn't exist.", taskId)));

        if (name != null && !name.trim().isEmpty()) {
            task.setName(name);
        }
        if (description != null) {
            task.setDescription(description);
        }
        if (taskStateId != null) {
            TaskStateEntity state = taskStateRepository.findById(taskStateId)
                    .orElseThrow(() -> new NotFoundException(
                            String.format("TaskState with id \"%s\" doesn't exist.", taskStateId)));
            task.setTaskState(state);
        }
        if (sizePoints != null) task.setSizePoints(sizePoints);
        if (sizeCategory != null) task.setSizeCategory(TaskSizeCategory.valueOf(sizeCategory.toUpperCase()));
        if (deadline != null) task.setDeadline(deadline);
        if (complexity != null) task.setComplexity(TaskComplexity.valueOf(complexity.toUpperCase()));
        if (priority != null) task.setPriority(TaskPriority.valueOf(priority.toUpperCase()));
        return taskRepository.saveAndFlush(task);
    }

    //todo перелинковка состояний TaskStateEntity
    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new NotFoundException(String.format("Task with id \"%s\" doesn't exist.", taskId));
        }
        taskRepository.deleteById(taskId);
    }

    public TaskEntity getTaskOrThrow(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException(
                        String.format("Task with id \"%s\" doesn't exist.", taskId)));
    }


    //  Получение задач с фильтрацией и сортировкой
    public List<TaskEntity> fetchTasks(
            Optional<Long> taskStateId,
            Optional<String> namePrefix,
            Optional<Long> projectId,
            Optional<String> sortBy,
            Optional<String> sortDir) {

        // 1. Формируем сортировку через JPA
        Sort sort = Sort.unsorted();
        if (sortBy.isPresent() && !sortBy.get().trim().isEmpty()) {
            Sort.Direction direction = sortDir
                    .filter(d -> d.equalsIgnoreCase("asc") || d.equalsIgnoreCase("desc"))
                    .map(d -> d.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC)
                    .orElse(Sort.Direction.ASC);

            String property;
            switch (sortBy.get().toLowerCase().replace("_", "")) {
                case "createdat":
                    property = "createdAt";
                    break;
                case "name":
                    property = "name";
                    break;
                case "deadline":
                    property = "deadline";
                    break;
                case "priority":
                    property = "priority";
                    break;
                case "complexity":
                    property = "complexity";
                    break;
                case "sizepoints":
                    property = "sizePoints";
                    break;
                case "sizecategory":
                    property = "sizeCategory";
                    break;
                case "id":
                    property = "id";
                    break;
                default:
                    throw new IllegalArgumentException("Unexpected value: " + sortBy);
            }
            ;
            sort = Sort.by(direction, property);
        }

        // 2. Получаем данные из БД с сортировкой
        List<TaskEntity> tasks = taskRepository.findAll(sort);


        return tasks.stream()
//todo вынести на бд sql Specification JpaSpecificationExecutor
                .filter(task -> projectId
                        .map(pid -> task.getTaskState() != null &&
                                task.getTaskState().getProject() != null &&
                                task.getTaskState().getProject().getId().equals(pid))
                        .orElse(true))
                // Существующие фильтры
                .filter(task -> taskStateId
                        .map(id -> task.getTaskState() != null && task.getTaskState().getId().equals(id))
                        .orElse(true))
                .filter(task -> namePrefix
                        .filter(p -> !p.trim().isEmpty())
                        .map(p -> task.getName() != null &&
                                task.getName().toLowerCase().startsWith(p.toLowerCase()))
                        .orElse(true))
                .collect(Collectors.toList());
    }

    //  Перевод задачи в другое состояние с валидацией воркфлоу
    public TaskEntity transitionTask(Long taskId, Long toStateId) {
        // 1. Получаем задачу
        TaskEntity task = getTaskOrThrow(taskId);

        // 2. Получаем целевое состояние
        TaskStateEntity targetState = taskStateService.getTaskStateOrThrow(toStateId);

        // 3. Проверяем валидность перехода
        Long currentStateId = task.getTaskState() != null ? task.getTaskState().getId() : null;
        if (!taskStateService.canTransition(currentStateId, toStateId)) {
            throw new BadRequestException(String.format(
                    "Cannot transition task %d from state %s to %s. ",
                    taskId,
                    currentStateId != null ? currentStateId : "null",
                    toStateId
            ));
        }


        task.setTaskState(targetState);
        return taskRepository.saveAndFlush(task);
    }
}