package demo.treker.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JwtTokenProvider {

    private final Key key;
    private final long accessTokenExpirationMs;

    /**
     * Конструктор принимает параметры из application.yml
     * Секретный ключ должен быть закодирован в Base64 и иметь минимум 256 бит (32+ символа)
     */
    public JwtTokenProvider(
            @Value("${security.jwt.secret-key}") String secretKey,
            @Value("${security.jwt.access-token-expiration-ms}") long accessTokenExpirationMs) {

        // Декодируем Base64-ключ и создаём криптографический ключ для HMAC-SHA256
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenExpirationMs = accessTokenExpirationMs;
    }

    /**
     * Генерация Access Token (JWT)
     */
    public String generateAccessToken(Long userId, String username, List<? extends GrantedAuthority> authorities) {
        Map<String, Object> claims = Map.of(
                "userId", userId,
                "roles", authorities.stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList())
        );

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpirationMs);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Валидация токена. Возвращает true, если токен корректен и не истёк.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (SecurityException e) {
            log.warn("❌ Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("❌ Invalid JWT structure: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("⏳ Expired JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("❌ Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("❌ JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    // 🔹 Утилиты для извлечения данных из валидного токена
    public Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Long getUserId(String token) {
        return getAllClaims(token).get("userId", Long.class);
    }

    public String getUsername(String token) {
        return getAllClaims(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(String token) {
        return (List<String>) getAllClaims(token).get("roles");
    }

    public Date getExpirationDate(String token) {
        return getAllClaims(token).getExpiration();
    }

    public long getAccessTokenExpirationMs() {
        return accessTokenExpirationMs;
    }
}