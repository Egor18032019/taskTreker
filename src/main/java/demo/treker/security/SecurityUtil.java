package demo.treker.security;

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

//        Вариант 1: Наш кастомный UserDetails
        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails  ) {
            CustomUserDetails customUserDetails = (CustomUserDetails) principal;          // явное приведение
            return customUserDetails.getUserId();
        }

        // проверяем, является ли principal экземпляром нашего User
        if (principal instanceof User) {
            User user = (User) principal;          // явное приведение
            return user.getId();                   // используем getId()
        }

        if (principal instanceof Long  ) {
            return (Long) principal;
        }

        throw new IllegalStateException("Unknown authentication principal: " + principal);
    }


}