// src/components/dashboard/BudgetProgressBar.tsx
import React from 'react';
import styles from './BudgetProgressBar.module.css';
import { formatCurrency } from '../../utils/formatters';

interface BudgetProgressBarProps {
  spent: number;
  total: number;
}

const BudgetProgressBar = ({ spent, total }: BudgetProgressBarProps) => {
  const percentage = total > 0 ? (spent / total) * 100 : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p>You’ve spent <strong>{formatCurrency(spent)}</strong> out of {formatCurrency(total)}</p>
        <p><strong>{Math.round(percentage)}%</strong></p>
      </div>
      <div className={styles.progressBar}>
        <div 
          className={styles.progress} 
          style={{ width: `${percentage > 100 ? 100 : percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BudgetProgressBar;