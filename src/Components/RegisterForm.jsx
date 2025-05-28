import React, { useState } from 'react';

function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    location: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Extract only fields needed by backend
    const { confirmPassword, ...userPayload } = formData;

    try {
      console.log('Submitting registration:', userPayload);
      const res = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
      });

      if (res.ok) {
        alert('Registration successful!');
        window.location.reload(); 
      } else {
        const message = await res.text();
        alert(message);
      }
    } catch (err) {
      console.log('wtf');
      console.error(err);
      alert('Error occurred during registration');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        width: '100%'  
      }}
    >
      <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '1rem' }}>Register</h2>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required className="form-input" />
        <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required className="form-input" />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required className="form-input" />
        <input type="email" name="email" placeholder="Email address" value={formData.email} onChange={handleChange} required className="form-input" />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="form-input" />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required className="form-input" />
      </div>

      <select name="role" value={formData.role} onChange={handleChange} required className="form-input">
        <option value="">Select Role</option>
        <option value="player">Player</option>
        <option value="refferee">Referee</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" className="form-button green">Sign Up</button>
    </form>
  );
}

export default RegisterForm;
