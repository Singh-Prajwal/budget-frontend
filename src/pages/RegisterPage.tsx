import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import styles from './AuthPages.module.css';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    try {
      await apiClient.post('/user/register/', { username, email, password, password2 });
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errorMessage = Object.values(errorData).flat().join(' ');
        setError(errorMessage);
      } else {
        setError('An unknown error occurred during registration.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Create your account</h2>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.inputGroup}>
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" className={styles.input} type="text" placeholder="Enter your full name" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input id="email" className={styles.input} type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input id="password" className={styles.input} type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" className={styles.input} type="password" placeholder="Confirm your password" value={password2} onChange={e => setPassword2(e.target.value)} required />
        </div>
        <button className={styles.button} type="submit">Sign Up</button>
      </form>
      <p className={styles.linkText}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};
export default RegisterPage;