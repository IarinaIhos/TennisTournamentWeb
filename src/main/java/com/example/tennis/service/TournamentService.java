package com.example.tennis.service;

import com.example.tennis.model.Tournament;
import com.example.tennis.repository.TournamentRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.util.List;

@Service
public class TournamentService {

    @Autowired
    private TournamentRepository tournamentRepository;
    @PostConstruct
    public void initTournaments() {
        if (tournamentRepository.count() == 0) {
            Tournament t1 = new Tournament("Summer Open", "Cluj", LocalDate.parse("2025-06-10"), LocalDate.parse("2025-06-17"));
            Tournament t2 = new Tournament("Winter Cup", "Bucharest", LocalDate.parse("2025-12-01"), LocalDate.parse("2025-12-10"));
            tournamentRepository.saveAll(List.of(t1, t2));
        }
    }

}
