import React, { useEffect, useState } from 'react';

function PlayerList() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/users/players/stats') // Endpoint backend cu statistici extinse
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h3>📋 Lista jucătorilor</h3>
      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th style={{ padding: '10px' }}>#</th>
            <th style={{ padding: '10px' }}>Full Name</th>
            <th style={{ padding: '10px' }}>Email</th>
            <th style={{ padding: '10px' }}>Phone</th>
            <th style={{ padding: '10px' }}>Location</th>
            <th style={{ padding: '10px' }}>Matches Played</th>
            <th style={{ padding: '10px' }}>Matches Won</th>
            <th style={{ padding: '10px' }}>Total Points</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{index + 1}</td>
              <td style={{ padding: '10px' }}>{player.fullName}</td>
              <td style={{ padding: '10px' }}>{player.email}</td>
              <td style={{ padding: '10px' }}>{player.phoneNumber}</td>
              <td style={{ padding: '10px' }}>{player.location}</td>
              <td style={{ padding: '10px' }}>{player.totalMatches}</td>
              <td style={{ padding: '10px' }}>{player.wins}</td>
              <td style={{ padding: '10px' }}>{player.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlayerList;
