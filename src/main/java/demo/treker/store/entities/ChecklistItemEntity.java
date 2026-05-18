package demo.treker.store.entities;

import lombok.*;
import lombok.experimental.FieldDefaults;

import javax.persistence.*;

@Setter @Getter @Builder @NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity @Table(name = "checklist_item")
public class ChecklistItemEntity {

    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE)
    Long id;

    String text;

    @Builder.Default
    boolean completed = false;

    @Builder.Default
    int orderIndex = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    TaskEntity task;
}