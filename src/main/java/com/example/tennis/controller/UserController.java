package com.example.tennis.controller;

import com.example.tennis.dto.PlayerStatusDTO;
import com.example.tennis.model.User;
import com.example.tennis.repository.MatchRepository;
import com.example.tennis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MatchRepository matchRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        System.out.println("nu se poate");
        List<User> existingUsers = userRepository.findByEmail(user.getEmail());
        System.out.println("prima");

        if (!existingUsers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists!");
        }

        try {
            userRepository.save(user);
            return ResponseEntity.ok("User registered successfully!");
        } catch (Exception e) {
            System.out.println("aici");
        }
        return ResponseEntity.ok("speram");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginData) {
        List<User> matches = userRepository.findByEmail(loginData.getEmail());

        if (!matches.isEmpty()) {
            for (User user : matches) {
                if (user.getPassword().equals(loginData.getPassword())) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Login success!");
                    response.put("userId", user.getId());
                    response.put("role", user.getRole());
                    response.put("fullName", user.getFullName());
                    return ResponseEntity.ok(response);
                }
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed!");
    }

    @GetMapping("/players")
    public List<User> getAllPlayers() {
        return userRepository.findByRole("player");
    }

    @GetMapping("/referees")
    public List<User> getAllReferees() {
        return userRepository.findByRole("referee");
    }

    @GetMapping("/players/stats")
    public List<PlayerStatusDTO> getPlayerStats() {
        List<User> players = userRepository.findByRole("player");
        List<PlayerStatusDTO> statsList = new ArrayList<>();

        for (User player : players) {
            int totalMatches = matchRepository.countMatchesByPlayer(player.getId());
            int wins = matchRepository.countWinsByPlayer(player.getId());
            Integer points = matchRepository.sumPointsByPlayer(player.getId());
            int totalPoints = (points == null) ? 0 : points;

            PlayerStatusDTO dto = new PlayerStatusDTO(
                    player.getId(),
                    player.getFullName(),
                    player.getEmail(),
                    player.getPhoneNumber(),
                    player.getLocation(),
                    totalMatches,
                    wins,
                    totalPoints
            );
            statsList.add(dto);
        }
        return statsList;
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User updatedUser = existingUser.get();
            updatedUser.setFullName(user.getFullName());
            updatedUser.setEmail(user.getEmail());
            updatedUser.setPhoneNumber(user.getPhoneNumber());
            updatedUser.setLocation(user.getLocation());
            updatedUser.setRole(user.getRole());
            // Note: Password updates are skipped since we're bypassing hashing for now
            try {
                // Check for email uniqueness (excluding current user)
                List<User> emailCheck = userRepository.findByEmail(user.getEmail());
                if (!emailCheck.isEmpty() && !emailCheck.get(0).getId().equals(id)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists!");
                }
                userRepository.save(updatedUser);
                return ResponseEntity.ok("User updated successfully!");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update user!");
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found!");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            try {
                userRepository.deleteById(id);
                return ResponseEntity.ok("User deleted successfully!");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete user!");
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found!");
    }
}