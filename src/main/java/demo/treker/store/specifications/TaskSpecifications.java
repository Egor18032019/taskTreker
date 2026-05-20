package demo.treker.store.specifications;

import demo.treker.enums.TaskStatus;
import demo.treker.store.entities.TaskEntity;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

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
                        ? cb.like(cb.lower(root.get("name")), prefix.toLowerCase() + "%")
                        : cb.conjunction();
    }

    public static Specification<TaskEntity> byDeadline(LocalDate deadline) {
        return (root, query, cb) ->
                deadline != null ? cb.equal(root.get("deadline"), deadline) : cb.conjunction();
    }

    // 🔹 Комбинированный метод для всех фильтров
    public static Specification<TaskEntity> buildFilter(
            Long projectId, TaskStatus status, String namePrefix, LocalDate deadline) {

        return Specification.where(byProjectId(projectId))
                .and(byStatus(status))
                .and(byNamePrefix(namePrefix))
                .and(byDeadline(deadline));
    }
}