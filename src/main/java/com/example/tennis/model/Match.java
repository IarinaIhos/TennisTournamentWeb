package com.example.tennis.model;

import jakarta.persistence.*;

@Entity
@Table(name = "matches")
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "player1_id")
    private User player1;

    @ManyToOne
    @JoinColumn(name = "player2_id")
    private User player2;

    @ManyToOne
    @JoinColumn(name = "winner_id")
    private User winner;

    @ManyToOne
    @JoinColumn(name = "referee_id")
    private User referee;

    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    private Integer player1Points;
    private Integer player2Points;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getPlayer1() { return player1; }
    public void setPlayer1(User player1) { this.player1 = player1; }
    public User getPlayer2() { return player2; }
    public void setPlayer2(User player2) { this.player2 = player2; }
    public User getWinner() { return winner; }
    public void setWinner(User winner) { this.winner = winner; }
    public User getReferee() { return referee; }
    public void setReferee(User referee) { this.referee = referee; }
    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }
    public Integer getPlayer1Points() { return player1Points; }
    public void setPlayer1Points(Integer player1Points) { this.player1Points = player1Points; }
    public Integer getPlayer2Points() { return player2Points; }
    public void setPlayer2Points(Integer player2Points) { this.player2Points = player2Points; }
}