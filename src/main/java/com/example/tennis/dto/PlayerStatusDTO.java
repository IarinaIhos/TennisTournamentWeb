package com.example.tennis.dto;

public class PlayerStatusDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String location;
    private int totalMatches;
    private int wins;
    private int totalPoints;

    public PlayerStatusDTO(Long id, String fullName, String email, String phoneNumber, String location, int totalMatches, int wins, int totalPoints) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.location = location;
        this.totalMatches = totalMatches;
        this.wins = wins;
        this.totalPoints = totalPoints;
    }

    // Getters și setters (poți genera automat în IDE)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public int getTotalMatches() { return totalMatches; }
    public void setTotalMatches(int totalMatches) { this.totalMatches = totalMatches; }
    public int getWins() { return wins; }
    public void setWins(int wins) { this.wins = wins; }
    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }
}
