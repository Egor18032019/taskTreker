package demo.treker.service;

import demo.treker.enums.TaskComplexity;
import demo.treker.enums.TaskPriority;
import demo.treker.enums.TaskSizeCategory;
import demo.treker.store.entities.RecommendationWeights;
import demo.treker.store.entities.TaskEntity;
import demo.treker.store.entities.UserProfile;
import demo.treker.store.repositories.UserProfileRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import java.util.Map;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class TaskRecommendationService {

    UserProfileRepository userProfileRepository;

    public List<TaskEntity> getRecommendedTasksForToday(List<TaskEntity> userTasks) {
        // Если список пустой — сразу возвращаем
        if (userTasks == null || userTasks.isEmpty()) {
            return List.of();
        }

        // 🔹 Берём веса из профиля первого пользователя (все задачи одного юзера)
        Long userId = userTasks.get(0).getProject().getUser().getId();
        var weights = userProfileRepository.findByUserId(userId)
                .map(UserProfile::getWeights)
                .orElseGet(RecommendationWeights::defaultWeights);

        LocalDate today = LocalDate.now();

        return userTasks.stream()
                .filter(task -> !task.isCompleted())
                .filter(task -> task.getDeadline() == null || !task.getDeadline().isBefore(today))
                .map(task -> Map.entry(task, calculateScore(task, today, weights)))
                .sorted(Map.Entry.<TaskEntity, Double>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private double calculateScore(TaskEntity task, LocalDate today, RecommendationWeights w) {
        return w.getPriority() * getPriorityScore(task.getPriority()) +
                w.getDeadline() * getDeadlineScore(task.getDeadline(), today) +
                w.getComplexity() * getInverseComplexityScore(task.getComplexity()) +
                w.getSize() * getInverseSizeScore(task.getSizeCategory());
    }

    private double getPriorityScore(TaskPriority priority) {
        switch (priority) {
            case CRITICAL:
                return 4.0;
            case HIGH:
                return 3.0;
            case MEDIUM:
                return 2.0;
            case LOW:
                return 1.00;
            default:
                return 0.5;
        }
    }

    private double getDeadlineScore(LocalDate deadline, LocalDate today) {
        long daysUntil = ChronoUnit.DAYS.between(today, deadline);
        if (daysUntil <= 0) return 5.0;           // сегодня или просрочено
        if (daysUntil <= 1) return 4.5;           // завтра
        if (daysUntil <= 3) return 4.0;           // в течение 3 дней
        if (daysUntil <= 7) return 3.0;           // в течение недели
        return 2.0;                               // дальше
    }

    private double getInverseComplexityScore(TaskComplexity complexity) {
        // Чем проще задача — тем выше скор для выполнения сегодня
        switch (complexity) {
            case EASY:
                return 4.0;
            case MEDIUM:
                return 3.0;
            case HARD:
                return 2.0;
            case EXPERT:
                return 1.0;
            default:
                return 0.5;
        }
    }

    private double getInverseSizeScore(TaskSizeCategory size) {
        // Чем меньше задача — тем реалистичнее сделать её сегодня
        switch (size) {
            case XS:
                return 5.0;
            case S:
                return 4.0;
            case M:
                return 3.0;
            case L:
                return 1.0;
            case XL:
                return 1.0;
            default:
                return 0.5;
        }
    }
}