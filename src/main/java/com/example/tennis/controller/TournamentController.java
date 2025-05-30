package com.example.tennis.controller;

import com.example.tennis.model.Match;
import com.example.tennis.model.Registration;
import com.example.tennis.model.Tournament;
import com.example.tennis.model.User;
import com.example.tennis.repository.RegistrationRepository;
import com.example.tennis.repository.TournamentRepository;
import com.example.tennis.repository.UserRepository;
import com.example.tennis.repository.MatchRepository;
import com.example.tennis.service.TournamentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tournaments")
@CrossOrigin(origins = "http://localhost:3000")
public class TournamentController {

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private TournamentService tournamentService;

    @GetMapping
    public List<Tournament> getAllTournaments() {
        return tournamentService.getAllTournaments();
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<?> getParticipants(@PathVariable Long id) {
        List<User> participants = tournamentService.getTournamentParticipants(id);
        return ResponseEntity.ok(participants);
    }

    @PostMapping("/{tournamentId}/register")
    public ResponseEntity<?> registerToTournament(@PathVariable Long tournamentId, @RequestBody RegistrationRequest request) {
        try {
            Registration registration = tournamentService.registerPlayer(tournamentId, request.getPlayerId());
            return ResponseEntity.ok(Map.of("message", "Registered successfully.", "registration", registration));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/registrations/pending")
    public ResponseEntity<?> getPendingRegistrations() {
        List<Registration> pendingRegistrations = tournamentService.getPendingRegistrations();
        return ResponseEntity.ok(pendingRegistrations);
    }

    @PostMapping("/registrations/{registrationId}/approve")
    public ResponseEntity<?> approveRegistration(@PathVariable Long registrationId) {
        try {
            Registration registration = tournamentService.approveRegistration(registrationId);
            return ResponseEntity.ok(Map.of("message", "Registration approved successfully.", "registration", registration));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/registrations/{registrationId}/reject")
    public ResponseEntity<?> rejectRegistration(@PathVariable Long registrationId) {
        try {
            Registration registration = tournamentService.rejectRegistration(registrationId);
            return ResponseEntity.ok(Map.of("message", "Registration rejected successfully.", "registration", registration));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/registrations")
    public ResponseEntity<?> getPlayerRegistrations(@RequestParam Long playerId) {
        List<Registration> registrations = tournamentService.getPlayerRegistrations(playerId);
        return ResponseEntity.ok(registrations);
    }

    @GetMapping("/{id}/matches")
    public List<Match> getMatchesForTournament(@PathVariable Long id) {
        return matchRepository.findByTournamentId(id);
    }

    @PostMapping("/{id}/generate-matches")
    public ResponseEntity<?> generateMatches(@PathVariable Long id) {
        List<User> participants = tournamentService.getTournamentParticipants(id);

        if (participants.size() < 2) {
            return ResponseEntity.status(400).body(Map.of("message", "Not enough approved players to generate matches."));
        }

        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tournament not found"));

        // Clear existing matches to avoid duplicates
        List<Match> existingMatches = matchRepository.findByTournamentId(id);
        matchRepository.deleteAll(existingMatches);

        // Generate pairwise matches
        for (int i = 0; i < participants.size(); i++) {
            for (int j = i + 1; j < participants.size(); j++) {
                Match match = new Match();
                match.setTournament(tournament);
                match.setPlayer1(participants.get(i));
                match.setPlayer2(participants.get(j));
                match.setPlayer1Points(0);
                match.setPlayer2Points(0);
                matchRepository.save(match);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Matches generated successfully."));
    }
}

class RegistrationRequest {
    private Long playerId;

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }
}