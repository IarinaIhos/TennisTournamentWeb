package com.example.tennis.repository;

import com.example.tennis.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    Optional<Registration> findByPlayerIdAndTournamentId(Long playerId, Long tournamentId);
    List<Registration> findByTournamentId(Long tournamentId);

    List<Registration> findByStatus(Registration.Status status);
    List<Registration> findByTournamentIdAndStatus(Long tournamentId, Registration.Status status);
    boolean existsByPlayerIdAndTournamentId(Long playerId, Long tournamentId);
    List<Registration> findByPlayerId(Long playerId);


}
