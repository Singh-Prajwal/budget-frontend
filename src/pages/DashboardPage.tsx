// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import type { FinancialSummary } from '../types';
import { formatCurrency } from '../utils/formatters';
import Spinner from '../components/ui/Spinner';
import BudgetProgressBar from '../components/dashboard/BudgetProgressBar';
import DonutChart from '../components/charts/DonutChart'; // <-- Import the new chart
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<FinancialSummary>('/summary/');
        setSummary(response.data);
      } catch (err) {
        setError('Failed to fetch financial summary.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="error">{error}</p>;
  if (!summary) return <p>No summary data available.</p>;

  const totalBudget = summary.budget_vs_actual.reduce((sum, item) => sum + parseFloat(item.budgeted_amount), 0);
  const totalSpent = parseFloat(summary.total_expenses);
  const hasExpenseData = summary.expenses_by_category && summary.expenses_by_category.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Monthly Budget Overview</h1>
        <p>Here’s a summary of your financial activity for the current month.</p>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.card}>
          <span>Total Income</span>
          <h2>{formatCurrency(summary.total_income)}</h2>
        </div>
        <div className={styles.card}>
          <span>Total Expenses</span>
          <h2>{formatCurrency(summary.total_expenses)}</h2>
        </div>
        <div className={styles.card}>
          <span>Remaining Balance</span>
          <h2>{formatCurrency(summary.balance)}</h2>
        </div>
      </div>

      {/* Only show budget progress if a budget is set */}
      {totalBudget > 0 && <BudgetProgressBar spent={totalSpent} total={totalBudget} />}

      <div className={styles.breakdownContainer}>
        <h3>Expense Breakdown</h3>
        {hasExpenseData ? (
          <div className={styles.breakdownContent}>
            <div className={styles.chartWrapper}>
              <DonutChart data={summary.expenses_by_category} />
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.expenses_by_category.map(item => (
                    <tr key={item.category__name}>
                      <td>{item.category__name}</td>
                      <td>{formatCurrency(item.total)}</td>
                      <td>{totalSpent > 0 ? ((parseFloat(item.total) / totalSpent) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={styles.noData}>
            <p>No expense data for this month. Add a transaction to see your breakdown.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
// // src/pages/DashboardPage.tsx
// import React, { useState, useEffect } from 'react';
// import apiClient from '../api/apiClient';
// import type { FinancialSummary } from '../types';
// import { formatCurrency } from '../utils/formatters';
// import Spinner from '../components/ui/Spinner';
// import BudgetProgressBar from '../components/dashboard/BudgetProgressBar';
// import styles from './DashboardPage.module.css';

// const DashboardPage = () => {
//   const [summary, setSummary] = useState<FinancialSummary | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchSummary = async () => {
//       try {
//         setLoading(true);
//         const response = await apiClient.get<FinancialSummary>('/summary/');
//         setSummary(response.data);
//       } catch (err) {
//         setError('Failed to fetch financial summary.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSummary();
//   }, []);

//   if (loading) return <Spinner />;
//   if (error) return <p className="error">{error}</p>;
//   if (!summary) return <p>No summary data available.</p>;

//   const totalBudget = summary.budget_vs_actual.reduce((sum, item) => sum + parseFloat(item.budgeted_amount), 0);
//   const totalSpent = parseFloat(summary.total_expenses);

//   return (
//     <div className={styles.container}>
//       <div className={styles.header}>
//         <h1>Monthly Budget Overview</h1>
//         <p>Here’s a summary of your financial activity for the current month.</p>
//       </div>

//       <div className={styles.summaryGrid}>
//         <div className={styles.card}>
//           <span>Total Income</span>
//           <h2>{formatCurrency(summary.total_income)}</h2>
//         </div>
//         <div className={styles.card}>
//           <span>Total Expenses</span>
//           <h2>{formatCurrency(summary.total_expenses)}</h2>
//         </div>
//         <div className={styles.card}>
//           <span>Remaining Balance</span>
//           <h2>{formatCurrency(summary.balance)}</h2>
//         </div>
//       </div>

//       <BudgetProgressBar spent={totalSpent} total={totalBudget} />

//       <div className={styles.breakdown}>
//         <h3>Expense Breakdown</h3>
//         <table className={styles.table}>
//           <thead>
//             <tr>
//               <th>Category</th>
//               <th>Amount</th>
//               <th>Percentage</th>
//             </tr>
//           </thead>
//           <tbody>
//             {summary.expenses_by_category.map(item => (
//               <tr key={item.category__name}>
//                 <td>{item.category__name}</td>
//                 <td>{formatCurrency(item.total)}</td>
//                 <td>{totalSpent > 0 ? ((parseFloat(item.total) / totalSpent) * 100).toFixed(1) : 0}%</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;