package demo.treker.store.entities;

import demo.treker.enums.TaskComplexity;
import demo.treker.enums.TaskPriority;
import demo.treker.enums.TaskSizeCategory;
import demo.treker.enums.TaskStatus;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.experimental.FieldDefaults;

import javax.persistence.*;
import java.time.Instant;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "task")
public class TaskEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String name;

    @Builder.Default
    Instant createdAt = Instant.now();

    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    TaskStatus status = TaskStatus.BACKLOG;  // 👈 По умолчанию: новая задача = в бэклоге
    @Enumerated(EnumType.STRING)
    @Column(name = "size_category")
    TaskSizeCategory sizeCategory;
    @Column(name = "deadline")
    LocalDate deadline;
    @Enumerated(EnumType.STRING)
    TaskComplexity complexity;
    @Enumerated(EnumType.STRING)
    @OrderBy("CASE priority WHEN 'LOW' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'HIGH' THEN 3 WHEN 'CRITICAL' THEN 4 END")
    TaskPriority priority;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    List<ChecklistItemEntity> checklist = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    ProjectEntity project; //Задача принадлежит проекту → проект принадлежит пользователю

    public void addChecklistItem(ChecklistItemEntity item) {
        checklist.add(item);
        item.setTask(this);
    }

    public boolean isCompleted() {
        return this.status == TaskStatus.DONE;
    }

    /**
     * Вспомогательный метод для быстрой проверки прав
     * @param userId
     * @return boolean
     */
    public boolean isOwnedBy(Long userId) {
        return this.project != null && this.project.getUser() != null
                && this.project.getUser().getId().equals(userId);
    }

}