import React, { useState, useEffect } from 'react';
import type{ Transaction, Category } from '../../types';
import apiClient from '../../api/apiClient';

interface TransactionFormProps {
  onSave: () => void;
  transactionToEdit: Transaction | null;
  categories: Category[];
}

const TransactionForm = ({ onSave, transactionToEdit, categories }: TransactionFormProps) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [error, setError] = useState('');

  useEffect(() => {
    if (transactionToEdit) {
      setAmount(String(transactionToEdit.amount));
      setCategory(String(transactionToEdit.category));
      setDate(transactionToEdit.date);
      setDescription(transactionToEdit.description);
      setType(transactionToEdit.type);
    } else {
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setType('EXPENSE');
    }
  }, [transactionToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) {
        setError('Please fill all required fields.');
        return;
    }
    
    const data = { amount, category: parseInt(category), date, description, type };

    try {
      if (transactionToEdit) {
        await apiClient.put(`/transactions/${transactionToEdit.id}/`, data);
      } else {
        await apiClient.post('/transactions/', data);
      }
      onSave();
    } catch (err) {
      console.error(err);
      setError('Failed to save transaction.');
    }
  };
  
  const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1rem', color:"black" };
  const inputStyle: React.CSSProperties = { padding: '8px', borderRadius: '4px', border: '1px solid #6c757d', backgroundColor: '#343a40', color: '#f8f9fa' };
  const buttonStyle: React.CSSProperties = { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

  return (
    <form onSubmit={handleSubmit}  style={formStyle}>
      <h2>{transactionToEdit ? 'Edit' : 'Add'} Transaction</h2>
      {error && <p style={{color: '#f8d7da'}}>{error}</p>}
      
      <select value={type} onChange={e => setType(e.target.value as any)} style={inputStyle}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
      </select>
      <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} required step="0.01" />
      <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle} required>
        <option value="">Select Category</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} required />
      <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
      
      <button type="submit" style={buttonStyle}>Save Transaction</button>
    </form>
  );
};

export default TransactionForm;