import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading('Logging in...');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (response.ok) {
        toast.success('Welcome back!', { id: toastId });
        window.location.href = '/dashboard';
      } else {
        const errorData = await response.json();
        const msg = errorData.error || 'Login failed. Please check your secret recipe and artist name.';
        setErrorMessage(msg);
        setIsErrorModalOpen(true);
        toast.dismiss(toastId);
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMessage(msg);
      setIsErrorModalOpen(true);
      toast.dismiss(toastId);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles['login-card']}>
      <Modal 
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title="Recipe Refused!"
        message={errorMessage}
        type="alert"
        confirmText="Try Again"
      />

      <div className={styles.brand}>
        <h1>Photorium</h1>
        <p>Grab your chips and start munching.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="identifier">Artist Name or Email</label>
          <input 
            type="text" 
            id="identifier" 
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required 
            placeholder="e.g. potato_king" 
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Secret Recipe (Password)</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            placeholder="••••••••" 
          />
        </div>

        <button type="submit" className={styles['submit-btn']} disabled={isSubmitting}>
          <span className={styles['btn-text']}>
            {isSubmitting ? 'Entering Fryer...' : 'Enter the Fryer'}
          </span>
          <div className={styles['btn-bg']}></div>
        </button>
      </form>

      <div className={styles.footer}>
        <p>Don't have a spot yet? <a href="/signup">Set up your stash</a></p>
      </div>
    </div>
  );
}
