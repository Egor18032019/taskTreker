package demo.treker.api.dto;

import lombok.Builder;
import lombok.Value;

@Value @Builder
public class ChecklistItemDto {
    Long id;
    String text;
    boolean completed;
    int orderIndex;
}