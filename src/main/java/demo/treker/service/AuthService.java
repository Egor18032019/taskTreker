package demo.treker.service;

import demo.treker.api.dto.AuthResponse;
import demo.treker.api.dto.LoginRequest;
import demo.treker.api.dto.RegisterRequest;
import demo.treker.api.factories.UserMapper;
import demo.treker.security.JwtTokenProvider;
import demo.treker.store.entities.RecommendationWeights;
import demo.treker.store.entities.RefreshToken;
import demo.treker.store.entities.User;
import demo.treker.store.entities.UserProfile;
import demo.treker.store.repositories.UserRepository;
import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final UserMapper userMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    private static final long ACCESS_TOKEN_EXPIRY_MIN = 15;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new IllegalArgumentException("Username already taken");
        if (userRepository.existsByEmail(request.getEmail()))
            throw new IllegalArgumentException("Email already registered");

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .accountNonLocked(true)
                .build();

        UserProfile profile = UserProfile.builder()
                .user(user)
                .weights(RecommendationWeights.defaultWeights())
                .build();

        user.setProfile(profile);
        userRepository.save(user); // cascade = ALL сохранит профиль

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.resetFailedLoginAttempts();
        userRepository.save(user);

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken token = refreshTokenService.verifyToken(refreshToken)
                .orElseThrow(() -> new SecurityException("Invalid or expired refresh token"));

        User user = token.getUser();
        refreshTokenService.revokeToken(refreshToken); // rotation

        return generateAuthResponse(user);
    }

    // Внутри AuthService.java
    private AuthResponse generateAuthResponse(User user) {
        // 1️⃣ Генерируем JWT
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(),
                user.getUsername(),
                new ArrayList<>(user.getAuthorities()) // List<? extends GrantedAuthority>
        );

        // 2️⃣ Создаём Refresh Token в БД (opaque UUID)
        RefreshToken refresh = refreshTokenService.createToken(user);

        // 3️⃣ Собираем ответ
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refresh.getToken())
                .expiresInSec(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .profile(userMapper.toDto(user.getProfile()))
                .build();
    }
}