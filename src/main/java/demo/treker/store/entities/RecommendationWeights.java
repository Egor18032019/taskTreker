package demo.treker.store.entities;

import demo.treker.api.dto.WeightsDto;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class RecommendationWeights implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final double EPSILON = 0.01;

    @Column(name = "weight_priority")
    private Double priority = 0.35;

    @Column(name = "weight_deadline")
    private Double deadline = 0.30;

    @Column(name = "weight_complexity")
    private Double complexity = 0.20;

    @Column(name = "weight_size")
    private Double size = 0.15;

    /** Дефолтные веса (сумма = 1.0) */
    public static RecommendationWeights defaultWeights() {
        return RecommendationWeights.builder().build();
    }

    /** Фабрика с немедленной валидацией */
    public static RecommendationWeights of(Double priority, Double deadline,
            Double complexity, Double size) {
        var weights = RecommendationWeights.builder()
                .priority(priority).deadline(deadline)
                .complexity(complexity).size(size).build();
        weights.validate();
        return weights;
    }

    /** Валидация: сумма ≈ 1.0 и каждое значение ∈ [0.0, 1.0] */
    public void validate() {
        double p = priority != null ? priority : 0.0;
        double d = deadline != null ? deadline : 0.0;
        double c = complexity != null ? complexity : 0.0;
        double s = size != null ? size : 0.0;

        double sum = p + d + c + s;
        if (Math.abs(sum - 1.0) > EPSILON) {
            throw new IllegalArgumentException(
                    String.format("Сумма весов должна быть равна 1.0, текущая: %.2f", sum));
        }
        if (p < 0 || d < 0 || c < 0 || s < 0 || p > 1 || d > 1 || c > 1 || s > 1) {
            throw new IllegalArgumentException("Все веса должны быть в диапазоне [0.0, 1.0]");
        }
    }

    /** Авто-нормализация (если пользователь ввёл произвольные числа) */
    public RecommendationWeights normalize() {
        double p = priority != null ? priority : 0.0;
        double d = deadline != null ? deadline : 0.0;
        double c = complexity != null ? complexity : 0.0;
        double s = size != null ? size : 0.0;

        double sum = p + d + c + s;
        if (sum <= 0) return defaultWeights();

        return toBuilder()
                .priority(p / sum)
                .deadline(d / sum)
                .complexity(c / sum)
                .size(s / sum)
                .build();
    }

    /** Конвертация в DTO для REST-ответов */
    public WeightsDto toDto() {
        return WeightsDto.builder()
                .priority(priority)
                .deadline(deadline)
                .complexity(complexity)
                .size(size)
                .build();
    }
}