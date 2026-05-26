package demo.treker.security;

import demo.treker.store.entities.User;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;



/**
 * Адаптер User → UserDetails для Spring Security.
 * Поддерживает два способа создания:
 * 1. Из User entity (при логине через UserDetailsService)
 * 2. Из JWT claims (при запросах с токеном)
 */
@Getter
public class CustomUserDetails implements UserDetails {

    // 🔹 Поля для JWT-режима (когда user == null)
    private final Long userId;
    private final String username;
    private final Collection<? extends GrantedAuthority> authorities;

    // 🔹 Ссылка на entity (только при загрузке из БД)
    private final User user;

    // 🔹 Конструктор для CustomUserDetailsService (загрузка из БД)
    public CustomUserDetails(User user) {
        this.user = user;
        this.userId = user.getId();
        this.username = user.getUsername();
        this.authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());
    }

    // 🔹 Конструктор для JwtAuthenticationFilter (создание из JWT claims)
    public CustomUserDetails(Long userId, String username,
            Collection<? extends GrantedAuthority> authorities) {
        this.user = null; // не загружаем из БД
        this.userId = userId;
        this.username = username;
        this.authorities = authorities != null ? authorities : List.of();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        // Пароль нужен только при аутентификации через UserDetailsService
        return user != null ? user.getPassword() : null;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() {
        return user != null ? user.isAccountNonLocked() : true;
    }

    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return user != null ? user.isEnabled() : true; }
}