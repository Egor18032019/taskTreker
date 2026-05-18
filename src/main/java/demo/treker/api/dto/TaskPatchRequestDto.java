package demo.treker.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import demo.treker.enums.TaskComplexity;
import demo.treker.enums.TaskPriority;
import demo.treker.enums.TaskSizeCategory;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskPatchRequestDto {
    /*
    Все поля необязательные (клиент передаёт только те, что нужно изменить).
     Если поле null – оно не меняется
     (кроме checkList, где null означает «не изменять», а пустой список – «очистить»).
     */
    String name;
    String description;

    @JsonProperty("task_state_id")
    Long taskStateId;

    @JsonProperty("check_list")
    List<ChecklistItemDto> checkList;

    @JsonProperty("size_category")
    TaskSizeCategory sizeCategory;

    @JsonProperty("deadline")
    LocalDate deadline;

    TaskComplexity complexity;
    TaskPriority priority;
}