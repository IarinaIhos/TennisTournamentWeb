package com.example.tennis.service;

import com.example.tennis.model.Tournament;
import com.example.tennis.model.User;
import com.example.tennis.model.Registration;
import com.example.tennis.repository.TournamentRepository;
import com.example.tennis.repository.UserRepository;
import com.example.tennis.repository.RegistrationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TournamentService {

    @Autowired
    private TournamentRepository tournamentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @PostConstruct
    public void initTournaments() {
        if (tournamentRepository.count() == 0) {
            Tournament t1 = new Tournament("Summer Open", "Cluj", LocalDate.parse("2025-06-10"), LocalDate.parse("2025-06-17"));
            Tournament t2 = new Tournament("Winter Cup", "Bucharest", LocalDate.parse("2025-12-01"), LocalDate.parse("2025-12-10"));
            tournamentRepository.saveAll(List.of(t1, t2));
        }
    }

    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    public Registration registerPlayer(Long tournamentId, Long playerId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new IllegalArgumentException("Tournament not found with ID: " + tournamentId));
        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found with ID: " + playerId));

        if (!"player".equalsIgnoreCase(player.getRole())) {
            throw new IllegalArgumentException("User with ID " + playerId + " is not a player");
        }

        if (registrationRepository.existsByPlayerIdAndTournamentId(playerId, tournamentId)) {
            throw new IllegalArgumentException("Player is already registered for this tournament");
        }

        Registration registration = new Registration();
        registration.setPlayer(player);
        registration.setTournament(tournament);
        registration.setStatus(Registration.Status.PENDING);

        return registrationRepository.save(registration);
    }

    public Registration approveRegistration(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found with ID: " + registrationId));

        if (registration.getStatus() != Registration.Status.PENDING) {
            throw new IllegalArgumentException("Registration is not in PENDING status");
        }

        registration.setStatus(Registration.Status.APPROVED);
        return registrationRepository.save(registration);
    }

    public Registration rejectRegistration(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found with ID: " + registrationId));

        if (registration.getStatus() != Registration.Status.PENDING) {
            throw new IllegalArgumentException("Registration is not in PENDING status");
        }

        registration.setStatus(Registration.Status.REJECTED);
        return registrationRepository.save(registration);
    }

    public List<Registration> getPendingRegistrations() {
        return registrationRepository.findByStatus(Registration.Status.PENDING);
    }

    public List<Registration> getPlayerRegistrations(Long playerId) {
        return registrationRepository.findByPlayerId(playerId);
    }

    public List<User> getTournamentParticipants(Long tournamentId) {
        return registrationRepository.findByTournamentIdAndStatus(tournamentId, Registration.Status.APPROVED)
                .stream()
                .map(Registration::getPlayer)
                .collect(Collectors.toList());
    }
}