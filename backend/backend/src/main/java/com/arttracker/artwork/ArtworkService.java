package com.arttracker.artwork;

import com.arttracker.storage.StorageService;
import com.arttracker.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.arttracker.tag.TagRepository;
import com.arttracker.tag.TagResponse;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.List;
import com.arttracker.tag.TagResponse;
import com.arttracker.tag.Tag;

@Service
@RequiredArgsConstructor
public class ArtworkService {

    private final ArtworkRepository artworkRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final TagRepository tagRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    private ArtworkResponse toResponse(Artwork artwork) {
        Set<TagResponse> tagResponses = artwork.getTags().stream()
                .map(t -> TagResponse.builder().id(t.getId()).name(t.getName()).build())
                .collect(Collectors.toSet());

        return ArtworkResponse.builder()
                .id(artwork.getId())
                .title(artwork.getTitle())
                .imageUrl(artwork.getImageUrl())
                .description(artwork.getDescription())
                .medium(artwork.getMedium().name())
                .username(artwork.getUser().getUsername())
                .createdAt(artwork.getCreatedAt())
                .tags(tagResponses)
                .build();
    }

    private Set<Tag> resolveTags(Set<Long> tagIds, Long userId) {
        if (tagIds == null || tagIds.isEmpty()) return new java.util.HashSet<>();
        return tagIds.stream()
                .map(id -> tagRepository.findByIdAndUserId(id, userId)
                        .orElseThrow(() -> new IllegalArgumentException("Tag not found: " + id)))
                .collect(Collectors.toSet());
    }

    public List<ArtworkResponse> getAll(String medium, Long tagId) {
        User user = getCurrentUser();
        List<Artwork> artworks;
        if (tagId != null) {
            artworks = artworkRepository.findByUserIdAndTagId(user.getId(), tagId);
            if (medium != null) {
                Medium m = Medium.valueOf(medium.toUpperCase());
                artworks = artworks.stream().filter(a -> a.getMedium() == m).toList();
            }
        } else if (medium != null) {
            artworks = artworkRepository.findByUserIdAndMediumOrderByCreatedAtDesc(user.getId(), Medium.valueOf(medium.toUpperCase()));
        } else {
            artworks = artworkRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }
        return artworks.stream().map(this::toResponse).toList();
    }

    public ArtworkResponse getOne(Long id) {
        User user = getCurrentUser();
        Artwork artwork = artworkRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Artwork not found"));
        return toResponse(artwork);
    }

    public ArtworkResponse create(ArtworkRequest request) {
        User user = getCurrentUser();
        if (artworkRepository.existsByTitleAndUserId(request.getTitle(), user.getId())) {
            throw new IllegalArgumentException("You already have an artwork with that title");
        }
        Set<Tag> tags = resolveTags(request.getTagIds(), user.getId());
        Artwork artwork = Artwork.builder()
                .title(request.getTitle())
                .medium(request.getMedium())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .tags(tags)
                .user(user)
                .build();
        return toResponse(artworkRepository.save(artwork));
    }

    public ArtworkResponse update(Long id, ArtworkRequest request) {
        User user = getCurrentUser();
        Artwork artwork = artworkRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Artwork not found"));
        artwork.setTitle(request.getTitle());
        artwork.setMedium(request.getMedium());
        artwork.setDescription(request.getDescription());
        artwork.setImageUrl(request.getImageUrl());
        artwork.setTags(resolveTags(request.getTagIds(), user.getId()));
        return toResponse(artworkRepository.save(artwork));
    }

    public void delete(Long id) {
        User user = getCurrentUser();
        Artwork artwork = artworkRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Artwork not found"));
        artworkRepository.delete(artwork);
    }

    public ArtworkResponse uploadImage(Long id, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        User user = getCurrentUser();

        if (file.isEmpty()) throw new IllegalArgumentException("File is empty");

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg")
                && !contentType.equals("image/png")
                && !contentType.equals("image/webp"))) {
            throw new IllegalArgumentException("Only JPEG, PNG and WEBP images are allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File must be under 5MB");
        }

        Artwork artwork = artworkRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Artwork not found"));

        // Delete old image from Supabase if one exists
        if (artwork.getImageUrl() != null) {
            storageService.deleteFile(artwork.getImageUrl());
        }

        String url = storageService.uploadFile(file);
        artwork.setImageUrl(url);
        return toResponse(artworkRepository.save(artwork));
    }




}