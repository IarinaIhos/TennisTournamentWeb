package com.example.tennis.controller;

import com.example.tennis.model.Match;
import com.example.tennis.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "http://localhost:3000")
public class MatchController {

    @Autowired
    private MatchService matchService;

    @GetMapping("/player/{playerId}")
    public List<Match> getPlayerMatches(@PathVariable Long playerId) {
        return matchService.getPlayerMatches(playerId);
    }

    @GetMapping("/referee/{refereeId}")
    public List<Match> getRefereeMatches(@PathVariable Long refereeId) {
        return matchService.getRefereeMatches(refereeId);
    }

    @PutMapping("/{id}/score")
    public ResponseEntity<?> updateScore(@PathVariable Long id, @RequestBody ScoreUpdateRequest request) {
        try {
            Match updatedMatch = matchService.updateMatchScore(id, request.getScore(), request.getWinnerId());
            return ResponseEntity.ok(updatedMatch);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportMatches(@RequestParam String format) {
        if (!"csv".equalsIgnoreCase(format) && !"txt".equalsIgnoreCase(format)) {
            return ResponseEntity.badRequest().body("Unsupported format. Use 'csv' or 'txt'.");
        }
        String content = matchService.exportMatches(format);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=matches." + format)
                .body(content);
    }
}

class ScoreUpdateRequest {
    private String score;
    private Long winnerId;

    public String getScore() {
        return score;
    }

    public void setScore(String score) {
        this.score = score;
    }

    public Long getWinnerId() {
        return winnerId;
    }

    public void setWinnerId(Long winnerId) {
        this.winnerId = winnerId;
    }
}