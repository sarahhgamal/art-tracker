package com.arttracker.session;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Data
public class SessionRequest {

    @NotNull
    @Min(1)
    private Integer duration;

    @NotNull
    private LocalDate date;

    private String notes;
    private Long artworkId;
    private Set<Long> tagIds = new HashSet<>();
}