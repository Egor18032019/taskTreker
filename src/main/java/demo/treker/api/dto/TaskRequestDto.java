package demo.treker.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import demo.treker.enums.TaskSizeCategory;
import java.util.List;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskRequestDto {

    @JsonProperty("name")
    String name;

    @JsonProperty("description")
    String description;

    @JsonProperty("task_state_id")
    Long taskStateId;
    @JsonProperty("project_id")
    Long projectId;
    @JsonProperty("check_list")
    List<ChecklistItemDto> checkList;

    @JsonProperty("size_category")
    TaskSizeCategory sizeCategory;

    @JsonProperty("deadline")
    LocalDate deadline;

    @JsonProperty("complexity")
    String complexity;

    @JsonProperty("priority")
    String priority;
}