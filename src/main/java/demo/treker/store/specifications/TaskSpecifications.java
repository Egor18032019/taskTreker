package demo.treker.store.specifications;

import demo.treker.enums.TaskPriority;
import demo.treker.enums.TaskSizeCategory;
import demo.treker.enums.TaskStatus;
import demo.treker.store.entities.TaskEntity;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import org.springframework.lang.Nullable;

public class TaskSpecifications {

    public static Specification<TaskEntity> byProjectId(Long projectId) {
        return (root, query, cb) ->
                projectId != null ? cb.equal(root.get("project").get("id"), projectId) : cb.conjunction();
    }

    public static Specification<TaskEntity> byStatus(TaskStatus status) {
        return (root, query, cb) ->
                status != null ? cb.equal(root.get("status"), status) : cb.conjunction();
    }

    public static Specification<TaskEntity> byNamePrefix(String prefix) {
        return (root, query, cb) ->
                prefix != null && !prefix.isEmpty()
                        ? cb.like(cb.lower(root.get("name")),"%"+ prefix.toLowerCase() + "%")
                        : cb.conjunction();
    }

    public static Specification<TaskEntity> byDeadline(LocalDate deadline) {
        return (root, query, cb) ->
                deadline != null ? cb.equal(root.get("deadline"), deadline) : cb.conjunction();
    }


    public static Specification<TaskEntity> buildFilter(
            Long projectId, TaskStatus status, String namePrefix, LocalDate deadline) {

        return Specification.where(byProjectId(projectId))
                .and(byStatus(status))
                .and(byNamePrefix(namePrefix))
                .and(byDeadline(deadline));
    }
    // для всех фильтров
    public static Specification<TaskEntity> buildFilter(
            Long userId,
            @Nullable Long projectId,
            @Nullable TaskStatus status,
            @Nullable String namePrefix,
            @Nullable LocalDate deadline,
            @Nullable String sizeCategory,
            @Nullable String priority) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 🔐 1. ФИЛЬТРАЦИЯ ПО ПОЛЬЗОВАТЕЛЮ (через Project -> User)
            if (userId != null) {
                predicates.add(cb.equal(root.get("project").get("user").get("id"), userId));
            }

            // 📌 Фильтр по проекту
            if (projectId != null) {
                predicates.add(cb.equal(root.get("project").get("id"), projectId));
            }

            // 📌 Фильтр по статусу
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 📌 Поиск по префиксу имени (case-insensitive)
            if (namePrefix != null && !namePrefix.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), namePrefix.trim().toLowerCase() + "%"));
            }

            // 📌 Фильтр по дедлайну (задачи, у которых deadline <= указанной даты)
            if (deadline != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("deadline"), deadline));
            }

            // 📌 НОВЫЙ: Фильтр по размеру
            if (sizeCategory != null && !sizeCategory.trim().isEmpty()) {
                try {
                    TaskSizeCategory size = TaskSizeCategory.valueOf(sizeCategory.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("sizeCategory"), size));
                } catch (IllegalArgumentException e) {
                    //todo Игнорируем некорректные значения или бросаем BadRequest в контроллере ?
                }
            }

            // 📌 НОВЫЙ: Фильтр по приоритету
            if (priority != null && !priority.trim().isEmpty()) {
                try {
                    TaskPriority prio = TaskPriority.valueOf(priority.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("priority"), prio));
                } catch (IllegalArgumentException e) {
                    // Игнорируем некорректные значения
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}