package demo.treker.store.repositories;

import demo.treker.enums.TaskStatus;
import demo.treker.store.entities.TaskEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<TaskEntity, Long>, JpaSpecificationExecutor<TaskEntity> {  // 👈 Добавляем поддержку Specifications

     @Query("SELECT t FROM TaskEntity t WHERE t.project.id = :projectId AND t.status = :status")
     List<TaskEntity> findByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") TaskStatus status);
}