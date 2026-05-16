package demo.treker.store.entities;

import demo.treker.api.exceptoins.BadRequestException;
import lombok.*;
import lombok.experimental.FieldDefaults;

import javax.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "task_state")
public class TaskStateEntity {
    // валидация цикла
    @PrePersist @PreUpdate
    public void validateNoCycle() {
        if (leftTaskState != null && leftTaskState.getId().equals(this.id)) {
            throw new BadRequestException("State cannot point to itself");
        }
    }


    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "right_task_state_id")
    TaskStateEntity rightTaskState;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "left_task_state_id")
    TaskStateEntity leftTaskState;

    @Builder.Default
    Instant createdAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    ProjectEntity project;

    @OneToMany(mappedBy = "taskState", cascade = CascadeType.ALL,
            orphanRemoval = true)
    @Builder.Default
    List<TaskEntity> tasks = new ArrayList<>();

    public Optional<TaskStateEntity> getLeftTaskState() {
        return Optional.ofNullable(leftTaskState);
    }

    public Optional<TaskStateEntity> getRightTaskState() {
        return Optional.ofNullable(rightTaskState);
    }
}