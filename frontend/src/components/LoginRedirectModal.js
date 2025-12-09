import React from 'react';
import styles from './styles/LoginRedirectModal.module.css';

const LoginRedirectModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Login Required</h2>
        <p className={styles.message}>Please log in first to access this feature.</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.loginBtn} onClick={onLogin}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRedirectModal;