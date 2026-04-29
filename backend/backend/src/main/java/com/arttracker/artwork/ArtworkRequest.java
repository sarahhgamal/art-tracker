package com.arttracker.artwork;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Set;

@Data
public class ArtworkRequest {
    @NotBlank
    private String title;

    @NotNull
    private Medium medium;

    private String description;
    private String imageUrl;
    private Set<Long> tagIds = new java.util.HashSet<>();
}