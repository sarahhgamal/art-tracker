package com.arttracker.session;

import com.arttracker.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(sessionService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SessionResponse>> create(@Valid @RequestBody SessionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(sessionService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SessionResponse>> update(
            @PathVariable Long id, @Valid @RequestBody SessionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(sessionService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        sessionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

}