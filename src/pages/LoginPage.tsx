// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import styles from './AuthPages.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Welcome back</h2>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input id="email" className={styles.input} type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input id="password" className={styles.input} type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className={styles.button} type="submit">Log In</button>
      </form>
  
       <p className={styles.linkText}>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
    </div>
  );
};
export default LoginPage;