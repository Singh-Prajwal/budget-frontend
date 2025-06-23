// src/pages/transactions/AddTransactionPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import type{ Category } from '../../types';
import Spinner from '../../components/ui/Spinner';
import styles from './AddTransactionPage.module.css';

const AddTransactionPage = () => {
  // --- STATE ---
  const [type, setType] = useState('EXPENSE');
  const [categoryId, setCategoryId] = useState(''); // Use categoryId to avoid confusion
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // For disabling the button

  const navigate = useNavigate();
  const getCategories = async()=> {
    try {
      const res = await apiClient.get<any>('/categories/');
      setCategories(res.data.results);
    } catch (err) {
      setError('Could not load categories. Please add a category in the Budget Settings first.');
    }
  }
  // --- DATA FETCHING ---
  useEffect(() => {
    setLoading(true);
    getCategories()
        setLoading(false);

    // apiClient.get<Category[]>('/categories/')
    //   .then(res => {
    //     setCategories(res.data);
    //   })
    //   .catch(() => {
    //     setError('Could not load categories. Please add a category in the Budget Settings first.');
    //   })
    //   .finally(() => {
    //   });
  }, []);

  // --- FORM SUBMISSION HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!categoryId || !amount || !date) {
      setError('Please fill out all required fields: Type, Category, Amount, and Date.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    // Construct the payload that matches the backend serializer
    const payload = {
      type: type,
      category: parseInt(categoryId),
      amount: parseFloat(amount),
      date: date,
      description: description,
    };

    try {
      // Make the API call
      await apiClient.post('/transactions/', payload);
      // On success, navigate back to the transactions list
      navigate('/transactions');
    } catch (err: any) {
      // Better error handling to display backend messages
      const errorData = err.response?.data;
      if (errorData) {
          const errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${value}`).join(' ');
          setError(`Failed to add transaction: ${errorMessage}`);
      } else {
          setError('An unknown error occurred. Please try again.');
      }
      console.error(err);
    } finally {
      setIsSubmitting(false); // Re-enable the button
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Add Transaction</h1>
      </div>

      {/* Display an error if categories couldn't be loaded */}
      {categories.length === 0 && !loading && (
          <p className={styles.error}>
              No categories found. Please go to the "Settings" page and add a category before adding a transaction.
          </p>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.error}>{error}</p>}
        
        <div className={styles.inputGroup}>
          <label>Transaction Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className={styles.select}>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={styles.select} required>
            <option value="" disabled>Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Amount</label>
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="0.00" 
            className={styles.input} 
            step="0.01"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className={styles.input}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Description (optional)</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Add a note" 
            className={styles.textarea} 
          />
        </div>

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.button} disabled={isSubmitting || categories.length === 0}>
            {isSubmitting ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransactionPage;