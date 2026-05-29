package demo.treker.store.repositories;

 import demo.treker.store.entities.ProjectEntity;
 import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.stream.Stream;
 import org.springframework.data.jpa.repository.Query;
 import org.springframework.data.repository.query.Param;

public interface  ProjectRepository extends JpaRepository<ProjectEntity, Long> {

    Optional<ProjectEntity> findByName(String name);

    Stream<ProjectEntity> streamAllBy();// получаем все обьекты

    Stream<ProjectEntity> streamAllByNameStartsWithIgnoreCase(String prefixName); // проверяет что имя начинается

    Optional<ProjectEntity> findByUserIdAndName(Long userId, String name);

    @Query("SELECT p FROM ProjectEntity p WHERE p.user.id = :userId AND LOWER(p.name) LIKE LOWER(CONCAT(:prefix, '%'))")
    Stream<ProjectEntity> streamAllByUserIdAndNameStartsWithIgnoreCase(@Param("userId") Long userId, @Param("prefix") String prefix);

    @Query("SELECT p FROM ProjectEntity p WHERE p.user.id = :userId AND LOWER(p.name)" +
            " LIKE LOWER(CONCAT('%', :prefix, '%'))")
    Stream<ProjectEntity> streamAllByUserIdAndNameContainingIgnoreCase(@Param("userId") Long userId, @Param("prefix") String prefix);

    @Query("SELECT p FROM ProjectEntity p WHERE p.user.id = :userId")
    Stream<ProjectEntity> streamAllByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM ProjectEntity p WHERE p.user.id = :userId AND p.id = :projectId")
    Optional<ProjectEntity> findByUserIdAndId(@Param("userId") Long userId, @Param("projectId") Long projectId);

    boolean existsByUserIdAndName(Long userId, String name);

    boolean existsByUserIdAndNameAndIdNot(Long userId, String name, Long excludeId);
}