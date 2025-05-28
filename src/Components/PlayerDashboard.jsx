import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function PlayerDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetch('http://localhost:8080/api/tournaments')
      .then(res => res.json())
      .then(data => setTournaments(data))
      .catch(err => console.error(err));

    if (userId) {
      fetch(`http://localhost:8080/api/matches/player/${userId}`)
        .then(res => res.json())
        .then(data => setMatches(data))
        .catch(err => console.error(err));
    }
  }, [userId]);

  const handleRegister = async (tournamentId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: userId }),
      });
      if (res.ok) {
        alert('Registration submitted!');
      } else {
        alert('Failed to register.');
      }
    } catch (err) {
      console.error(err);
      alert('Error registering.');
    }
  };

  return (
    <div className="form-wrapper">
      <h2>Welcome, Player 🎾</h2>
      <h3>Register for Tournaments</h3>
      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th style={{ padding: '10px' }}>Name</th>
            <th style={{ padding: '10px' }}>Start Date</th>
            <th style={{ padding: '10px' }}>End Date</th>
            <th style={{ padding: '10px' }}>Location</th>
            <th style={{ padding: '10px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.map(tournament => (
            <tr key={tournament.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{tournament.name}</td>
              <td style={{ padding: '10px' }}>{tournament.startDate}</td>
              <td style={{ padding: '10px' }}>{tournament.endDate}</td>
              <td style={{ padding: '10px' }}>{tournament.location}</td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => handleRegister(tournament.id)}>Register</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Your Matches</h3>
      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th style={{ padding: '10px' }}>Tournament</th>
            <th style={{ padding: '10px' }}>Opponent</th>
            <th style={{ padding: '10px' }}>Date</th>
            <th style={{ padding: '10px' }}>Score</th>
            <th style={{ padding: '10px' }}>Winner</th>
          </tr>
        </thead>
        <tbody>
          {matches.map(match => (
            <tr key={match.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{match.tournament.name}</td>
              <td style={{ padding: '10px' }}>
                {match.player1.id == userId ? match.player2.fullName : match.player1.fullName}
              </td>
              <td style={{ padding: '10px' }}>{match.matchDate}</td>
              <td style={{ padding: '10px' }}>{match.score || 'Pending'}</td>
              <td style={{ padding: '10px' }}>{match.winner ? match.winner.fullName : 'TBD'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlayerDashboard;