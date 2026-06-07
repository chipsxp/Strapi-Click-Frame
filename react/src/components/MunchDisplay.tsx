import React from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import styles from './PhotoGrid.module.css'; // Reuse existing styles for consistency

interface MunchDisplayProps {
  photoId: string;
  initialClassicCount: number;
  initialCheddarCount: number;
  isOwner: boolean;
}

export default function MunchDisplay({ photoId, initialClassicCount, initialCheddarCount, isOwner }: MunchDisplayProps) {
  const [classicCount, setClassicCount] = React.useState(initialClassicCount);
  const [cheddarCount, setCheddarCount] = React.useState(initialCheddarCount);
  const [errorModal, setErrorModal] = React.useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  const handleMunch = async (type: 'classic' | 'cheddar') => {
    if (isOwner) {
       toast.error("You can't munch your own art! Tastes like ego. 🤡");
       return;
    }

    // Play crunch sound
    const audio = new Audio('/sfx/crunch.mp3');
    audio.play().catch(() => {});

    // Optimistic UI update
    if (type === 'classic') setClassicCount(prev => prev + 1);
    else setCheddarCount(prev => prev + 1);

    const toastId = toast.loading(`Munching...`);

    try {
      const response = await fetch('/api/give-chip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, type }),
      });

      if (response.status === 401) {
        toast.error('Log in to munch art! 🍟', { id: toastId });
        setClassicCount(initialClassicCount);
        setCheddarCount(initialCheddarCount);
        return;
      }

      if (!response.ok) {
        const err = await response.json();
        setErrorModal({ show: true, message: err.error || 'Munch failed' });
        toast.dismiss(toastId);
        setClassicCount(initialClassicCount);
        setCheddarCount(initialCheddarCount);
      } else {
        toast.success(`You gave a ${type} munch!`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Munch failed.', { id: toastId });
      setClassicCount(initialClassicCount);
      setCheddarCount(initialCheddarCount);
    }
  };

  return (
    <div className={styles.munchControls} style={{ position: 'static', opacity: 1, pointerEvents: 'auto', background: 'transparent', padding: 0 }}>
      <Modal 
        isOpen={errorModal.show}
        onClose={() => setErrorModal({ show: false, message: '' })}
        title="Hold on!"
        message={errorModal.message}
        type="alert"
        confirmText="Got it"
      />

      <button 
        className={`${styles.munchBtn} ${styles.classic}`}
        onClick={() => handleMunch('classic')}
        title={isOwner ? "Your classic munches" : "Give a Classic Munch"}
        style={{ cursor: isOwner ? 'default' : 'pointer' }}
      >
        <span className={styles.chipIcon}>🍟</span>
        <span className={styles.count}>{classicCount}</span>
      </button>
      
      <button 
        className={`${styles.munchBtn} ${styles.cheddar}`}
        onClick={() => handleMunch('cheddar')}
        title={isOwner ? "Your cheddar munches" : "Give a Cheddar Munch"}
        style={{ cursor: isOwner ? 'default' : 'pointer' }}
      >
        <span className={styles.chipIcon}>🧀</span>
        <span className={styles.count}>{cheddarCount}</span>
      </button>
    </div>
  );
}
