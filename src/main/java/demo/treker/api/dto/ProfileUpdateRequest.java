package demo.treker.api.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.Size;
import lombok.*;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    @Email
    private String email;

    @Size(max = 100)
    private String telegramHandle;

    @Size(max = 100)
    private String maxHandle;

    private WeightsDto weights;
}