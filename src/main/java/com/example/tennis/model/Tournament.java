package com.example.tennis.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "tournaments")
public class Tournament {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String name;

        @Column(nullable = false)
        private LocalDate startDate;

        @Column(nullable = false)
        private LocalDate endDate;

        private String location;

        @OneToMany(mappedBy = "tournament")
        private List<Match> matches;

        // Getters and setters
        public Tournament() {
        }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public List<Match> getMatches() { return matches; }
        public void setMatches(List<Match> matches) { this.matches = matches; }

        public Tournament(String name, String location, LocalDate startDate, LocalDate endDate) {
                this.name = name;
                this.location = location;
                this.startDate = startDate;
                this.endDate = endDate;
        }

}