package demo.treker.service;

import demo.treker.api.dto.ProfileUpdateRequest;
import demo.treker.api.dto.UserProfileDto;
import demo.treker.api.dto.WeightsDto;

import demo.treker.api.exceptoins.BadRequestException;
import demo.treker.api.exceptoins.NotFoundException;
import demo.treker.api.factories.UserProfileMapper;
import demo.treker.security.SecurityUtil;
import demo.treker.store.entities.RecommendationWeights;
import demo.treker.store.entities.User;
import demo.treker.store.entities.UserProfile;
import demo.treker.store.repositories.UserProfileRepository;
import demo.treker.store.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserProfileMapper userProfileMapper;
    private final SecurityUtil securityUtil;

    /** Получить профиль текущего пользователя */
    @Transactional(readOnly = true)
    public UserProfileDto getCurrentProfile() {
        Long userId = securityUtil.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(user));

        return userProfileMapper.toDto(user, profile);
    }

    /** Обновить профиль текущего пользователя */
    public UserProfileDto updateCurrentProfile(ProfileUpdateRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(user));

        // Обновляем базовые поля
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().equals(user.getEmail()) &&
                    userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already registered");
            }
            user.setEmail(request.getEmail());
        }

        // Обновляем профиль
        if (request.getTelegramHandle() != null) {
            profile.setTelegramHandle(request.getTelegramHandle().isBlank() ? null : request.getTelegramHandle());
        }
        if (request.getMaxHandle() != null) {
            profile.setMaxHandle(request.getMaxHandle().isBlank() ? null : request.getMaxHandle());
        }

        // Обновляем веса с валидацией
        if (request.getWeights() != null) {
            validateWeights(request.getWeights());
            profile.setWeights(userProfileMapper.toWeights(request.getWeights()));
        }

        userRepository.save(user);
        userProfileRepository.save(profile);

        return userProfileMapper.toDto(user, profile);
    }

    /** Создать профиль по умолчанию при первом обращении */
    private UserProfile createDefaultProfile(User user) {
        UserProfile profile = UserProfile.builder()
                .user(user)
                .weights(RecommendationWeights.defaultWeights())
                .build();
        return userProfileRepository.save(profile);
    }

    /** Валидация: сумма весов должна быть ≈ 1.0 */
    private void validateWeights(WeightsDto weights) {
        double sum = 0;
        if (weights.getPriority() != null) sum += weights.getPriority();
        if (weights.getDeadline() != null) sum += weights.getDeadline();
        if (weights.getComplexity() != null) sum += weights.getComplexity();
        if (weights.getSize() != null) sum += weights.getSize();

        if (Math.abs(sum - 1.0) > 0.01) {
            throw new BadRequestException(
                    String.format("Сумма весов должна быть равна 1.0, текущая: %.2f", sum));
        }
    }
}