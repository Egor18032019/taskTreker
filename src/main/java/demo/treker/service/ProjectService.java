package demo.treker.service;

import demo.treker.api.exceptoins.BadRequestException;
import demo.treker.api.exceptoins.NotFoundException;
import demo.treker.security.SecurityUtil;
import demo.treker.store.entities.ProjectEntity;
import demo.treker.store.entities.User;
import demo.treker.store.repositories.ProjectRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class ProjectService {

    ProjectRepository projectRepository;
    SecurityUtil securityUtil;

    public List<ProjectEntity> fetchProjects(Optional<String> optionalPrefixName) {
        Long currentUserId = securityUtil.getCurrentUserId();
        optionalPrefixName = optionalPrefixName.filter(prefix -> !prefix.trim().isEmpty());

        Stream<ProjectEntity> projectStream = optionalPrefixName
                .map(prefix -> projectRepository.streamAllByUserIdAndNameStartsWithIgnoreCase(currentUserId, prefix))
                .orElseGet(() -> projectRepository.streamAllByUserId(currentUserId));

        return projectStream.collect(Collectors.toList());
    }

    public ProjectEntity createProject(String projectName) {
        if (projectName == null || projectName.trim().isEmpty()) {
            throw new BadRequestException("Project name can't be empty.");
        }

        Long currentUserId = securityUtil.getCurrentUserId();
        if (projectRepository.existsByUserIdAndName(currentUserId, projectName)) {
            throw new BadRequestException(String.format("Project \"%s\" already exists.", projectName));
        }

        return projectRepository.saveAndFlush(
                ProjectEntity.builder()
                        .name(projectName)
                        .user(User.builder().id(currentUserId).build())
                        .build());
    }

    public ProjectEntity updateProject(Long projectId, String projectName) {
        Long currentUserId = securityUtil.getCurrentUserId();

        ProjectEntity project = projectRepository.findByUserIdAndId(currentUserId, projectId)
                .orElseThrow(() -> new NotFoundException(
                        String.format("Project with id \"%s\" doesn't exist or access denied.", projectId)));

        if (projectName != null && !projectName.trim().isEmpty()) {
            // Проверяем, нет ли конфликта имён у этого пользователя
            if (projectRepository.existsByUserIdAndNameAndIdNot(currentUserId, projectName, projectId)) {
                throw new BadRequestException(String.format("Project \"%s\" already exists.", projectName));
            }
            project.setName(projectName);
        }

        return projectRepository.saveAndFlush(project);
    }

    public void deleteProject(Long projectId) {
        Long currentUserId = securityUtil.getCurrentUserId();

        boolean exists = projectRepository.findByUserIdAndId(currentUserId, projectId).isPresent();
        if (!exists) {
            throw new NotFoundException(
                    String.format("Project with id \"%s\" doesn't exist or access denied.", projectId));
        }
        projectRepository.deleteById(projectId);
    }

    //  Получение с проверкой прав доступа
    public ProjectEntity getProjectOrThrow(Long projectId) {
        Long currentUserId = securityUtil.getCurrentUserId();

        return projectRepository.findByUserIdAndId(currentUserId, projectId)
                .orElseThrow(() -> new NotFoundException(
                        String.format("Project with id \"%s\" doesn't exist or access denied.", projectId)));
    }
}