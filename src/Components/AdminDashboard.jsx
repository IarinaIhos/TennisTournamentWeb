import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import PlayerList from './PlayerList';
import RefereeList from './RefereeList';
import Games from './Games';
import Scoreboard from './Scoreboard';
import Logout from './Logout';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('players');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [participants, setParticipants] = useState({});
  const [matches, setMatches] = useState({});
  const [referees, setReferees] = useState([]);

  const fullName = localStorage.getItem('fullName') || 'Admin';
  const role = localStorage.getItem('role') || 'admin';

  useEffect(() => {
    // Fetch players
    fetch('http://localhost:8080/api/users/players')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err));

    // Fetch referees
    fetch('http://localhost:8080/api/users/referees')
      .then(res => res.json())
      .then(data => setReferees(data))
      .catch(err => console.error(err));

    // Fetch tournaments and their participants/matches
    fetch('http://localhost:8080/api/tournaments')
      .then(res => res.json())
      .then(data => {
        setTournaments(data);
        data.forEach(t => {
          fetch(`http://localhost:8080/api/tournaments/${t.id}/participants`)
            .then(res => res.json())
            .then(users => {
              setParticipants(prev => ({ ...prev, [t.id]: users }));
            });

          fetch(`http://localhost:8080/api/tournaments/${t.id}/matches`)
            .then(res => res.json())
            .then(matchList => {
              setMatches(prev => ({ ...prev, [t.id]: matchList }));
            });
        });
      });
  }, []);

  const handleGenerateMatches = async (tournamentId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tournaments/${tournamentId}/generate-matches`, {
        method: 'POST',
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : await res.text();
      alert(data.message || 'Matches generated.');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to generate matches.');
    }
  };

  const handleAssignReferee = async (matchId, refereeId, tournamentId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/matches/${matchId}/assign-referee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refereeId }),
      });
      if (res.ok) {
        alert('Referee assigned successfully!');
        // Update the match with the assigned referee
        setMatches(prev => ({
          ...prev,
          [tournamentId]: prev[tournamentId].map(m =>
            m.id === matchId ? { ...m, referee: referees.find(r => r.id === parseInt(refereeId)) } : m
          ),
        }));
      } else {
        const error = await res.json();
        alert(`Failed to assign referee: ${error.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error assigning referee.');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8080/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser),
      });
      if (res.ok) {
        alert('User updated successfully!');
        setUsers(users.map(u => u.id === selectedUser.id ? { ...selectedUser } : u));
        setSelectedUser(null);
      } else {
        const error = await res.json();
        alert(`Failed to update user: ${error.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating user.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          alert('User deleted successfully!');
          setUsers(users.filter(u => u.id !== id));
        } else {
          const error = await res.json();
          alert(`Failed to delete user: ${error.message || 'Unknown error'}`);
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting user.');
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'players':
        return (
          <div>
            <PlayerList />
            <h3>Manage Users</h3>
            {selectedUser ? (
              <div className="edit-user-form">
                <h4>Edit User</h4>
                <form onSubmit={handleUpdateUser}>
                  <input
                    type="text"
                    value={selectedUser.fullName || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                    placeholder="Full Name"
                    required
                  />
                  <input
                    type="email"
                    value={selectedUser.email || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    placeholder="Email"
                    required
                  />
                  <input
                    type="text"
                    value={selectedUser.phoneNumber || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                    placeholder="Phone Number"
                  />
                  <input
                    type="text"
                    value={selectedUser.location || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, location: e.target.value })}
                    placeholder="Location"
                  />
                  <select
                    value={selectedUser.role || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    required
                  >
                    <option value="player">Player</option>
                    <option value="referee">Referee</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setSelectedUser(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h4>All Users</h4>
                <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '10px' }}>Name</th>
                      <th style={{ padding: '10px' }}>Email</th>
                      <th style={{ padding: '10px' }}>Role</th>
                      <th style={{ padding: '10px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '10px' }}>{user.fullName}</td>
                        <td style={{ padding: '10px' }}>{user.email}</td>
                        <td style={{ padding: '10px' }}>{user.role}</td>
                        <td style={{ padding: '10px' }}>
                          <button onClick={() => setSelectedUser(user)}>Edit</button>
                          <button onClick={() => handleDeleteUser(user.id)} style={{ marginLeft: '10px' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'referees':
        return <RefereeList />;
      case 'games':
        return <Games />;
      case 'scoreboard':
        return <Scoreboard />;
      case 'tournamentParticipants':
        return (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>🏟️ Tournaments & Registered Players</h3>
            {tournaments.map(tournament => (
              <div key={tournament.id} style={{ marginBottom: '2rem' }}>
                <h4>{tournament.name} ({tournament.location})</h4>
                <p><strong>{tournament.startDate}</strong> ➜ <strong>{tournament.endDate}</strong></p>
                <button onClick={() => handleGenerateMatches(tournament.id)} style={{ marginBottom: '0.5rem' }}>
                  Generate Matches
                </button>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  {participants[tournament.id]?.length > 0 ? (
                    participants[tournament.id].map(player => (
                      <li key={player.id}>
                        {player.fullName} ({player.email})
                      </li>
                    ))
                  ) : (
                    <li>No participants yet</li>
                  )}
                </ul>
                <h5 style={{ marginTop: '1rem' }}>🎾 Matches</h5>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  {matches[tournament.id]?.length > 0 ? (
                    matches[tournament.id].map(m => (
                      <li key={m.id}>
                        {m.player1.fullName} vs {m.player2.fullName} ➜ {m.winner ? `Winner: ${m.winner.fullName}` : 'Pending'}
                        <div style={{ marginTop: '0.5rem' }}>
                          <label style={{ marginRight: '0.5rem' }}>Assign Referee:</label>
                          <select
                            onChange={(e) => handleAssignReferee(m.id, e.target.value, tournament.id)}
                            value={m.referee?.id || ''}
                            style={{ padding: '0.3rem', marginRight: '0.5rem' }}
                          >
                            <option value="">Select Referee</option>
                            {referees.map(referee => (
                              <option key={referee.id} value={referee.id}>
                                {referee.fullName}
                              </option>
                            ))}
                          </select>
                          <span>Current: {m.referee ? m.referee.fullName : 'None'}</span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li>No matches yet</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        );
      case 'logout':
        return <Logout />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-wrapper">
      <header className="admin-topbar">
        <div className="admin-logo">🎾 Tennis Admin Panel</div>
        <div className="admin-user">
          👤 {fullName}<br />
          <small style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'capitalize' }}>{role}</small>
        </div>
      </header>
      <div className="admin-body">
        <aside className="admin-sidebar">
          <button className={activeTab === 'players' ? 'active' : ''} onClick={() => setActiveTab('players')}>🧍 Player Score List</button>
          <button className={activeTab === 'referees' ? 'active' : ''} onClick={() => setActiveTab('referees')}>🧑‍⚖️ Referees List</button>
          <button className={activeTab === 'games' ? 'active' : ''} onClick={() => setActiveTab('games')}>🎮 Games</button>
          <button className={activeTab === 'scoreboard' ? 'active' : ''} onClick={() => setActiveTab('scoreboard')}>🏆 Scoreboard</button>
          <button className={activeTab === 'tournamentParticipants' ? 'active' : ''} onClick={() => setActiveTab('tournamentParticipants')}>🏟️ Tournaments & Players</button>
          <button className={activeTab === 'logout' ? 'active' : ''} onClick={() => setActiveTab('logout')}>Logout</button>
        </aside>
        <main className="admin-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;