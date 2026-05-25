package demo.treker.api.factories;

import demo.treker.api.dto.UserProfileDto;
import demo.treker.api.dto.WeightsDto;
import demo.treker.store.entities.RecommendationWeights;
import demo.treker.store.entities.UserProfile;
import org.mapstruct.*;

@Mapper(componentModel = "spring", injectionStrategy = InjectionStrategy.CONSTRUCTOR)
public interface UserMapper {

    // 🔹 Entity → DTO
    @Mapping(target = "weights", source = "weights")
    @Mapping(target = "userId", source = "user.id")
    UserProfileDto toDto(UserProfile profile);

    WeightsDto toDto(RecommendationWeights weights);

    // 🔹 DTO → Entity (для создания/обновления)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "weights", source = "weights", qualifiedByName = "toWeights")
    UserProfile fromDto(UserProfileDto dto);

    @Named("toWeights")
    default RecommendationWeights toWeights(WeightsDto dto) {
        return RecommendationWeights.builder()
                .priority(dto.getPriority())
                .deadline(dto.getDeadline())
                .complexity(dto.getComplexity())
                .size(dto.getSize())
                .build();
    }
}