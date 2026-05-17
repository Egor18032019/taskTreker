package demo.treker.api.factories;

import demo.treker.api.dto.TaskDto;
import demo.treker.store.entities.TaskEntity;
import org.springframework.stereotype.Component;

@Component
public class TaskDtoFactory {

    public TaskDto makeTaskDto(TaskEntity entity) {

        return TaskDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .createdAt(entity.getCreatedAt())
                .description(entity.getDescription())
                .build();
    }
    public TaskDto toTaskDto(TaskEntity entity) {
        return TaskDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .taskStateId(entity.getTaskState().getId())
                .sizePoints(entity.getSizePoints())
                .sizeCategory(entity.getSizeCategory())
                .deadline(entity.getDeadline())
                .priority(entity.getPriority())
                .complexity(entity.getComplexity())
                .build();
    }
}