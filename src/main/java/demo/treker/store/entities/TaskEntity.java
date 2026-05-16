package demo.treker.store.entities;

import demo.treker.enums.TaskComplexity;
import demo.treker.enums.TaskPriority;
import demo.treker.enums.TaskSizeCategory;
import java.time.LocalDate;
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
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    Long id;

    String name;

    @Builder.Default
    Instant createdAt = Instant.now();

    String description;

    @Column(name = "size_points")
    Integer sizePoints;
    @Enumerated(EnumType.STRING)
    @Column(name = "size_category")
    TaskSizeCategory sizeCategory;
    @Column(name = "deadline")
    LocalDate deadline;
    @Enumerated(EnumType.STRING)
    TaskComplexity complexity;
    @Enumerated(EnumType.STRING)
    TaskPriority priority;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_state_id", referencedColumnName = "id")
    TaskStateEntity taskState;
}