import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children:React.ReactNode;
  title?: string;
  className?: string;
}

const Card = ({ children, title, className = '' }: CardProps) => {
  return (
    <div className={`${styles.card} ${className}`}>
      {title && <h3 className={styles.cardTitle}>{title}</h3>}
      <div className={styles.cardContent}>
        {children}
      </div>
    </div>
  );
};

export default Card;