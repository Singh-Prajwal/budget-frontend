// src/pages/BudgetPage.tsx
import  { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import type { Category } from '../types';
import Spinner from '../components/ui/Spinner';
import styles from './BudgetPage.module.css';
import AddBudgetModal from '../components/budget/AddBudgetModal';

// Combined type for easier state management
type CategoryWithBudget = Category & { budgetAmount: string };

// Sub-component for each budget item - remains the same as before
// const BudgetCategoryItem = ({ item, onUpdate }: { item: CategoryWithBudget, onUpdate: () => void }) => {
//   // ... This component's code is unchanged and correct.
//   const [amount, setAmount] = useState(item.budgetAmount);
//   const handleUpdate = async () => { /* ... */ };
//   return ( <div className={styles.item}> {/* ... */} </div> );
// };

// Main Page Component
const BudgetPage = () => {
  const [categoriesWithBudget, setCategoriesWithBudget] = useState<CategoryWithBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // --- NEW STATE FOR ADDING CATEGORIES ---
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addCategoryError, setAddCategoryError] = useState('');

  const fetchData = useCallback(async () => {
    // This function remains the same as before, no changes needed here.
    setLoading(true);
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      // const [catRes, budRes] = await Promise.all([
      //   apiClient.get<Category[]>('/categories/'),
      //   apiClient.get<Budget[]>(`/budgets/?month=${month}&year=${year}`)
      // ]);
      const budgets:any = await apiClient.get<any>(`/budgets/?month=${month}&year=${year}`);
      const categories:any = await apiClient.get<any>('/categories/');
      
      const budgetsMap = new Map(budgets.data.results.map((b:any) => [b.category, b.amount]));
      const combined = categories.data.results.map((cat:any) => ({
        ...cat,
        budgetAmount: budgetsMap.get(cat.id) || ''
      }));
      setCategoriesWithBudget(combined);
    } catch (error) {
      console.error("Failed to fetch budget settings", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- NEW HANDLER FOR ADDING A CATEGORY ---
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setAddCategoryError('Category name cannot be empty.');
      return;
    }
    setAddCategoryError('');
    try {
      await apiClient.post('/categories/', { name: newCategoryName });
      setNewCategoryName('');
      setShowAddCategory(false);
      fetchData(); // Refresh the entire list to show the new category
    } catch (error) {
      console.error("Failed to add category", error);
      setAddCategoryError('Failed to add category. It may already exist.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Budget Settings</h1>
        <p>Manage your monthly budgets for different expense categories.</p>
      </div>
      
      {loading ? <Spinner /> : (
        <div className={styles.list}>
          <h3>Expense Categories</h3>
          {categoriesWithBudget.map(item => (
            <BudgetCategoryItem key={item.id} item={item} onUpdate={fetchData} />
          ))}
          
          {/* --- NEW CONDITIONAL ADD CATEGORY FORM --- */}
          {showAddCategory && (
            <div className={styles.addCategoryForm}>
              <input
                type="text"
                placeholder="Enter new category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
              <button onClick={handleAddCategory}>Save</button>
              <button onClick={() => setShowAddCategory(false)} className={styles.cancelButton}>Cancel</button>
              {addCategoryError && <p className={styles.addCategoryError}>{addCategoryError}</p>}
            </div>
          )}

          {!showAddCategory && (
            <button onClick={() => setShowAddCategory(true)} className={styles.addButton}>
              + Add New Category
            </button>
          )}
        </div>
      )}
      
      {/* The button to open the budget modal should be separate and clear */}
      <div className={styles.editBudgetContainer}>
        <button onClick={() => setShowModal(true)} className={styles.editBudgetButton}>
          Set/Edit All Budgets
        </button>
      </div>

      {showModal && <AddBudgetModal onClose={() => setShowModal(false)} onSave={fetchData} />}
    </div>
  );
};
export default BudgetPage;

// Re-add the BudgetCategoryItem sub-component here since it was elided for brevity
const BudgetCategoryItem = ({ item, onUpdate }: { item: CategoryWithBudget, onUpdate: () => void }) => {
    const [amount, setAmount] = useState(item.budgetAmount);
  
    const handleUpdate = async () => {
      // Avoids unnecessary API calls if the value hasn't changed
      if (parseFloat(amount || '0') === parseFloat(item.budgetAmount || '0')) return;
      
      const today = new Date();
      try {
        await apiClient.post('/budgets/', {
          category_name: item.name,
          amount: amount || '0', // Send '0' to clear the budget
          month: today.getMonth() + 1,
          year: today.getFullYear(),
        });
        onUpdate();
      } catch (error) {
        console.error("Failed to update budget", error);
      }
    };
  
    return (
      <div className={styles.item}>
        <div className={styles.itemInfo}>
          <h4>{item.name}</h4>
          <p>Set a monthly budget for {item.name.toLowerCase()}</p>
        </div>
        <div className={styles.itemInput}>
          <span>$</span>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={handleUpdate} // Update when user clicks away
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} // Update on Enter
            placeholder="0.00"
          />
        </div>
      </div>
    );
  };