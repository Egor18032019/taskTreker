package demo.treker.store.repositories;

 import demo.treker.store.entities.TaskStateEntity;
 import java.util.List;
 import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TaskStateRepository extends JpaRepository<TaskStateEntity, Long> {

    Optional<TaskStateEntity> findByProjectIdAndLeftTaskStateIsNull(Long projectId);

    List<TaskStateEntity> findAllByProjectId(Long projectId);

    Optional<TaskStateEntity> findByProjectIdAndRightTaskStateIsNull(Long projectId);
}