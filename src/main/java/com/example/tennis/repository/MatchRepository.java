package com.example.tennis.repository;

import com.example.tennis.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByTournamentId(Long tournamentId);
    List<Match> findByRefereeId(Long refereeId);

    @Query("SELECT COUNT(m) FROM Match m WHERE m.player1.id = :playerId OR m.player2.id = :playerId")
    int countMatchesByPlayer(@Param("playerId") Long playerId);

    @Query("SELECT COUNT(m) FROM Match m WHERE m.winner.id = :playerId")
    int countWinsByPlayer(@Param("playerId") Long playerId);

    @Query("SELECT COALESCE(SUM(CASE WHEN m.player1.id = :playerId THEN m.player1Points WHEN m.player2.id = :playerId THEN m.player2Points ELSE 0 END), 0) FROM Match m WHERE m.player1.id = :playerId OR m.player2.id = :playerId")
    Integer sumPointsByPlayer(@Param("playerId") Long playerId);
}