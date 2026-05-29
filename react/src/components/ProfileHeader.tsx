import React from "react";
import styles from "./ProfileHeader.module.css";

interface ProfileHeaderProps {
  userCount?: number;
  munchingCount?: number;
  photoCount?: number;
  coverImages?: string[];
  currentPath?: string;
}

export default function ProfileHeader({
  userCount = 0,
  munchingCount = 0,
  photoCount = 0,
  coverImages = [],
  currentPath = "/",
}: ProfileHeaderProps) {
  const strapiUrl = import.meta.env.PUBLIC_STRAPI_URL || import.meta.env.STRAPI_URL || "http://127.0.0.1:1337"; // Match environment default
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
                <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
                  <h1 className={styles.name}>Photorium</h1>
                </a>
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
          <a href="/" className={`${styles.navLink} ${currentPath === "/" ? styles.active : ""}`}>
            Galleries
          </a>
          <a href="/hash-brown-hub" className={`${styles.navLink} ${currentPath === "/hash-brown-hub" ? styles.active : ""}`}>
            Hash Brown Hub
          </a>
          <a href="/dashboard" className={`${styles.navLink} ${currentPath === "/dashboard" ? styles.active : ""}`}>
            Your Stash
          </a>
        </div>
      </div>
    </div>
  );
}
