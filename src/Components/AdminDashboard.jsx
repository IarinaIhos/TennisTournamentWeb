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
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fullName = localStorage.getItem('fullName') || 'Admin';
  const role = localStorage.getItem('role') || 'admin';

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch players
      const playersRes = await fetch('http://localhost:8080/api/users/players');
      if (!playersRes.ok) throw new Error('Failed to fetch players');
      const playersData = await playersRes.json();
      setUsers(playersData);

      // Fetch referees
      const refereesRes = await fetch('http://localhost:8080/api/users/referees');
      if (!refereesRes.ok) throw new Error('Failed to fetch referees');
      const refereesData = await refereesRes.json();
      setReferees(refereesData);

      // Fetch tournaments and their participants/matches
      const tournamentsRes = await fetch('http://localhost:8080/api/tournaments');
      if (!tournamentsRes.ok) throw new Error('Failed to fetch tournaments');
      const tournamentsData = await tournamentsRes.json();
      setTournaments(tournamentsData);

      const participantsData = {};
      const matchesData = {};
      for (const t of tournamentsData) {
        const participantsRes = await fetch(`http://localhost:8080/api/tournaments/${t.id}/participants`);
        if (participantsRes.ok) {
          const users = await participantsRes.json();
          participantsData[t.id] = users;
        }

        const matchesRes = await fetch(`http://localhost:8080/api/tournaments/${t.id}/matches`);
        if (matchesRes.ok) {
          const matchList = await matchesRes.json();
          matchesData[t.id] = matchList;
        }
      }
      setParticipants(participantsData);
      setMatches(matchesData);

      // Fetch pending registrations
      const pendingRes = await fetch('http://localhost:8080/api/tournaments/registrations/pending');
      if (!pendingRes.ok) throw new Error('Failed to fetch pending registrations');
      const pendingData = await pendingRes.json();
      setPendingRegistrations(pendingData);
    } catch (err) {
      console.error(err);
      alert('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateMatches = async (tournamentId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tournaments/${tournamentId}/generate-matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'Matches generated.');
        // Refresh matches
        const matchesRes = await fetch(`http://localhost:8080/api/tournaments/${tournamentId}/matches`);
        if (matchesRes.ok) {
          const matchList = await matchesRes.json();
          setMatches(prev => ({ ...prev, [tournamentId]: matchList }));
        }
      } else {
        const error = await res.text();
        alert(`Failed to generate matches: ${error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error generating matches: ' + err.message);
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
        setMatches(prev => ({
          ...prev,
          [tournamentId]: prev[tournamentId].map(m =>
            m.id === matchId ? { ...m, referee: referees.find(r => r.id === parseInt(refereeId)) } : m
          ),
        }));
      } else {
        const error = await res.text();
        alert(`Failed to assign referee: ${error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error assigning referee: ' + err.message);
    }
  };

  const handleApproveRegistration = async (registrationId, tournamentId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tournaments/registrations/${registrationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'Registration approved!');
        // Remove from pending registrations
        setPendingRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
        // Refresh participants
        const participantsRes = await fetch(`http://localhost:8080/api/tournaments/${tournamentId}/participants`);
        if (participantsRes.ok) {
          const users = await participantsRes.json();
          setParticipants(prev => ({ ...prev, [tournamentId]: users }));
        }
      } else {
        const error = await res.text();
        alert(`Failed to approve registration: ${error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error approving registration: ' + err.message);
    }
  };

  const handleRejectRegistration = async (registrationId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tournaments/registrations/${registrationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'Registration rejected!');
        // Remove from pending registrations
        setPendingRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
      } else {
        const error = await res.text();
        alert(`Failed to reject registration: ${error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error rejecting registration: ' + err.message);
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
      alert('Error updating user: ' + err.message);
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
        alert('Error deleting user: ' + err.message);
      }
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

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
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <button onClick={() => setSelectedUser(user)}>Edit</button>
                          <button onClick={() => handleDeleteUser(user.id)} className="btn-danger">Delete</button>
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
          <div className="tournaments-section">
            <div className="section-header">
              <h3>🏟️ Tournaments & Registered Players</h3>
              <button onClick={fetchData} className="btn-refresh">🔄 Refresh</button>
            </div>

            {/* Pending Registrations Section */}
            <div className="card">
              <h4>Pending Registrations</h4>
              {pendingRegistrations.length > 0 ? (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Tournament</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRegistrations.map(reg => (
                      <tr key={reg.id}>
                        <td>{reg.player.fullName}</td>
                        <td>{reg.tournament.name}</td>
                        <td>
                          <button
                            onClick={() => handleApproveRegistration(reg.id, reg.tournament.id)}
                            className="btn-success"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRegistration(reg.id)}
                            className="btn-danger"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-message">No pending registrations.</p>
              )}
            </div>

            {/* Active Tournaments Section */}
            <div className="card">
              <h4>Active Tournaments</h4>
              {tournaments.length > 0 ? (
                tournaments.map(tournament => (
                  <div key={tournament.id} className="tournament-card">
                    <div className="tournament-header">
                      <h5>{tournament.name} ({tournament.location})</h5>
                      <p className="tournament-dates">
                        <strong>{tournament.startDate}</strong> ➜ <strong>{tournament.endDate}</strong>
                      </p>
                      <button
                        onClick={() => handleGenerateMatches(tournament.id)}
                        className="btn-primary"
                      >
                        Generate Matches
                      </button>
                    </div>

                    {/* Participants Table */}
                    <div className="tournament-section">
                      <h6>Accepted Participants</h6>
                      {participants[tournament.id]?.length > 0 ? (
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {participants[tournament.id].map(player => (
                              <tr key={player.id}>
                                <td>{player.fullName}</td>
                                <td>{player.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="empty-message">No participants yet.</p>
                      )}
                    </div>

                    {/* Matches Table */}
                    <div className="tournament-section">
                      <h6>Matches</h6>
                      {matches[tournament.id]?.length > 0 ? (
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>Player 1</th>
                              <th>Player 2</th>
                              <th>Winner</th>
                              <th>Referee</th>
                              <th>Assign Referee</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matches[tournament.id].map(m => (
                              <tr key={m.id}>
                                <td>{m.player1?.fullName || 'TBD'}</td>
                                <td>{m.player2?.fullName || 'TBD'}</td>
                                <td>{m.winner ? m.winner.fullName : 'Pending'}</td>
                                <td>{m.referee ? m.referee.fullName : 'None'}</td>
                                <td>
                                  <select
                                    onChange={(e) => handleAssignReferee(m.id, e.target.value, tournament.id)}
                                    value={m.referee?.id || ''}
                                    className="referee-select"
                                  >
                                    <option value="">Select Referee</option>
                                    {referees.map(referee => (
                                      <option key={referee.id} value={referee.id}>
                                        {referee.fullName}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="empty-message">No matches yet.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No tournaments available.</p>
              )}
            </div>
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
          <button className={activeTab === 'players' ? 'active' : ''} onClick={() => setActiveTab('players')}>
            🧍 Player Score List
          </button>
          <button className={activeTab === 'referees' ? 'active' : ''} onClick={() => setActiveTab('referees')}>
            🧑‍⚖️ Referees List
          </button>
          <button className={activeTab === 'games' ? 'active' : ''} onClick={() => setActiveTab('games')}>
            🎮 Games
          </button>
          <button className={activeTab === 'scoreboard' ? 'active' : ''} onClick={() => setActiveTab('scoreboard')}>
            🏆 Scoreboard
          </button>
          <button className={activeTab === 'tournamentParticipants' ? 'active' : ''} onClick={() => setActiveTab('tournamentParticipants')}>
            🏟️ Tournaments & Players
          </button>
          <button className={activeTab === 'logout' ? 'active' : ''} onClick={() => setActiveTab('logout')}>
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

export default AdminDashboard;