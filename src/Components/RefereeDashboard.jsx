import React, { useState, useEffect } from 'react';

function RefereeDashboard() {
  const [matches, setMatches] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:8080/api/matches/referee/${userId}`)
        .then(res => res.json())
        .then(data => setMatches(data))
        .catch(err => console.error(err));
    }
  }, [userId]);

  const handleUpdateScore = async (matchId, score, winnerId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/matches/${matchId}/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, winnerId }),
      });
      if (res.ok) {
        alert('Score updated!');
        setMatches(matches.map(m => m.id == matchId ? { ...m, score, winner: { id: winnerId } } : m));
      } else {
        alert('Failed to update score.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating score.');
    }
  };

  return (
    <div className="form-wrapper">
      <h2>Welcome, Referee 🧑‍⚖️</h2>
      <h3>Your Assigned Matches</h3>
      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th style={{ padding: '10px' }}>Tournament</th>
            <th style={{ padding: '10px' }}>Player 1</th>
            <th style={{ padding: '10px' }}>Player 2</th>
            <th style={{ padding: '10px' }}>Date</th>
            <th style={{ padding: '10px' }}>Score</th>
            <th style={{ padding: '10px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {matches.map(match => (
            <tr key={match.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{match.tournament.name}</td>
              <td style={{ padding: '10px' }}>{match.player1.fullName}</td>
              <td style={{ padding: '10px' }}>{match.player2.fullName}</td>
              <td style={{ padding: '10px' }}>{match.matchDate}</td>
              <td style={{ padding: '10px' }}>{match.score || 'Pending'}</td>
              <td style={{ padding: '10px' }}>
                <input
                  type="text"
                  placeholder="Score (e.g., 6-4, 7-5)"
                  onChange={(e) => match.tempScore = e.target.value}
                />
                <select
                  onChange={(e) => match.tempWinnerId = e.target.value}
                >
                  <option value="">Select Winner</option>
                  <option value={match.player1.id}>{match.player1.fullName}</option>
                  <option value={match.player2.id}>{match.player2.fullName}</option>
                </select>
                <button
                  onClick={() => handleUpdateScore(match.id, match.tempScore, match.tempWinnerId)}
                  disabled={!match.tempScore || !match.tempWinnerId}
                >
                  Update Score
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RefereeDashboard;