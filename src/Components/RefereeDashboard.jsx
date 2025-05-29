import React, { useEffect, useState } from 'react';
import './Dashboard.css';

function RefereeDashboard() {
  const [matches, setMatches] = useState([]);
  const [scoreInputs, setScoreInputs] = useState({});
  const [winnerInputs, setWinnerInputs] = useState({});
  const [activeTab, setActiveTab] = useState('schedule');
  const [nameFilter, setNameFilter] = useState('');
  const refereeId = localStorage.getItem('userId');

  useEffect(() => {
    if (refereeId) {
      fetch(`http://localhost:8080/api/matches/referee/${refereeId}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setMatches(data))
        .catch(err => console.error(err));
    }
  }, [refereeId]);

  // Extract unique players from matches
  const getUniquePlayers = () => {
    const players = new Map();
    matches.forEach(match => {
      if (match.player1) {
        players.set(match.player1.id, match.player1);
      }
      if (match.player2) {
        players.set(match.player2.id, match.player2);
      }
    });
    return Array.from(players.values());
  };

  // Filter players based on name
  const getFilteredPlayers = () => {
    const players = getUniquePlayers();
    if (!nameFilter) {
      return players; // Return full list if no filter is applied
    }
    return players.filter(player =>
      player.fullName?.toLowerCase().includes(nameFilter.toLowerCase()) || false
    );
  };

  const handleScoreUpdate = async (matchId) => {
    const score = scoreInputs[matchId];
    const winnerId = winnerInputs[matchId];

    if (!score || !winnerId) {
      alert('Please enter both score and winner.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/matches/${matchId}/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, winnerId }),
      });
      if (res.ok) {
        alert('Score updated successfully');
        setMatches(prev =>
          prev.map(m =>
            m.id === matchId
              ? { ...m, player1Points: parseInt(score.split('-')[0]), player2Points: parseInt(score.split('-')[1]), winner: { id: winnerId, fullName: m.player1.id === winnerId ? m.player1.fullName : m.player2.fullName, email: m.player1.id === winnerId ? m.player1.email : m.player2.email, location: m.player1.id === winnerId ? m.player1.location : m.player2.location } }
              : m
          )
        );
      } else {
        alert('Failed to update score');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating score');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return (
          <>
            <h3>🗓️ Matches Assigned</h3>
            {matches.length > 0 ? (
              <ul>
                {matches.map(m => (
                  <li key={m.id} style={{ marginBottom: '1rem' }}>
                    <strong>{m.player1?.fullName || 'Unknown'}</strong> vs <strong>{m.player2?.fullName || 'Unknown'}</strong><br />
                    Current score: {m.player1Points || 0}-{m.player2Points || 0}<br />
                    Winner: {m.winner?.fullName || 'TBD'}<br />
                    Date: {m.matchDate ? new Date(m.matchDate).toLocaleString() : 'Not set'}
                    <div style={{ marginTop: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Score (e.g., 6-4)"
                        value={scoreInputs[m.id] || ''}
                        onChange={(e) => setScoreInputs(prev => ({ ...prev, [m.id]: e.target.value }))}
                      />
                      <select
                        value={winnerInputs[m.id] || ''}
                        onChange={(e) => setWinnerInputs(prev => ({ ...prev, [m.id]: e.target.value }))}
                      >
                        <option value="">Select Winner</option>
                        <option value={m.player1?.id}>{m.player1?.fullName}</option>
                        <option value={m.player2?.id}>{m.player2?.fullName}</option>
                      </select>
                      <button onClick={() => handleScoreUpdate(m.id)} style={{ marginLeft: '0.5rem' }}>
                        Save
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No matches assigned.</p>
            )}
          </>
        );
      case 'players':
        const filteredPlayers = getFilteredPlayers();
        return (
          <>
            <h3>🧍 Players in Assigned Matches</h3>
            <div style={{ marginBottom: '1rem', position: 'relative', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search by name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.5rem 0.5rem 2rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}>
                🔍
              </span>
            </div>
            {filteredPlayers.length > 0 ? (
              <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '10px' }}>#</th>
                    <th style={{ padding: '10px' }}>Full Name</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player, index) => (
                    <tr key={player.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px' }}>{index + 1}</td>
                      <td style={{ padding: '10px' }}>{player.fullName || 'N/A'}</td>
                      <td style={{ padding: '10px' }}>{player.email || 'N/A'}</td>
                      <td style={{ padding: '10px' }}>{player.location || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No players match the search criteria.</p>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-wrapper">
      <header className="admin-topbar">
        <div className="admin-logo">🎾 Referee Panel</div>
        <div className="admin-user">
          👤 {localStorage.getItem('fullName')}<br />
          <small style={{ fontSize: '0.8rem', color: '#9ca3af' }}>referee</small>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <button
            className={activeTab === 'schedule' ? 'active' : ''}
            onClick={() => setActiveTab('schedule')}
          >
            📅 Schedule
          </button>
          <button
            className={activeTab === 'players' ? 'active' : ''}
            onClick={() => setActiveTab('players')}
          >
            🧍 Players
          </button>
          <button onClick={() => { localStorage.clear(); window.location.href = '/' }}>
            Logout
          </button>
        </aside>

        <main className="admin-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default RefereeDashboard;