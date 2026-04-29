package com.arttracker.artwork;

import com.arttracker.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/artworks")
@RequiredArgsConstructor
public class ArtworkController {

    private final ArtworkService artworkService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ArtworkResponse>>> getAll(
            @RequestParam(required = false) String medium,
            @RequestParam(required = false) Long tagId) {
        return ResponseEntity.ok(ApiResponse.success(artworkService.getAll(medium, tagId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ArtworkResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(artworkService.getOne(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ArtworkResponse>> create(@Valid @RequestBody ArtworkRequest request) {
        return ResponseEntity.ok(ApiResponse.success(artworkService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ArtworkResponse>> update(
            @PathVariable Long id, @Valid @RequestBody ArtworkRequest request) {
        return ResponseEntity.ok(ApiResponse.success(artworkService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        artworkService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}