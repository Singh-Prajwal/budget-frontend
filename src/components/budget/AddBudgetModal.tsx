// src/components/budget/AddBudgetModal.tsx - FINAL AND CORRECT
import  { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api/apiClient';
import type{ Category, Budget } from '../../types';
import Spinner from '../ui/Spinner';
import styles from './AddBudgetModal.module.css';
import { X } from 'lucide-react';

interface AddBudgetModalProps {
  onClose: () => void;
  onSave: () => void;
}

const AddBudgetModal = ({ onClose, onSave }: AddBudgetModalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const today = new Date();
      try {
        const [catRes, budRes] = await Promise.all([
          apiClient.get<Category[]>('/categories/'),
          apiClient.get<Budget[]>(`/budgets/?month=${today.getMonth() + 1}&year=${today.getFullYear()}`)
        ]);
        setCategories(catRes.data);
        const initialBudgets = budRes.data.reduce((acc, budget) => {
          acc[budget.category] = budget.amount;
          return acc;
        }, {} as Record<string, string>);
        setBudgets(initialBudgets);
      } catch (error) {
        console.error("Failed to fetch data for modal", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBudgetChange = (categoryId: number, amount: string) => {
    setBudgets(prev => ({ ...prev, [categoryId]: amount }));
  };

  // const handleSave = async () => {
  //   setSaving(true);
  //   const today = new Date();
  //   const month = today.getMonth() + 1;
  //   const year = today.getFullYear();
  //   const promises = Object.entries(budgets)
  //     .map(([categoryId, amount]) => {
  //       const category = categories.find(c => c.id === parseInt(categoryId));
  //       if (category) {
  //         return apiClient.post('/budgets/', {
  //           category_name: category.name,
  //           amount: amount || '0',
  //           month,
  //           year
  //         });
  //       }
  //       return null;
  //     }).filter(p => p !== null);
  //   try {
  //     await Promise.all(promises);
  //     onSave();
  //     onClose();
  //   } catch (error) {
  //     console.error("Failed to save budgets", error);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSave = async () => {
    setSaving(true);
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    // --- CHANGE IS HERE ---
    // Create an array of budget objects to send in a single request
    const payload = Object.entries(budgets)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === parseInt(categoryId));
        if (category) {
          return {
            category_name: category.name,
            amount: amount || '0',
            month,
            year
          };
        }
        return null;
      }).filter(p => p !== null);

    try {
      // Send the entire array in ONE API call
      if (payload.length > 0) {
        await apiClient.post('/budgets/', payload);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Failed to save budgets", error);
    } finally {
      setSaving(false);
    }
  };
  const totalBudget = useMemo(() => {
    return Object.values(budgets).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
  }, [budgets]);

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h2>Add Budget</h2>
          <button onClick={onClose} className={styles.closeButton}><X size={24} /></button>
        </div>
        {loading ? <Spinner /> : (
          <div className={styles.body}>
            <div className={styles.totalBudget}>
              <label>Total Budget</label>
              <div className={styles.totalAmount}>${totalBudget.toFixed(2)}</div>
            </div>
            <h3>Categories</h3>
            <div className={styles.categoryList}>
              {categories.map(cat => (
                <div key={cat.id} className={styles.categoryItem}>
                  <div className={styles.itemInfo}>
                    <h4>{cat.name}</h4>
                    <p>Set a limit</p>
                  </div>
                  <div className={styles.itemInput}>
                    <span>$</span>
                    <input type="number" placeholder="0" value={budgets[cat.id] || ''} onChange={e => handleBudgetChange(cat.id, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className={styles.footer}>
          <button onClick={handleSave} className={styles.saveButton} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AddBudgetModal;