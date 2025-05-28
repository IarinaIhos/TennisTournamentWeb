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

  const fullName = localStorage.getItem('fullName') || 'Admin';
  const role = localStorage.getItem('role') || 'admin';

  useEffect(() => {
    fetch('http://localhost:8080/api/users/players')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  }, []);

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
                          <button onClick={() => setSelectedUser({ ...user })}>Edit</button>
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
          👤 {fullName}
          <br />
          <small style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'capitalize' }}>
            {role}
          </small>
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