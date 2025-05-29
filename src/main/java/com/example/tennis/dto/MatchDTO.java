package com.example.tennis.dto;


import com.example.tennis.model.Tournament;
import com.example.tennis.model.User;

import java.time.LocalDateTime;

public class MatchDTO {
    private Long id;
    private Tournament tournament;
    private User player1;
    private User player2;
    private User winner;
    private User referee;
    private Integer player1Points;
    private Integer player2Points;
    private LocalDateTime matchDate;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }

    public User getPlayer1() { return player1; }
    public void setPlayer1(User player1) { this.player1 = player1; }

    public User getPlayer2() { return player2; }
    public void setPlayer2(User player2) { this.player2 = player2; }

    public User getWinner() { return winner; }
    public void setWinner(User winner) { this.winner = winner; }

    public User getReferee() { return referee; }
    public void setReferee(User referee) { this.referee = referee; }

    public Integer getPlayer1Points() { return player1Points; }
    public void setPlayer1Points(Integer player1Points) { this.player1Points = player1Points; }

    public Integer getPlayer2Points() { return player2Points; }
    public void setPlayer2Points(Integer player2Points) { this.player2Points = player2Points; }

    public LocalDateTime getMatchDate() { return matchDate; }
    public void setMatchDate(LocalDateTime matchDate) { this.matchDate = matchDate; }
}