package com.example.tennis.service;

import com.example.tennis.model.Match;
import com.example.tennis.model.User;
import com.example.tennis.repository.MatchRepository;
import com.example.tennis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MatchService {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Match> getPlayerMatches(Long playerId) {
        return matchRepository.findAll().stream()
                .filter(m -> m.getPlayer1().getId().equals(playerId) || m.getPlayer2().getId().equals(playerId))
                .toList();
    }

    public List<Match> getRefereeMatches(Long refereeId) {
        return matchRepository.findAll().stream()
                .filter(m -> m.getReferee() != null && m.getReferee().getId().equals(refereeId))
                .toList();
    }

    public Match updateMatchScore(Long id, String score, Long winnerId) {
        Optional<Match> matchOpt = matchRepository.findById(id);
        if (!matchOpt.isPresent()) {
            throw new IllegalArgumentException("Match not found!");
        }

        Match match = matchOpt.get();
        if (score != null && !score.isEmpty()) {
            // Parse score (e.g., "6-4") and assign to player1Points/player2Points
            String[] scores = score.split("-");
            if (scores.length == 2) {
                match.setPlayer1Points(Integer.parseInt(scores[0]));
                match.setPlayer2Points(Integer.parseInt(scores[1]));
            } else {
                throw new IllegalArgumentException("Invalid score format. Use 'X-Y' (e.g., '6-4').");
            }
        }
        if (winnerId != null) {
            Optional<User> winnerOpt = userRepository.findById(winnerId);
            if (!winnerOpt.isPresent()) {
                throw new IllegalArgumentException("Winner not found!");
            }
            match.setWinner(winnerOpt.get());
        }
        return matchRepository.save(match);
    }

    public String exportMatches(String format) {
        List<Match> matches = matchRepository.findAll();
        StringBuilder content = new StringBuilder();
        if ("csv".equalsIgnoreCase(format)) {
            content.append("ID,Player1,Player2,Referee,Winner,Score\n");
            for (Match match : matches) {
                content.append(String.format("%d,%s,%s,%s,%s,%d-%d\n",
                        match.getId(),
                        match.getPlayer1().getFullName(),
                        match.getPlayer2().getFullName(),
                        match.getReferee() != null ? match.getReferee().getFullName() : "",
                        match.getWinner() != null ? match.getWinner().getFullName() : "",
                        match.getPlayer1Points() != null ? match.getPlayer1Points() : 0,
                        match.getPlayer2Points() != null ? match.getPlayer2Points() : 0));
            }
        } else if ("txt".equalsIgnoreCase(format)) {
            for (Match match : matches) {
                content.append(String.format("Match %d: %s vs %s, Referee: %s, Winner: %s, Score: %d-%d\n",
                        match.getId(),
                        match.getPlayer1().getFullName(),
                        match.getPlayer2().getFullName(),
                        match.getReferee() != null ? match.getReferee().getFullName() : "N/A",
                        match.getWinner() != null ? match.getWinner().getFullName() : "N/A",
                        match.getPlayer1Points() != null ? match.getPlayer1Points() : 0,
                        match.getPlayer2Points() != null ? match.getPlayer2Points() : 0));
            }
        }
        return content.toString();
    }
}