package demo.treker.service;

import demo.treker.api.exceptoins.BadRequestException;
import demo.treker.api.exceptoins.NotFoundException;
import demo.treker.store.entities.ProjectEntity;
import demo.treker.store.entities.TaskEntity;
import demo.treker.store.entities.TaskStateEntity;
import demo.treker.store.repositories.ProjectRepository;
import demo.treker.store.repositories.TaskStateRepository;
import java.util.ArrayList;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class TaskStateService {

    TaskStateRepository taskStateRepository;
    ProjectRepository projectRepository;

    public List<TaskStateEntity> fetchTaskStates(Long projectId) {
        var states = taskStateRepository.findAll().stream();

            states = states.filter(s -> s.getProject() != null &&
                    s.getProject().getId().equals(projectId ));

        return states.collect(Collectors.toList());
    }

    public TaskStateEntity createTaskState(Long projectId, Long leftStateId, Long rightStateId) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found"));

        TaskStateEntity left = leftStateId != null ? taskStateRepository.findById(leftStateId).orElse(null) : null;
        TaskStateEntity right = rightStateId != null ? taskStateRepository.findById(rightStateId).orElse(null) : null;

        if (leftStateId == null && rightStateId == null) {
            // Авто-линковка к хвосту
            TaskStateEntity tail = taskStateRepository.findByProjectIdAndRightTaskStateIsNull(projectId).orElse(null);
            if (tail != null) {
                tail.setRightTaskState(null);
                taskStateRepository.saveAndFlush(tail);
                left = tail;
            }
        }

        TaskStateEntity newState = TaskStateEntity.builder()
                .project(project)
                .leftTaskState(left)
                .rightTaskState(right)
                .build();

        TaskStateEntity saved = taskStateRepository.saveAndFlush(newState);

        if (left != null) { left.setRightTaskState(saved); taskStateRepository.saveAndFlush(left); }
        if (right != null) { right.setLeftTaskState(saved); taskStateRepository.saveAndFlush(right); }

        return saved;
    }

    public TaskStateEntity updateTaskState(Long id, String name, Long projectId,
            Long leftStateId, Long rightStateId) {
        TaskStateEntity state = taskStateRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(
                        String.format("TaskState with id \"%s\" doesn't exist.", id)));



        if (projectId != null && !Objects.equals(state.getProject().getId(), projectId)) {
            ProjectEntity project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new NotFoundException(
                            String.format("Project with id \"%s\" doesn't exist.", projectId)));
            state.setProject(project);
        }

        if (leftStateId != null) {
            TaskStateEntity left = taskStateRepository.findById(leftStateId)
                    .orElseThrow(() -> new NotFoundException(
                            String.format("Left TaskState with id \"%s\" doesn't exist.", leftStateId)));
            state.setLeftTaskState(left);
        } else if (leftStateId == null && state.getLeftTaskState() != null) {
            state.setLeftTaskState(null);
        }

        if (rightStateId != null) {
            TaskStateEntity right = taskStateRepository.findById(rightStateId)
                    .orElseThrow(() -> new NotFoundException(
                            String.format("Right TaskState with id \"%s\" doesn't exist.", rightStateId)));
            state.setRightTaskState(right);
        } else if (rightStateId == null && state.getRightTaskState() != null) {
            state.setRightTaskState(null);
        }

        return taskStateRepository.saveAndFlush(state);
    }

    public void deleteTaskState(Long id) {
        TaskStateEntity state = getTaskStateOrThrow(id);

        // 🔗 Перелинковка соседей перед удалением
        TaskStateEntity left = state.getLeftTaskState().orElse(null);
        TaskStateEntity right = state.getRightTaskState().orElse(null);

        if (left != null && right != null) {
            left.setRightTaskState(right);
            right.setLeftTaskState(left);
            taskStateRepository.saveAllAndFlush(List.of(left, right));
        } else if (left != null) {
            left.setRightTaskState(null);
            taskStateRepository.saveAndFlush(left);
        } else if (right != null) {
            right.setLeftTaskState(null);
            taskStateRepository.saveAndFlush(right);
        }

        // Удаляем само состояние (orphanRemoval удалит привязанные задачи, если настроено)
        taskStateRepository.deleteById(id);
    }


    //  Получить упорядоченную цепочку воркфлоу для проекта
    public List<TaskStateEntity> getWorkflowChain(Long projectId) {
        // 1. Проверяем существование проекта
        if (!projectRepository.existsById(projectId)) {
            throw new NotFoundException(String.format("Project with id \"%s\" doesn't exist.", projectId));
        }

        // 2. Находим первое состояние (у которого left = null)
        TaskStateEntity start = taskStateRepository
                .findByProjectIdAndLeftTaskStateIsNull(projectId)
                .orElse(null);

        // Если нет начального состояния — возвращаем все состояния проекта (неупорядоченно)
        if (start == null) {
            return taskStateRepository.findAllByProjectId(projectId);
        }

        // 3. Идём по цепочке через rightTaskState
        List<TaskStateEntity> chain = new ArrayList<>();
        TaskStateEntity current = start;

        // Защита от циклов: максимум 100 итераций
        int iterations = 0;
        while (iterations < 100) {
            if (chain.contains(current)) {
                // Обнаружен цикл — прерываем и выбрасываем ошибку
                throw new BadRequestException("Workflow cycle detected for project " + projectId);
            }
            chain.add(current);
            if(current.getRightTaskState().isEmpty())break;
            current = current.getRightTaskState().get();
            iterations++;
        }

        return chain;
    }

    // ✅ НОВЫЙ МЕТОД: Получить все задачи в конкретном состоянии
    public List<TaskEntity> getTasksInState(Long stateId) {
        TaskStateEntity state = getTaskStateOrThrow(stateId);
        // Используем ленивую загрузку: tasks уже привязаны через @OneToMany(mappedBy = "taskState")
        return state.getTasks() != null ? state.getTasks() : List.of();
    }

    // 🔹 Вспомогательный метод (если ещё нет)
    public TaskStateEntity getTaskStateOrThrow(Long id) {
        return taskStateRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(
                        String.format("TaskState with id \"%s\" doesn't exist.", id)));
    }

    // 🔹 Валидация: можно ли перейти из fromStateId в toStateId?
    public boolean canTransition(Long fromStateId, Long toStateId) {
        if (fromStateId == null || toStateId == null) return false;
        if (fromStateId.equals(toStateId)) return true; // уже в целевом состоянии

        TaskStateEntity from = taskStateRepository.findById(fromStateId).orElse(null);
        if (from == null) return false;

        // Разрешаем переход только в непосредственного соседа (вправо или влево)
        return (from.getRightTaskState() != null && from.getRightTaskState().get().getId().equals(toStateId)) ||
                (from.getLeftTaskState() != null && from.getLeftTaskState().get().getId().equals(toStateId));
    }
}