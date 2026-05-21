import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import toast from 'react-hot-toast';
import styles from './SupportHubModal.module.css';

interface SupportHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  paypalClientId: string;
  isLoggedIn: boolean;
  defaultNickname: string;
}

export default function SupportHubModal({ isOpen, onClose, paypalClientId, isLoggedIn, defaultNickname }: SupportHubModalProps) {
  const [mode, setMode] = useState<'tip' | 'cheddar'>('tip');
  const [amount, setAmount] = useState<string>('5.00');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(!isLoggedIn);
  const [nickname, setNickname] = useState<string>(defaultNickname || '');

  if (!isOpen) return null;

  const handleCreateOrder = async () => {
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mode,
          amount: mode === 'tip' ? amount : '1.99',
        }),
      });
      const orderData = await res.json();

      if (orderData.id) {
        return orderData.id;
      } else {
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail ? `${errorDetail.issue} ${errorDetail.description}` : orderData.error || orderData.message;
        throw new Error(errorMessage);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Could not initiate PayPal Checkout: ${message}`);
      throw err;
    }
  };

  interface ApproveData {
    orderID: string;
  }

  const handleApprove = async (data: ApproveData) => {
    const toastId = toast.loading('Processing payment...');
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID: data.orderID,
          isAnonymous,
          nickname: isAnonymous ? 'Anonymous' : nickname,
          type: mode,
        }),
      });

      const captureData = await res.json();

      if (res.ok) {
        toast.success(mode === 'cheddar' ? 'Cheddar purchased successfully!' : 'Thank you for your donation!', { id: toastId });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(captureData.error || captureData.message || 'Payment failed to capture');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Payment error: ${message}`, { id: toastId });
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Support the Hub</h2>
        <p className={styles.subtitle}>Help keep the fryers running and the chips crispy!</p>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${mode === 'tip' ? styles.activeTab : ''}`}
            onClick={() => setMode('tip')}
          >
            Tip Jar
          </button>
          <button 
            className={`${styles.tab} ${mode === 'cheddar' ? styles.activeTab : ''}`}
            onClick={() => setMode('cheddar')}
          >
            Premium Cheddar
          </button>
        </div>

        <div className={styles.formSection}>
          {mode === 'tip' ? (
            <div className={styles.field}>
              <label>Donation Amount (USD)</label>
              <div className={styles.amountInputWrapper}>
                <span className={styles.currencySymbol}>$</span>
                <input 
                  type="number" 
                  min="1" 
                  step="1" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  className={styles.amountInput}
                />
              </div>
            </div>
          ) : (
            <div className={styles.cheddarPromo}>
              <span className={styles.cheddarIcon}>🧀</span>
              <div className={styles.cheddarText}>
                <h3>Buy 1 Cheddar Chip</h3>
                <p>Support the community and get a premium chip to award to your favorite artist immediately!</p>
                <strong>$1.99 USD</strong>
              </div>
            </div>
          )}

          <div className={styles.anonToggle}>
            <label>
              <input 
                type="checkbox" 
                checked={isAnonymous} 
                onChange={(e) => setIsAnonymous(e.target.checked)} 
              />
              Donate Anonymously
            </label>
          </div>

          {!isAnonymous && (
            <div className={styles.field}>
              <label>Display Nickname</label>
              <input 
                type="text" 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)} 
                placeholder="Enter a nickname"
                className={styles.textInput}
              />
            </div>
          )}
        </div>

        <div className={styles.paypalContainer}>
          <PayPalScriptProvider options={{ clientId: paypalClientId, components: "buttons", currency: "USD" }}>
            <PayPalButtons 
              style={{ layout: "vertical", shape: "pill" }}
              createOrder={handleCreateOrder}
              onApprove={handleApprove}
              onError={(err) => {
                console.error("PayPal Error:", err);
                toast.error("PayPal encountered an error. Please try again.");
              }}
            />
          </PayPalScriptProvider>
        </div>

        <div className={styles.actions}>
          <button className={styles.closeBtn} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
