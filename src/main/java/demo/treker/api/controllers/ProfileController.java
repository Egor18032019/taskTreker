package demo.treker.api.controllers;

import demo.treker.api.dto.ProfileUpdateRequest;
import demo.treker.api.dto.UserProfileDto;
import demo.treker.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Управление профилем текущего пользователя")
@SecurityRequirement(name = "bearerAuth")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    @Operation(summary = "Получить профиль текущего пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профиль получен"),
            @ApiResponse(responseCode = "401", description = "Неавторизован")
    })
    public ResponseEntity<UserProfileDto> getCurrentProfile() {
        return ResponseEntity.ok(profileService.getCurrentProfile());
    }

    @PatchMapping("/me")
    @Operation(summary = "Обновить профиль текущего пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профиль обновлён"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные"),
            @ApiResponse(responseCode = "401", description = "Неавторизован")
    })
    public ResponseEntity<UserProfileDto> updateCurrentProfile(
            @RequestBody @Validated ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateCurrentProfile(request));
    }
}