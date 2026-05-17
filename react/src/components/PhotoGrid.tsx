import React from 'react';
import type { StrapiPhoto } from '../types/strapi';
import styles from './PhotoGrid.module.css';
import toast from 'react-hot-toast';

interface Props {
  photos: StrapiPhoto[];
}

export default function PhotoGrid({ photos }: Props) {
  const [localPhotos, setLocalPhotos] = React.useState(photos);
  const [errorModal, setErrorModal] = React.useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  const handleMunch = async (photoId: string, type: 'classic' | 'cheddar') => {
    // Play crunch sound only if it exists (silent fail)
    const audio = new Audio('/sfx/crunch.mp3');
    audio.play().catch(() => {
      // Audio not found or blocked, ignore
    });

    // Optimistic UI update
    setLocalPhotos(prev => prev.map(p => {
      if (p.documentId === photoId) {
        return {
          ...p,
          classic_munch_count: type === 'classic' ? (p.classic_munch_count || 0) + 1 : p.classic_munch_count,
          cheddar_munch_count: type === 'cheddar' ? (p.cheddar_munch_count || 0) + 1 : p.cheddar_munch_count
        };
      }
      return p;
    }));

    const toastId = toast.loading(`Munching...`);

    // Trigger API call
    try {
      const response = await fetch('/api/give-chip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, type }),
      });

      if (response.status === 401) {
        toast.error('Log in to munch art! 🍟', { id: toastId });
        setLocalPhotos(photos);
        return;
      }

      if (!response.ok) {
        const err = await response.json();
        const msg = err.error || 'Munch failed';

        // Show prominent Alert Panel for these specific errors
        setErrorModal({ show: true, message: msg });

        toast.dismiss(toastId);
        setLocalPhotos(photos);
      } else {
        toast.success(`You gave a ${type} munch!`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Munch failed.', { id: toastId });
      setLocalPhotos(photos);
    }
  };

  const getImageUrl = (photo: StrapiPhoto) => {
    if (photo.ik_url) return photo.ik_url;

    // Defensive check for Strapi 5 media response
    const imgData = photo.image;
    if (imgData) {
      const url = imgData.url || imgData.data?.attributes?.url;
      if (url) {
        return url.startsWith('http') ? url : `http://localhost:1337${url}`;
      }
    }
    return '/favicon.png';
  };

  return (
    <div className={styles.gridContainer}>
      {/* Error Modal (Alert Panel) */}
      {errorModal.show && (
        <div className={styles.modalBackdrop} onClick={() => setErrorModal({ show: false, message: '' })}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.errorIcon}>🚫</div>
            <h2 className={styles.errorTitle}>Hold on!</h2>
            <p className={styles.errorMessage}>{errorModal.message}</p>
            <button 
              className={styles.closeBtn} 
              onClick={() => setErrorModal({ show: false, message: '' })}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className={styles.masonry}>        {localPhotos.map((photo, index) => (
          <div 
            key={photo.documentId} 
            className={styles.item}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={styles.card}>
              {/* Primary Link: Wraps the whole card area */}
              <a href={`/photo/${photo.documentId}`} className={styles.mainLink}>
                <img 
                  src={getImageUrl(photo)} 
                  alt={photo.title}
                  loading="lazy"
                />
                
                <div className={styles.overlay}>
                  <div className={styles.overlayTop}>
                    <h3 className={styles.title}>{photo.title}</h3>
                    <p className={styles.author}>by 
                      <object>
                        <a 
                          href={`/artist/${encodeURIComponent(photo.author?.username || '')}`} 
                          className={styles.authorLink}
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          {photo.author?.username || 'Anonymous'}
                        </a>
                      </object>
                    </p>
                  </div>

                  <div className={styles.munchControls}>
                    <button 
                      className={`${styles.munchBtn} ${styles.classic}`}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMunch(photo.documentId, 'classic'); }}
                      title="Give a Classic Munch"
                    >
                      <span className={styles.chipIcon}>🍟</span>
                      <span className={styles.count}>{photo.classic_munch_count || 0}</span>
                    </button>
                    
                    <button 
                      className={`${styles.munchBtn} ${styles.cheddar}`}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMunch(photo.documentId, 'cheddar'); }}
                      title="Give a Cheddar Munch"
                    >
                      <span className={styles.chipIcon}>🧀</span>
                      <span className={styles.count}>{photo.cheddar_munch_count || 0}</span>
                    </button>
                  </div>
                </div>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
