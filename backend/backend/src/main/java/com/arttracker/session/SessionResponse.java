package com.arttracker.session;

import com.arttracker.tag.TagResponse;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private Integer duration;
    private LocalDate date;
    private String notes;
    private Long artworkId;
    private String artworkTitle;
    private Set<TagResponse> tags;
}