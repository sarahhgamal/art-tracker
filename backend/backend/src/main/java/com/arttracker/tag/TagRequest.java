package com.arttracker.tag;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TagRequest {
    @NotBlank
    @Size(min = 1, max = 30)
    private String name;
}