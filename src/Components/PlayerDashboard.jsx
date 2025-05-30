import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function PlayerDashboard() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const fullName = localStorage.getItem('fullName') || 'Player';

  // Redirect to login if userId is missing
  useEffect(() => {
    if (!userId) {
      alert('Please log in to access the dashboard.');
      window.location.href = '/login';
    }
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return; // Skip fetching if userId is missing

      try {
        setLoading(true);

        // Fetch tournaments
        const tourRes = await fetch('http://localhost:8080/api/tournaments');
        if (!tourRes.ok) throw new Error('Failed to fetch tournaments');
        const tournaments = await tourRes.json();
        setTournaments(tournaments);

        // Fetch matches
        const matchRes = await fetch(`http://localhost:8080/api/matches/player/${userId}`);
        if (!matchRes.ok) throw new Error('Failed to fetch matches');
        const matches = await matchRes.json();
        setMatches(matches);

        // Fetch registrations
        const regRes = await fetch(`http://localhost:8080/api/tournaments/registrations?playerId=${userId}`);
        if (!regRes.ok) throw new Error('Failed to fetch registrations');
        const registrations = await regRes.json();
        setRegistrations(registrations);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        alert('Could not load player data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleRegister = async (tournamentId, tournamentName) => {
    if (!window.confirm(`Are you sure you want to register for ${tournamentName}?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: userId }),
      });

      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : await res.text();

      if (res.ok) {
        alert(data.message || 'Registration submitted! Waiting for admin approval.');
        // Refresh registrations
        const regRes = await fetch(`http://localhost:8080/api/tournaments/registrations?playerId=${userId}`);
        if (regRes.ok) {
          const registrations = await regRes.json();
          setRegistrations(registrations);
        }
      } else {
        alert(data.message || data || 'Failed to register.');
      }
    } catch (err) {
      console.error(err);
      alert('Error registering: ' + err.message);
    }
  };

  const getRegistrationStatus = (tournamentId) => {
    const registration = registrations.find(reg => reg.tournament.id === tournamentId);
    return registration ? registration.status : null;
  };

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (activeTab === 'tournaments') {
      return (
        <div>
          <h3>🏆 Available Tournaments</h3>
          {tournaments.length > 0 ? (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map(t => {
                  const status = getRegistrationStatus(t.id);
                  return (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>{t.startDate}</td>
                      <td>{t.endDate}</td>
                      <td>{t.location}</td>
                      <td>
                        {status ? (
                          <span
                            style={{
                              color:
                                status === 'PENDING' ? 'orange' :
                                status === 'APPROVED' ? 'green' : 'red',
                            }}
                          >
                            {status}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {status ? (
                          'Registered'
                        ) : (
                          <button onClick={() => handleRegister(t.id, t.name)}>Register</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No tournaments available.</p>
          )}
        </div>
      );
    }

    if (activeTab === 'matches') {
      return (
        <div>
          <h3>📅 Your Matches</h3>
          {matches.length > 0 ? (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Opponent</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Winner</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(match => (
                  <tr key={match.id}>
                    <td>{match.tournament?.name || '-'}</td>
                    <td>
                      {parseInt(userId) === match.player1.id
                        ? match.player2.fullName
                        : match.player1.fullName}
                    </td>
                    <td>{match.matchDate || '-'}</td>
                    <td>
                      {match.player1Points != null && match.player2Points != null
                        ? `${match.player1Points} - ${match.player2Points}`
                        : 'Pending'}
                    </td>
                    <td>
                      {match.winner
                        ? match.winner.id === parseInt(userId)
                          ? 'You'
                          : match.winner.fullName
                        : 'TBD'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No matches scheduled. Register and get approved for a tournament to participate!</p>
          )}
        </div>
      );
    }

    if (activeTab === 'logout') {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="admin-wrapper">
      <header className="admin-topbar">
        <div className="admin-logo">🎾 Tennis Player Panel</div>
        <div className="admin-user">
          👤 {fullName}
          <br />
          <small style={{ fontSize: '0.8rem', color: '#9ca3af' }}>player</small>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <button className={activeTab === 'tournaments' ? 'active' : ''} onClick={() => setActiveTab('tournaments')}>
            🏁 Tournaments
          </button>
          <button className={activeTab === 'matches' ? 'active' : ''} onClick={() => setActiveTab('matches')}>
            🗓️ Matches
          </button>
          <button className={activeTab === 'logout' ? 'active' : ''} onClick={() => setActiveTab('logout')}>
            🚪 Logout
          </button>
        </aside>

        <main className="admin-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default PlayerDashboard;