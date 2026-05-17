import React from "react";
import styles from "./ProfileHeader.module.css";

interface ProfileHeaderProps {
  userCount?: number;
  munchingCount?: number;
  photoCount?: number;
  coverImages?: string[];
}

export default function ProfileHeader({
  userCount = 1,
  munchingCount = 0,
  photoCount = 0,
  coverImages = [],
}: ProfileHeaderProps) {
  const strapiUrl = "http://127.0.0.1:1337"; // Match environment default
  const coverUrl =
    coverImages.length > 0
      ? coverImages[0].startsWith("http")
        ? coverImages[0]
        : `${strapiUrl}${coverImages[0]}`
      : "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className={styles.container}>
      <div className={styles.cover}>
        <img src={coverUrl} alt="Cover" className={styles.coverImg} />

        <div className={styles.overlay}>
          <div className={styles.profileInfo}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>
                <span className={styles.potatoChip}></span>
                <span className={styles.cheddarChip}></span>
              </div>
            </div>
            <div className={styles.details}>
              <div className={styles.nameRow}>
                <h1 className={styles.name}>Photorium</h1>
                <a href="/signup" className={styles.followBtn}>
                  Sign Up
                </a>
              </div>
              <div className={styles.statsRow}>
                <span className={styles.username}>Photorium</span>
                <span className={styles.stat}>
                  {userCount.toLocaleString()} Members
                </span>
                <span className={styles.dot}>•</span>
                <span className={styles.stat}>
                  {munchingCount.toLocaleString()} Munching
                </span>
              </div>
            </div>
          </div>
          <div className={styles.rightStats}>
            <span>{photoCount.toLocaleString()} Photos</span>
          </div>
        </div>
      </div>

      <div className={styles.navBar}>
        <div className={styles.navLinks}>
          <a href="/" className={`${styles.navLink} ${styles.active}`}>
            Galleries
          </a>
          <a href="/dashboard" className={styles.navLink}>
            Your Stash
          </a>
          <a href="#about" className={styles.navLink}>
            About
          </a>
        </div>
      </div>
    </div>
  );
}
