package com.example.tennis.service;

import com.example.tennis.dto.MatchDTO;
import com.example.tennis.model.Match;
import com.example.tennis.model.User;
import com.example.tennis.repository.MatchRepository;
import com.example.tennis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    public List<MatchDTO> getRefereeMatches(Long refereeId) {
        List<Match> matches = matchRepository.findByRefereeId(refereeId);
        return matches.stream().map(this::convertToDTO).collect(Collectors.toList());
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

    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    public Match assignReferee(Long matchId, Long refereeId) {
        // Validate match existence
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found with ID: " + matchId));

        // Validate referee existence and role
        User referee = userRepository.findById(refereeId)
                .orElseThrow(() -> new IllegalArgumentException("Referee not found with ID: " + refereeId));
        if (!"referee".equalsIgnoreCase(referee.getRole())) {
            throw new IllegalArgumentException("User with ID " + refereeId + " is not a referee");
        }

        // Assign referee to match
        match.setReferee(referee);

        // Save and return updated match
        return matchRepository.save(match);
    }

    private MatchDTO convertToDTO(Match match) {
        MatchDTO dto = new MatchDTO();
        dto.setId(match.getId());
        dto.setTournament(match.getTournament());
        dto.setMatchDate(match.getMatchDate());
        dto.setPlayer1Points(match.getPlayer1Points());
        dto.setPlayer2Points(match.getPlayer2Points());

        // Fetch full user details
        if (match.getPlayer1() != null) {
            User fullPlayer1 = userRepository.findById(match.getPlayer1().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Player1 not found with ID: " + match.getPlayer1().getId()));
            dto.setPlayer1(fullPlayer1);
        }
        if (match.getPlayer2() != null) {
            User fullPlayer2 = userRepository.findById(match.getPlayer2().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Player2 not found with ID: " + match.getPlayer2().getId()));
            dto.setPlayer2(fullPlayer2);
        }
        if (match.getWinner() != null) {
            User fullWinner = userRepository.findById(match.getWinner().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Winner not found with ID: " + match.getWinner().getId()));
            dto.setWinner(fullWinner);
        }
        if (match.getReferee() != null) {
            User fullReferee = userRepository.findById(match.getReferee().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Referee not found with ID: " + match.getReferee().getId()));
            dto.setReferee(fullReferee);
        }

        return dto;
    }
}