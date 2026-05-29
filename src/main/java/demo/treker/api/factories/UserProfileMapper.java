package demo.treker.api.factories;

import demo.treker.api.dto.UserProfileDto;
import demo.treker.api.dto.WeightsDto;
import demo.treker.store.entities.RecommendationWeights;
import demo.treker.store.entities.User;
import demo.treker.store.entities.UserProfile;
import org.mapstruct.*;

@Mapper(componentModel = "spring", injectionStrategy = InjectionStrategy.CONSTRUCTOR)
public interface UserProfileMapper {

    @Mapping(target = "id", source = "profile.id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "weights", source = "profile.weights")
    @Mapping(target = "telegramHandle", source = "profile.telegramHandle")
    @Mapping(target = "maxHandle", source = "profile.maxHandle")
    @Mapping(target = "avatarUrl", source = "profile.avatarUrl")
    @Mapping(target = "createdAt", source = "profile.createdAt")
    @Mapping(target = "updatedAt", source = "profile.updatedAt")
    UserProfileDto toDto(User user, UserProfile profile);


    @Named("toWeights")
    default RecommendationWeights toWeights(WeightsDto dto) {
        if (dto == null) return null;
        return RecommendationWeights.builder()
                .priority(dto.getPriority())
                .deadline(dto.getDeadline())
                .complexity(dto.getComplexity())
                .size(dto.getSize())
                .build();
    }
}