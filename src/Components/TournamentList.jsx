import React, { useEffect, useState } from 'react';

function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
const [userId] = useState(1);

  useEffect(() => {
    fetch('http://localhost:8080/api/tournaments')
      .then(res => res.json())
      .then(data => setTournaments(data))
      .catch(err => console.error('Error fetching tournaments:', err));
  }, []);

  const handleRegister = async (tournamentId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }) // trimite ID-ul jucătorului
      });

      if (res.ok) {
        alert('Registered successfully!');
      } else {
        alert('Registration failed.');
      }
    } catch (err) {
      console.error('Error registering:', err);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="form-wrapper">
      <h2>Available Tournaments</h2>
      <ul>
        {tournaments.map(t => (
          <li key={t.id}>
            <strong>{t.name}</strong> – {t.location} – {t.date}
            <br />
            <button onClick={() => handleRegister(t.id)}>Register</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TournamentList;
