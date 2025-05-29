package com.example.tennis.controller;

import com.example.tennis.model.Match;
import com.example.tennis.model.Registration;
import com.example.tennis.model.Tournament;
import com.example.tennis.model.User;
import com.example.tennis.repository.RegistrationRepository;
import com.example.tennis.repository.TournamentRepository;
import com.example.tennis.repository.UserRepository;
import com.example.tennis.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    @GetMapping
    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }
    @GetMapping("/{id}/participants")
    public ResponseEntity<?> getParticipants(@PathVariable Long id) {
        List<Registration> regs = registrationRepository.findByTournamentId(id);
        List<User> participants = regs.stream().map(Registration::getPlayer).toList();

        return ResponseEntity.ok(participants);
    }


    @PostMapping("/{tournamentId}/register")
    public ResponseEntity<?> registerToTournament(
            @PathVariable Long tournamentId,
            @RequestBody Map<String, Object> body
    ) {
        Long playerId = Long.parseLong(body.get("playerId").toString());

        Optional<User> player = userRepository.findById(playerId);
        Optional<Tournament> tournament = tournamentRepository.findById(tournamentId);

        if (player.isEmpty() || tournament.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Player or tournament not found."));
        }

        Optional<Registration> existing = registrationRepository.findByPlayerIdAndTournamentId(playerId, tournamentId);
        if (existing.isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "Player already registered."));
        }

        Registration reg = new Registration();
        reg.setPlayer(player.get());
        reg.setTournament(tournament.get());
        reg.setStatus(Registration.Status.PENDING); // sau Status.APPROVED dacă nu ai flow de aprobare

        registrationRepository.save(reg);

        return ResponseEntity.ok(Map.of("message", "Registered successfully."));
    }

    @GetMapping("/{id}/matches")
    public List<Match> getMatchesForTournament(@PathVariable Long id) {
        return matchRepository.findByTournamentId(id);
    }
    @PostMapping("/{id}/generate-matches")
    public ResponseEntity<?> generateMatches(@PathVariable Long id) {
        List<Registration> registrations = registrationRepository.findByTournamentId(id);

        if (registrations.size() < 2) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not enough players to generate matches."));
        }

        Tournament tournament = tournamentRepository.findById(id).orElse(null);
        if (tournament == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Tournament not found"));
        }

        List<User> players = registrations.stream()
                .map(Registration::getPlayer)
                .toList();

        for (int i = 0; i < players.size(); i++) {
            for (int j = i + 1; j < players.size(); j++) {
                Match match = new Match();
                match.setTournament(tournament);
                match.setPlayer1(players.get(i));
                match.setPlayer2(players.get(j));
                match.setPlayer1Points(0);
                match.setPlayer2Points(0);
                matchRepository.save(match);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Matches generated successfully."));
    }


}

