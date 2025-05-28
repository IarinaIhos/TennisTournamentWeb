import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email, password })
      });

      const data = await res.json();

      if (res.ok && data.message === 'Login success!') {
        alert('Login success!');
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('role', data.role);
        localStorage.setItem('fullName', data.fullName);

        if (data.role === 'admin') navigate('/admin');
        else if (data.role === 'refferee') navigate('/referee');
        else navigate('/player');
      } else {
        alert('Login failed!');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ textAlign: 'center' }}>Login</h2>

      <select value={role} onChange={(e) => setRole(e.target.value)} required>
        <option value="">Select Role</option>
        <option value="player">Player</option>
        <option value="refferee">Referee</option>
        <option value="admin">Admin</option>
      </select>

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />

      <button type="submit" style={{
        padding: '10px',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px'
      }}>
        Sign In
      </button>
    </form>
  );
}

export default LoginForm;
