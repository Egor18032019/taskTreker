package demo.treker.store.repositories;

 import demo.treker.store.entities.ProjectEntity;
 import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.stream.Stream;

public interface  ProjectRepository extends JpaRepository<ProjectEntity, Long> {

    Optional<ProjectEntity> findByName(String name);

    Stream<ProjectEntity> streamAllBy();// получаем все обьекты

    Stream<ProjectEntity> streamAllByNameStartsWithIgnoreCase(String prefixName); // проверяет что имя начинается
}