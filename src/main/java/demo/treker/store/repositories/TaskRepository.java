package demo.treker.store.repositories;

import demo.treker.store.entities.TaskEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

public interface TaskRepository extends JpaRepository<TaskEntity, Long>, JpaSpecificationExecutor<TaskEntity> {

    // 🔹 Базовая проверка: задача существует И принадлежит пользователю
    @Query("SELECT t FROM TaskEntity t JOIN t.project p WHERE t.id = :taskId AND p.user.id = :userId")
    Optional<TaskEntity> findByUserIdAndId(@Param("userId") Long userId, @Param("taskId") Long taskId);

    // 🔹 Stream для фильтрации + сортировки на уровне БД
    @Query("SELECT t FROM TaskEntity t JOIN t.project p WHERE p.user.id = :userId")
    Stream<TaskEntity> streamAllByUserId(@Param("userId") Long userId);

    @Query("SELECT t FROM TaskEntity t JOIN t.project p WHERE p.user.id = :userId AND t.project.id = :projectId")
    Stream<TaskEntity> streamAllByUserIdAndProjectId(@Param("userId") Long userId, @Param("projectId") Long projectId);

    // 🔹 Для рекомендаций: все незавершённые задачи пользователя
    @Query("SELECT t FROM TaskEntity t JOIN t.project p WHERE p.user.id = :userId AND t.status != 'DONE'")
    List<TaskEntity> findAllActiveByUserId(@Param("userId") Long userId);

    // 🔹 Для рекомендаций с дедлайном (не просроченные)
    @Query("SELECT t FROM TaskEntity t JOIN t.project p WHERE p.user.id = :userId AND t.status != 'DONE' AND (t.deadline IS NULL OR t.deadline >= :today)")
    List<TaskEntity> findAllActiveWithDeadlineByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);

    boolean existsByProjectIdAndId(Long projectId, Long taskId);

    // 🔹 Пагинация с фильтрацией по пользователю (основной метод)
    @Query("SELECT t FROM TaskEntity t JOIN t.project p WHERE p.user.id = :userId")
    Page<TaskEntity> findAllByUserId(@Param("userId") Long userId, Pageable pageable);

    // 🔹 Пагинация с фильтрацией по проекту
    @Query("SELECT t FROM TaskEntity t JOIN t.project p WHERE p.user.id = :userId AND p.id = :projectId")
    Page<TaskEntity> findAllByUserIdAndProjectId(@Param("userId") Long userId, @Param("projectId") Long projectId, Pageable pageable);

}