package com.arttracker.session;

import com.arttracker.artwork.Artwork;
import com.arttracker.artwork.ArtworkRepository;
import com.arttracker.tag.Tag;
import com.arttracker.tag.TagRepository;
import com.arttracker.tag.TagResponse;
import com.arttracker.user.User;
import com.arttracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final ArtworkRepository artworkRepository;
    private final TagRepository tagRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    private Set<Tag> resolveTags(Set<Long> tagIds, Long userId) {
        if (tagIds == null || tagIds.isEmpty()) return new java.util.HashSet<>();
        return tagIds.stream()
                .map(id -> tagRepository.findByIdAndUserId(id, userId)
                        .orElseThrow(() -> new IllegalArgumentException("Tag not found: " + id)))
                .collect(Collectors.toSet());
    }

    private SessionResponse toResponse(Session session) {
        Set<TagResponse> tagResponses = session.getTags().stream()
                .map(t -> TagResponse.builder().id(t.getId()).name(t.getName()).build())
                .collect(Collectors.toSet());

        return SessionResponse.builder()
                .id(session.getId())
                .duration(session.getDuration())
                .date(session.getDate())
                .notes(session.getNotes())
                .artworkId(session.getArtwork() != null ? session.getArtwork().getId() : null)
                .artworkTitle(session.getArtwork() != null ? session.getArtwork().getTitle() : null)
                .tags(tagResponses)
                .build();
    }

    public List<SessionResponse> getAll() {
        return sessionRepository.findByUserIdOrderByDateDescIdDesc(getCurrentUser().getId())
                .stream().map(this::toResponse).toList();
    }

    public SessionResponse create(SessionRequest request) {
        User user = getCurrentUser();

        Artwork artwork = null;
        if (request.getArtworkId() != null) {
            artwork = artworkRepository.findByIdAndUserId(request.getArtworkId(), user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Artwork not found"));
        }

        Session session = Session.builder()
                .duration(request.getDuration())
                .date(request.getDate())
                .notes(request.getNotes())
                .artwork(artwork)
                .tags(resolveTags(request.getTagIds(), user.getId()))
                .user(user)
                .build();

        return toResponse(sessionRepository.save(session));
    }

    public SessionResponse update(Long id, SessionRequest request) {
        User user = getCurrentUser();
        Session session = sessionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        Artwork artwork = null;
        if (request.getArtworkId() != null) {
            artwork = artworkRepository.findByIdAndUserId(request.getArtworkId(), user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Artwork not found"));
        }

        session.setDuration(request.getDuration());
        session.setDate(request.getDate());
        session.setNotes(request.getNotes());
        session.setArtwork(artwork);
        session.setTags(resolveTags(request.getTagIds(), user.getId()));

        return toResponse(sessionRepository.save(session));
    }

    public void delete(Long id) {
        User user = getCurrentUser();
        Session session = sessionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        sessionRepository.delete(session);
    }
}