package demo.treker.api.factories;

import demo.treker.api.dto.ChecklistItemDto;
import demo.treker.api.dto.TaskDto;
import demo.treker.store.entities.TaskEntity;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class TaskDtoFactory {

    public TaskDto toTaskDto(TaskEntity entity) {
        List<ChecklistItemDto> checklistDto = entity.getChecklist().stream()
                .map(item -> ChecklistItemDto.builder()
                        .id(item.getId())
                        .text(item.getText())
                        .completed(item.isCompleted())
                        .orderIndex(item.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        return TaskDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .checkList(checklistDto)
                .sizeCategory(entity.getSizeCategory())
                .status(entity.getStatus())
                .deadline(entity.getDeadline())
                .priority(entity.getPriority())
                .complexity(entity.getComplexity())
                .projectId(entity.getProject().getId())
                .build();
    }
}