import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './Authentication.css';
import backgroundImage from './images/tennis_login_bkg.jpeg';

function Authentication() {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'admin') window.location.href = '/admin';
    else if (role === 'refferee') window.location.href = '/referee';
    else if (role === 'player') window.location.href = '/player';
  }, []);

  if (!mode) {
    return (
      <div
        className="welcome-container"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="welcome-buttons">
          <button onClick={() => setMode('login')}>Login</button>
          <button onClick={() => setMode('register')}>Register</button>
        </div>
      </div>
    );
  }

  return (
  <div
    className="login-container"
    style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <div className="auth-card">
      <div className="toggle-buttons">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
          Login
        </button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
          Register
        </button>
      </div>
      {mode === 'login' ? <LoginForm /> : <RegisterForm />}
    </div>
  </div>
);

}

export default Authentication;
