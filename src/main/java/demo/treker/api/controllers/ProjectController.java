package demo.treker.api.controllers;

import demo.treker.api.controllers.helpers.ControllerHelper;
import demo.treker.api.dto.AckDto;
import demo.treker.api.dto.ProjectDto;
import demo.treker.api.factories.ProjectDtoFactory;
import demo.treker.service.ProjectService;
import demo.treker.store.entities.ProjectEntity;
import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    ProjectService projectService;
    ProjectDtoFactory projectDtoFactory;
    ControllerHelper controllerHelper;

    @GetMapping
    @Operation(summary = "Получение проектов", description = "Получение проектов + фильтрация.")
    public List<ProjectDto> fetchProjects(
            @RequestParam(value = "prefix_name", required = false) Optional<String> optionalPrefixName) {

        return projectService.fetchProjects(optionalPrefixName)
                .stream()
                .map(projectDtoFactory::makeProjectDto)
                .collect(Collectors.toList());
    }


    @PostMapping
    @Operation(summary = "Создание проекта")
    public ProjectDto createProject(
            @RequestParam(value = "project_name") String projectName) {

        ProjectEntity created = projectService.createProject(projectName);
        return projectDtoFactory.makeProjectDto(created);
    }


    @PutMapping("/{project_id}")
    @Operation(summary = "Обновление проекта")
    public ProjectDto updateProject(
            @PathVariable("project_id") Long projectId,
            @RequestParam(value = "project_name", required = false) Optional<String> optionalProjectName) {

        if (optionalProjectName.isEmpty() || optionalProjectName.get().trim().isEmpty()) {
            return projectDtoFactory.makeProjectDto(
                    projectService.getProjectOrThrow(projectId)); // ничего не меняем
        }

        ProjectEntity updated = projectService.updateProject(projectId, optionalProjectName.get());
        return projectDtoFactory.makeProjectDto(updated);
    }


    @DeleteMapping("/{project_id}")
    @Operation(summary = "Удаление проекта")
    public AckDto deleteProject(@PathVariable("project_id") Long projectId) {
        projectService.deleteProject(projectId);
        return AckDto.makeDefault(true);
    }


    @GetMapping("/{project_id}")
    @Operation(summary = "Получение одного проекта")
    public ProjectDto getProject(@PathVariable("project_id") Long projectId) {
        return projectDtoFactory.makeProjectDto(projectService.getProjectOrThrow(projectId));
    }
}
