import React, { useState, useEffect } from 'react';
import type{ Category } from '../types';
import styles from './CategoryManager.module.css';
import apiClient from '../api/apiClient';

interface CategoryManagerProps {
  onCategoryUpdate: () => void;
}

const CategoryManager = ({ onCategoryUpdate }: CategoryManagerProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Category[]>('/categories/');
      setCategories(response.data);
    } catch (err) {
      setError('Could not fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setError('');
    try {
      await apiClient.post('/categories/', { name: newCategoryName });
      setNewCategoryName('');
      await fetchCategories();
      onCategoryUpdate();
    } catch (err) {
      setError('Failed to add category. It might already exist.');
    }
  };

  return (
    <div className={styles.container}>
      <h4>Manage Categories</h4>
      <p>Add spending categories here first. Then, set a budget for them below.</p>
      {error && <p className={styles.error}>{error}</p>}
      <ul className={styles.categoryList}>
        {loading ? <p>Loading...</p> : categories.map(c => <li key={c.id}>{c.name}</li>)}
      </ul>
      <form onSubmit={handleAddCategory} className={styles.form}>
        <input
          type="text"
          value={newCategoryName}
          onChange={e => setNewCategoryName(e.target.value)}
          placeholder="New category name"
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Add Category</button>
      </form>
    </div>
  );
};

export default CategoryManager;