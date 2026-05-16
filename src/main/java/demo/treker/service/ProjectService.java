package demo.treker.service;

import demo.treker.api.exceptoins.BadRequestException;
import demo.treker.api.exceptoins.NotFoundException;
import demo.treker.store.entities.ProjectEntity;
import demo.treker.store.repositories.ProjectRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class ProjectService {

    ProjectRepository projectRepository;

    public List<ProjectEntity> fetchProjects(Optional<String> optionalPrefixName) {
        optionalPrefixName = optionalPrefixName.filter(prefix -> !prefix.trim().isEmpty());

        Stream<ProjectEntity> projectStream = optionalPrefixName
                .map(projectRepository::streamAllByNameStartsWithIgnoreCase)
                .orElseGet(projectRepository::streamAllBy);

        return projectStream.collect(Collectors.toList());
    }

    public ProjectEntity createProject(String projectName) {
        if (projectName == null || projectName.trim().isEmpty()) {
            throw new BadRequestException("Project name can't be empty.");
        }

        projectRepository.findByName(projectName).ifPresent(existing -> {
            throw new BadRequestException(String.format("Project \"%s\" already exists.", projectName));
        });

        return projectRepository.saveAndFlush(ProjectEntity.builder().name(projectName).build());
    }

    public ProjectEntity updateProject(Long projectId, String projectName) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException(String.format("Project with \"%s\" doesn't exist.", projectId)));

        if (projectName != null && !projectName.trim().isEmpty()) {
            projectRepository.findByName(projectName)
                    .filter(p -> !Objects.equals(p.getId(), projectId))
                    .ifPresent(p -> {
                        throw new BadRequestException(String.format("Project \"%s\" already exists.", projectName));
                    });
            project.setName(projectName);
        }

        return projectRepository.saveAndFlush(project);
    }

    public void deleteProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new NotFoundException(String.format("Project with \"%s\" doesn't exist.", projectId));
        }
        projectRepository.deleteById(projectId);
    }

    public ProjectEntity getProjectOrThrow(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException(String.format("Project with \"%s\" doesn't exist.", projectId)));
    }
}