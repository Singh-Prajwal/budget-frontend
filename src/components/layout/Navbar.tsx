// src/components/layout/Navbar.tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Navbar.module.css';
import {  User } from 'lucide-react'; // A popular icon library

const Navbar = () => {
  const { logout, user } = useAuth();
  // Install lucide-react: npm install lucide-react
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <NavLink to="/dashboard" className={styles.brand}>
          BudgetWise
        </NavLink>
        <div className={styles.navMenu}>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>Dashboard</NavLink>
          <NavLink to="/transactions" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>Transactions</NavLink>
          <NavLink to="/budget" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>Budgets</NavLink>
        </div>
        <div className={styles.navRight}>
          <div className={styles.profileDropdown}>
            <button className={styles.iconButton}><User size={20} /></button>
            <div className={styles.dropdownContent}>
              <span>Signed in as</span>
              <strong>{user?.email}</strong>
              <hr />
              <button onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;