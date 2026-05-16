package demo.treker.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("size_points")
    Integer sizePoints;

    @JsonProperty("size_category")
    String sizeCategory;

    @JsonProperty("deadline")
    LocalDate deadline;

    @JsonProperty("complexity")
    String complexity;

    @JsonProperty("priority")
    String priority;
}