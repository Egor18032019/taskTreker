package demo.treker.service;


import demo.treker.store.entities.RefreshToken;
import demo.treker.store.entities.User;
import demo.treker.store.repositories.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private static final long REFRESH_TOKEN_EXPIRY_HOURS = 720; // 30 дней

    @Transactional
    public RefreshToken createToken(User user) {
        // Ревокнуть старые токены (опционально, для безопасности)
        revokeAllUserTokens(user);

        String token = UUID.randomUUID().toString();
        var refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiryDate(LocalDateTime.now().plusHours(REFRESH_TOKEN_EXPIRY_HOURS))
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> verifyToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .filter(rt -> !rt.isRevoked())
                .filter(rt -> !rt.isExpired());
    }

    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.findAllValidTokensByUserId(user.getId())
                .forEach(rt -> {
                    rt.setRevoked(true);
                    refreshTokenRepository.save(rt);
                });
    }
}