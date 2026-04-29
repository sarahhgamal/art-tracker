package com.arttracker.artwork;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;
import com.arttracker.tag.TagResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtworkResponse {
    private Long id;
    private String title;
    private String imageUrl;
    private String description;
    private String medium;
    private String username;
    private LocalDateTime createdAt;
    private Set<TagResponse> tags;

}