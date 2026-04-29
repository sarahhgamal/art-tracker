package com.arttracker.artwork;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ArtworkRepository extends JpaRepository<Artwork, Long> {
    List<Artwork> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Artwork> findByUserIdAndMediumOrderByCreatedAtDesc(Long userId, Medium medium);
    Optional<Artwork> findByIdAndUserId(Long id, Long userId);
    boolean existsByTitleAndUserId(String title, Long userId);

    @Query("SELECT DISTINCT a FROM Artwork a JOIN a.tags t WHERE a.user.id = :userId AND t.id = :tagId ORDER BY a.createdAt DESC")
    List<Artwork> findByUserIdAndTagId(@Param("userId") Long userId, @Param("tagId") Long tagId);
}