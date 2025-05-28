package com.example.tennis.model;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

public class DBWriter {

    private static final String DB_URL = "jdbc:sqlite:/Users/iarina.ihos/Documents/FACULTATE/ANUL3/Semestrul 2/SD/a1backend/Untitled";
    private static final List<String> KEYWORDS = List.of("project", "report", "final", "search");
    private Connection connection;

    public DBWriter() {
        try {
            connection = DriverManager.getConnection(DB_URL);
            System.out.println("Connected to SQLLite database.");
        } catch (SQLException e) {
            System.err.println("Failed to connect to database: " + e.getMessage());
        }
    }

    public Connection getConnection() {
        return this.connection;
    }

    public void addUser(String username, String password, String role) {
        String insertSQL = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(insertSQL)) {
            pstmt.setString(1, username);
            pstmt.setString(2, password);  // Ideally, hash the password before storing
            pstmt.setString(3, role);
            pstmt.executeUpdate();
            System.out.println("User added: " + username);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }


    public void close() {
        try {
            if (connection != null) connection.close();
        } catch (SQLException e) {
            System.err.println("Failed to close database connection: " + e.getMessage());
        }
    }
}
