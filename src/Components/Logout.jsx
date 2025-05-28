import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all stored user data
    localStorage.clear();

    // Redirect to login or home
    navigate('/');
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>You have been logged out.</h2>
      <p>Redirecting to login...</p>
    </div>
  );
}

export default Logout;
