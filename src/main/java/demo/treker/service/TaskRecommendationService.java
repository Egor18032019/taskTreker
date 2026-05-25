package demo.treker.service;

import demo.treker.enums.TaskComplexity;
import demo.treker.enums.TaskPriority;
import demo.treker.enums.TaskSizeCategory;
import demo.treker.store.entities.TaskEntity;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class TaskRecommendationService {

    // Веса можно вынести в application.properties
    private static final double WEIGHT_PRIORITY = 0.35;
    private static final double WEIGHT_DEADLINE = 0.30;
    private static final double WEIGHT_COMPLEXITY = 0.20;
    private static final double WEIGHT_SIZE = 0.15;

    public List<TaskEntity> getRecommendedTasksForToday(List<TaskEntity> allTasks) {
        LocalDate today = LocalDate.now();

        return allTasks.stream()
                .filter(task -> !task.isCompleted()) // только незавершённые
                .filter(task -> !task.getDeadline().isBefore(today)) // не просроченные
                .map(task -> Map.entry(task, calculateScore(task, today)))
                .sorted(Map.Entry.<TaskEntity, Double> comparingByValue().reversed())
                .limit(5) // лимит задач на день (настраиваемо)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private double calculateScore(TaskEntity task, LocalDate today) {
        double priorityScore = getPriorityScore(task.getPriority());      // 1-5
        double deadlineScore = getDeadlineScore(task.getDeadline(), today); // 1-5
        double complexityScore = getInverseComplexityScore(task.getComplexity()); // 1-5
        double sizeScore = getInverseSizeScore(task.getSizeCategory());   // 1-5

        return WEIGHT_PRIORITY * priorityScore +
                WEIGHT_DEADLINE * deadlineScore +
                WEIGHT_COMPLEXITY * complexityScore +
                WEIGHT_SIZE * sizeScore;
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