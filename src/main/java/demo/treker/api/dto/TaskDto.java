package demo.treker.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import demo.treker.enums.TaskComplexity;
import demo.treker.enums.TaskPriority;
import demo.treker.enums.TaskSizeCategory;
import demo.treker.enums.TaskStatus;
import demo.treker.store.entities.TaskEntity;
import java.time.LocalDate;
import java.util.List;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskDto {
    //todo добавить валидацию
    Long id;
    String name;
    @JsonProperty("created_at")
    Instant createdAt;

    String description;
    @JsonProperty("check_list")
    List<ChecklistItemDto> checkList;
    @JsonProperty("size_category")
    TaskSizeCategory sizeCategory;
    TaskStatus status;
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate deadline;
    TaskComplexity complexity;
    TaskPriority priority;
    @JsonProperty("project_id")
    Long projectId;


}