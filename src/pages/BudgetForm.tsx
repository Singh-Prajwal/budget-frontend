import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import styles from './BudgetForm.module.css';

interface BudgetFormProps {
  onBudgetUpdate: () => void;
}

const BudgetForm = ({ onBudgetUpdate }: BudgetFormProps) => {
  const [categoryName, setCategoryName] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const today = new Date();
  const [month] = useState(today.getMonth() + 1);
  const [year] = useState(today.getFullYear());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim() || !amount) {
      setError('All fields are required.');
      setSuccess('');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/budgets/', {
        category_name: categoryName,
        amount,
        month,
        year,
      });
      setSuccess(`Budget for '${categoryName}' set to $${amount}.`);
      setCategoryName('');
      setAmount('');
      onBudgetUpdate();
    } catch (err) {
      setError('Failed to set budget. Ensure the category exists.');
    }
  };

  return (
    <div className={styles.container}>
      <h4>Set or Update a Budget for the Current Month</h4>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={categoryName}
          onChange={e => setCategoryName(e.target.value)}
          placeholder="Category Name (e.g., Groceries)"
          className={styles.input}
        />
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Budget Amount"
          className={styles.input}
          step="0.01"
        />
        <button type="submit" className={styles.button}>Set Budget</button>
      </form>
    </div>
  );
};

export default BudgetForm;