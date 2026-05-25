package demo.treker.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeightsDto {
    private Double priority;
    private Double deadline;
    private Double complexity;
    private Double size;
}