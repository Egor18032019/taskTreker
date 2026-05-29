package demo.treker.api.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String telegramHandle;
    private String maxHandle;
    private String avatarUrl;

    private WeightsDto weights;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}