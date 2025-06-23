// src/pages/transactions/TransactionsPage.tsx

import  { useState, useEffect } from 'react'; // We only need useState and useEffect
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import type { Transaction } from '../../types';
import Spinner from '../../components/ui/Spinner';
import styles from './TransactionsPage.module.css';
import { Search } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for filters and pagination
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  // const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);

  // --- THE CORE DATA FETCHING LOGIC USING useEffect ---
  const fetchTransactions = async () => {
    setLoading(true);
    setError('');

    // Construct the URL based on the current state of the filters
    let url = `/transactions/?page=${1}&search=${searchTerm}`;
    if (filterType !== 'ALL') {
      url += `&type=${filterType}`;
    }

    try {
      const response = await apiClient.get<any>(url);
      // This is the crucial part: directly set the state with the fetched results.
      // This will ALWAYS trigger a re-render.
      console.log("response",response.data)
      setTransactions(response.data);
      // setTotalPages(Math.ceil(response.data.length / 10)); // Assuming PAGE_SIZE is 10
    } catch (err) {
      setError('Failed to fetch transactions. Please try again.');
      console.error("Fetch Error:", err);
      setTransactions([]); // Clear out old data on error
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // We define the async function inside the effect

    // Debouncing: This prevents firing an API call on every single keystroke.
    // We wait 300ms after the user stops typing before fetching.
    const debounceHandler = setTimeout(() => {
      fetchTransactions();
    }, 300);

    // Cleanup Function: This is essential. It runs before the next effect runs
    // or when the component unmounts. It cancels the pending timeout.
    return () => {
      clearTimeout(debounceHandler);
    };

  // Dependency Array: This effect will re-run whenever any of these values change.
  // This is what makes the filters and search work automatically.
  }, [filterType, searchTerm]);

  // Helper function to keep the JSX clean by handling all possible states
  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={4}><Spinner /></td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={4} className={styles.errorCell}>{error}</td>
        </tr>
      );
    }
    if (!transactions||transactions.length === 0 ) {
      return (
        <tr>
          <td colSpan={4} className={styles.emptyCell}>No transactions found for the current filters.</td>
        </tr>
      );
    }
    return transactions.map(t => (
      <tr key={t.id}>
        <td>{t.date}</td>
        <td>{t.category_name}</td>
        <td>{t.description || '-'}</td>
        <td className={t.type === 'INCOME' ? styles.income : styles.expense}>
          {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
        </td>
      </tr>
    ));
  };
console.log("transactions",transactions)
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Transactions</h1>
        <Link to="/transactions/new" className={styles.newButton}>New Transaction</Link>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Describe transactions..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.tabs}>
          <button onClick={() => setFilterType('ALL')} className={filterType === 'ALL' ? styles.activeTab : ''}>All</button>
          <button onClick={() => setFilterType('INCOME')} className={filterType === 'INCOME' ? styles.activeTab : ''}>Income</button>
          <button onClick={() => setFilterType('EXPENSE')} className={filterType === 'EXPENSE' ? styles.activeTab : ''}>Expenses</button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th style={{textAlign: 'right'}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>
      {/* Pagination component needs to be imported before use */}
      
    </div>
  );
};

export default TransactionsPage;