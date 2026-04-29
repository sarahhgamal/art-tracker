package com.arttracker.session;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByUserIdOrderByDateDescIdDesc(Long userId);
    List<Session> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate start, LocalDate end);
    Optional<Session> findByIdAndUserId(Long id, Long userId);
}