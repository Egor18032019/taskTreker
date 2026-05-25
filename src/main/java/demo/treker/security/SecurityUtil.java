package demo.treker.security;

 ;
 import demo.treker.store.entities.User;
 import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
 import org.springframework.security.core.userdetails.UserDetails;
 import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();

        // проверяем, является ли principal экземпляром нашего User
        if (principal instanceof User) {
            User user = (User) principal;          // явное приведение
            return user.getId();                   // используем getId()
        }

        throw new IllegalStateException("Unknown authentication principal: " + principal);
    }
}