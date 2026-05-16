package demo.treker.api.factories;

import demo.treker.api.dto.TaskDto;
import demo.treker.api.dto.TaskStateDto;
import demo.treker.store.entities.TaskEntity;
import demo.treker.store.entities.TaskStateEntity;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Component
public class TaskStateDtoFactory {

    TaskDtoFactory taskDtoFactory;

    public TaskStateDto toTaskStateDto(TaskStateEntity entity) {
        return TaskStateDto.builder()
                .id(entity.getId())
                .leftTaskStateId(entity.getLeftTaskState().isPresent() ? entity.getLeftTaskState().get().getId() : null)
                .rightTaskStateId(entity.getRightTaskState().isPresent() ? entity.getRightTaskState().get().getId() : null)
                .createdAt(entity.getCreatedAt())
                .projectId(entity.getProject().getId())
                .tasks(entity.getTasks() != null ? entity.getTasks().stream()
                        .map(TaskEntity::getId)
                        .collect(Collectors.toList()) : List.of())
                .build();
    }


//    public TaskStateDto makeTaskStateDto(TaskStateEntity entity) {
//
//        return TaskStateDto.builder()
//                .id(entity.getId())
//                .name(entity.getName())
//                .createdAt(entity.getCreatedAt())
//                .leftTaskStateId(entity.getLeftTaskState().map(TaskStateEntity::getId).orElse(null))
//                .rightTaskStateId(entity.getRightTaskState().map(TaskStateEntity::getId).orElse(null))
//                .tasks(
//                        entity
//                                .getTasks()
//                                .stream()
//                                .map(taskDtoFactory::makeTaskDto)
//                                .collect(Collectors.toList())
//                )
//                .build();
//    }
}