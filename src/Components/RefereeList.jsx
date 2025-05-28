import React, { useState, useEffect } from 'react';

function RefereeList() {
  const [players, setPlayers] = useState([]);
  const [location, setLocation] = useState('');
  const [minMatches, setMinMatches] = useState('');

  useEffect(() => {
    let url = 'http://localhost:8080/api/users/players';
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (minMatches) params.append('minMatches', minMatches);
    fetch(`${url}?${params.toString()}`)
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(err => console.error(err));
  }, [location, minMatches]);

  return (
    <div>
      <h3>🧑‍⚖️ Filter Players</h3>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Matches Played"
          value={minMatches}
          onChange={(e) => setMinMatches(e.target.value)}
        />
      </div>
      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th style={{ padding: '10px' }}>#</th>
            <th style={{ padding: '10px' }}>Full Name</th>
            <th style={{ padding: '10px' }}>Email</th>
            <th style={{ padding: '10px' }}>Location</th>
            <th style={{ padding: '10px' }}>Matches Played</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{index + 1}</td>
              <td style={{ padding: '10px' }}>{player.fullName}</td>
              <td style={{ padding: '10px' }}>{player.email}</td>
              <td style={{ padding: '10px' }}>{player.location}</td>
              <td style={{ padding: '10px' }}>{player.totalMatches}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RefereeList;