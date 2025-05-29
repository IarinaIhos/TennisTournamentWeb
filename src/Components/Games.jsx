import React, { useEffect, useState } from 'react';

function Games() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
  fetch('http://localhost:8080/api/matches')
    .then(async res => {
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : await res.text();

      if (res.ok) {
        setMatches(data);
      } else {
        console.error('Error loading matches:', data);
        alert(data.message || data || 'Failed to load matches.');
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
      alert('Could not load matches.');
    });
}, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h3>🎮 Meciuri programate</h3>
      {matches.length === 0 ? (
        <p>No matches scheduled yet.</p>
      ) : (
        <ul style={{ paddingLeft: '1.5rem' }}>
          {matches.map((m) => (
            <li key={m.id}>
              {m.player1?.fullName} vs {m.player2?.fullName} ➜{' '}
              {m.winner ? `🏆 ${m.winner.fullName}` : 'Pending'} | Score: {m.player1Points} - {m.player2Points}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Games;
