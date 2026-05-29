package demo.treker.api.dto;

import javax.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeightsDto {
    @DecimalMin("0.0")
    private Double priority;
    @DecimalMin("0.0")
    private Double deadline;
    @DecimalMin("0.0")
    private Double complexity;
    @DecimalMin("0.0")
    private Double size;
}