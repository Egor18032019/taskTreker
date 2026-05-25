package demo.treker.store.entities;

import demo.treker.api.dto.UserProfileDto;
import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;


import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String telegramHandle;
    private String maxHandle;
    private String avatarUrl;

    @Embedded
    private RecommendationWeights weights;

    // 🔹 Аудит профиля (независим от аккаунта)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.weights == null) {
            this.weights = RecommendationWeights.defaultWeights();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 🔹 Безопасный DTO-конвертер
    public UserProfileDto toDto() {
        return UserProfileDto.builder()
                .id(this.id)
                .userId(this.user.getId())
                .telegramHandle(this.telegramHandle)
                .maxHandle(this.maxHandle)
                .avatarUrl(this.avatarUrl)
                .weights(this.weights != null ? this.weights.toDto() : null)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }
}