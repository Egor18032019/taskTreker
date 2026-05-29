package demo.treker.store.repositories;

import demo.treker.store.entities.UserProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
