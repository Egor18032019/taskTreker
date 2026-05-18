package demo.treker.service;

import demo.treker.api.dto.ChecklistItemDto;
import demo.treker.api.dto.TaskPatchRequestDto;
import demo.treker.api.dto.TaskRequestDto;
import demo.treker.api.exceptoins.BadRequestException;
import demo.treker.api.exceptoins.NotFoundException;
import demo.treker.enums.TaskComplexity;
import demo.treker.enums.TaskPriority;
import demo.treker.enums.TaskSizeCategory;
import demo.treker.store.entities.ChecklistItemEntity;
import demo.treker.store.entities.ProjectEntity;
import demo.treker.store.entities.TaskEntity;
import demo.treker.store.entities.TaskStateEntity;
import demo.treker.store.repositories.ProjectRepository;
import demo.treker.store.repositories.TaskRepository;
import demo.treker.store.repositories.TaskStateRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Map;
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
    public TaskEntity createTask(String name, String description, Long projectId,
            List<ChecklistItemDto> checklist, TaskSizeCategory sizeCategory, LocalDate deadline,
            String complexity, String priority) {

        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("Task name can't be empty.");
        }

        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));

        // 1. Находим текущий хвост воркфлоу
        TaskStateEntity tailState = taskStateRepository
                .findByProjectIdAndRightTaskStateIsNull(projectId)
                .orElse(null);

        // 2. Создаём новое техническое состояние
        TaskStateEntity newState = TaskStateEntity.builder()
                .project(project)
                .leftTaskState(tailState)  // ссылка на managed entity (если tailState != null)
                .rightTaskState(null)
                .build();

        // 3. 🔥 СНАЧАЛА сохраняем НОВОЕ состояние → оно переходит в состояние managed
        TaskStateEntity savedNewState = taskStateRepository.saveAndFlush(newState);

        // 4. Теперь обновляем СТАРОЕ состояние (ссылается на managed entity → ошибки нет)
        if (tailState != null) {
            tailState.setRightTaskState(savedNewState);
            taskStateRepository.saveAndFlush(tailState);
        }

        // 5. Создаём задачу и привязываем к УЖЕ СОХРАНЁННОМУ состоянию
        TaskEntity task = TaskEntity.builder()
                .name(name)
                .description(description)
                .sizeCategory(sizeCategory)
                .deadline(deadline)
                .complexity(complexity != null ? TaskComplexity.valueOf(complexity.toUpperCase()) : null)
                .priority(priority != null ? TaskPriority.valueOf(priority.toUpperCase()) : null)
                .taskState(savedNewState) // ✅ используем managed-сущность
                .build();

        // Добавляем чек-лист
        if (checklist != null) {
            for (int i = 0; i < checklist.size(); i++) {
                ChecklistItemDto dto = checklist.get(i);
                ChecklistItemEntity item = ChecklistItemEntity.builder()
                        .text(dto.getText()).completed(dto.isCompleted()).orderIndex(i).build();
                task.addChecklistItem(item);
            }
        }
        return taskRepository.saveAndFlush(task);
    }



    public TaskEntity updateTask(Long taskId, String name, String description,TaskSizeCategory sizeCategory,
            List<ChecklistItemDto> checklist, LocalDate deadline,
            String complexity, String priority) {

        TaskEntity task = getTaskOrThrow(taskId);

        if (name != null && !name.trim().isEmpty()) task.setName(name);
        if (description != null) task.setDescription(description);
        if (sizeCategory != null) task.setSizeCategory(sizeCategory);
        if (deadline != null) task.setDeadline(deadline);
        if (complexity != null) task.setComplexity(TaskComplexity.valueOf(complexity.toUpperCase()));
        if (priority != null) task.setPriority(TaskPriority.valueOf(priority.toUpperCase()));

        // 🔥 Синхронизируем чек-лист (обновляем/добавляем/удаляем)
        if (checklist != null) syncChecklist(task, checklist);

        return taskRepository.saveAndFlush(task);
    }

    //   умная синхронизация чек-листа
    private void syncChecklist(TaskEntity task, List<ChecklistItemDto> newItems) {
        Map<Long, ChecklistItemDto> newMap = newItems.stream()
                .filter(i -> i.getId() != null)
                .collect(Collectors.toMap(ChecklistItemDto::getId, i -> i));

        List<ChecklistItemEntity> toRemove = new ArrayList<>();
        for (ChecklistItemEntity existing : task.getChecklist()) {
            ChecklistItemDto updated = newMap.get(existing.getId());
            if (updated != null) {
                existing.setText(updated.getText());
                existing.setCompleted(updated.isCompleted());
                existing.setOrderIndex(updated.getOrderIndex());
                newMap.remove(existing.getId()); // помечаем как обработанный
            } else {
                toRemove.add(existing); // больше нет в запросе → удалить
            }
        }
        task.getChecklist().removeAll(toRemove);

        // Добавляем новые элементы
        for (ChecklistItemDto item : newItems) {
            if (item.getId() == null) {
                ChecklistItemEntity newEntity = ChecklistItemEntity.builder()
                        .text(item.getText()).completed(item.isCompleted())
                        .orderIndex(item.getOrderIndex()).build();
                task.addChecklistItem(newEntity);
            }
        }
    }

    @Transactional
    public void deleteTask(Long taskId) {
        // 1. Проверяем существование задачи
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException(
                        String.format("Task with id \"%s\" doesn't exist.", taskId)));

        // 2. Сохраняем ссылку на состояние задачи (до удаления)
        TaskStateEntity taskState = task.getTaskState();

        // 3. 🔥 УДАЛЯЕМ ЗАДАЧУ (orphanRemoval в TaskState не затронет состояние, т.к. связь @ManyToOne)
        taskRepository.deleteById(taskId);

        // 4. Если у задачи было техническое состояние — удаляем его с перелинковкой
        if (taskState != null) {
            relinkAndDeleteTaskState(taskState.getId());
        }
    }

    /**
     * 🔗 Удаляет TaskState с перелинковкой соседей в воркфлоу
     */
    private void relinkAndDeleteTaskState(Long stateId) {
        TaskStateEntity state = taskStateRepository.findById(stateId).orElse(null);
        if (state == null) return; // уже удалено или не найдено
        // 🔒 Проверка: нет ли других задач в этом состоянии ???

        TaskStateEntity left = state.getLeftTaskState().orElse(null);
        TaskStateEntity right = state.getRightTaskState().orElse(null);

        // 🔗 Перелинковка: левый и правый соседи соединяются напрямую
        if (left != null && right != null) {
            // Оба соседа существуют: left → right
            left.setRightTaskState(right);
            right.setLeftTaskState(left);
            taskStateRepository.saveAllAndFlush(List.of(left, right));

        } else if (left != null) {
            // Только левый: он становится новым хвостом
            left.setRightTaskState(null);
            taskStateRepository.saveAndFlush(left);

        } else if (right != null) {
            // Только правый: он становится новой головой
            right.setLeftTaskState(null);
            taskStateRepository.saveAndFlush(right);
        }
        // Если оба null — состояние было единственным, просто удаляем

        // 5. 🔥 Удаляем само состояние
        taskStateRepository.deleteById(stateId);
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


    public TaskEntity patchTask(Long taskId, TaskPatchRequestDto patch) {
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found with id=" + taskId));

        // Обновление простых полей (только если они не null)
        if (patch.getName() != null && !patch.getName().isBlank()) {
            task.setName(patch.getName());
        }
        if (patch.getDescription() != null) {
            task.setDescription(patch.getDescription());
        }
        if (patch.getTaskStateId() != null) {
            TaskStateEntity state = taskStateService.findById(patch.getTaskStateId());
            task.setTaskState(state);
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
        // Если size_points тоже нужно обновлять – добавь поле в TaskPatchRequest и здесь

        // === Обработка чеклиста ===
        if (patch.getCheckList() != null) {
            // 1. Удаляем все старые пункты из коллекции
            //    Благодаря orphanRemoval = true, они будут удалены из БД при сохранении
            task.getChecklist().clear();

            // 2. Создаём новые пункты из DTO и добавляем через вспомогательный метод
            //    orderIndex лучше брать из DTO, чтобы фронтенд управлял порядком
            patch.getCheckList().forEach(dto -> {
                ChecklistItemEntity item = ChecklistItemEntity.builder()
                        .text(dto.getText())
                        .completed(dto.isCompleted())
                        .orderIndex(dto.getOrderIndex())
                        .task(task)   // можно передать здесь, но addChecklistItem сделает это сам
                        .build();
                task.addChecklistItem(item);  // используем хелпер для двусторонней связи
            });
        }

        // 3. Сохраняем задачу – каскадные операции обновят/удалят/вставят пункты чеклиста
        return taskRepository.save(task);
    }
}