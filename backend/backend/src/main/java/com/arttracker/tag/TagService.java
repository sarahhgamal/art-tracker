package com.arttracker.tag;

import com.arttracker.user.User;
import com.arttracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    private TagResponse toResponse(Tag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .build();
    }

    public List<TagResponse> getAll() {
        return tagRepository.findByUserIdOrderByNameAsc(getCurrentUser().getId())
                .stream().map(this::toResponse).toList();
    }

    public TagResponse create(TagRequest request) {
        User user = getCurrentUser();
        String name = request.getName().trim().toLowerCase();
        if (tagRepository.existsByNameAndUserId(name, user.getId())) {
            throw new IllegalArgumentException("Tag already exists");
        }
        Tag tag = Tag.builder().name(name).user(user).build();
        return toResponse(tagRepository.save(tag));
    }

    public void delete(Long id) {
        User user = getCurrentUser();
        Tag tag = tagRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Tag not found"));
        tagRepository.delete(tag);
    }
}