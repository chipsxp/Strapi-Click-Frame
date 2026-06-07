import React, { useState, useEffect } from "react";
import type { StrapiUser, StrapiPhoto } from "../types/strapi";
import styles from "./Navbar.module.css";

interface Props {
  user?: StrapiUser | null;
}

export default function Navbar({ user }: Props) {
  const [query, setQuery] = useState("");
  const [hasNewArt, setHasNewArt] = useState(false);

  useEffect(() => {
    if (!user || !user.following || user.following.length === 0) return;

    const checkNewArt = async () => {
      // API SAVER: Don't poll if tab is hidden
      if (document.hidden) return;

      // If we are on the dashboard, we are viewing the feed. 
      // Update the timestamp and hide the dot.
      if (window.location.pathname === '/dashboard') {
        localStorage.setItem('lastViewedFollowingFeed', new Date().toISOString());
        setHasNewArt(false);
        return;
      }

      try {
        if (!user.following || user.following.length === 0) return;

        const res = await fetch(`/api/notifications`);
        if (!res.ok) return;

        const json = await res.json();
        const latestPhoto: StrapiPhoto = json.data?.[0];

        if (latestPhoto) {
          const lastViewed = localStorage.getItem('lastViewedFollowingFeed');
          if (!lastViewed || new Date(latestPhoto.createdAt) > new Date(lastViewed)) {
            setHasNewArt(true);
          }
        }
      } catch (err) {
        console.error("Failed to check for new art:", err);
      }
    };

    checkNewArt();
    // API SAVER: Increased to 15 minutes and added visibility listener
    const interval = setInterval(checkNewArt, 15 * 60 * 1000);
    
    const handleVisibility = () => {
      if (!document.hidden) checkNewArt();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user]);

  const handleSearch = (e: SubmitEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <a href="/" className={styles.logo}>
          <div className={styles.chips}>
            {user && (
              <span className={styles.chipCount}>
                {user.classic_munch_given_total || 0}
              </span>
            )}
            <span
              className={styles.potatoChip}
              title="Classic Chips Given"
            ></span>
            {user && (
              <span className={styles.chipCount}>
                {user.cheddar_munch_balance || 0}
              </span>
            )}
            <span
              className={styles.cheddarChip}
              title="Cheddar Chips Available"
            ></span>
          </div>
          <span className={styles.logotext}>Photorium</span>
        </a>
        <button
          className={`${styles.themeSwitch} ${styles.mobileThemeSwitch}`}
          title="Toggle Theme"
          onClick={toggleTheme}
        >
          🌓
        </button>
      </div>
      <div className={styles.center}>
        <form className={styles.searchContainer} onSubmit={(e) => handleSearch(e as unknown as SubmitEvent)}>
          <button type="submit" className={styles.searchIconBtn}>
            <span className={styles.searchIcon}>🔍</span>
          </button>
          <input
            type="text"
            placeholder="Photos, people, or groups"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        <button
          className={`${styles.themeSwitch} ${styles.desktopThemeSwitch}`}
          title="Toggle Theme"
          onClick={toggleTheme}
        >
          🌓
        </button>
        <div className={styles.notificationWrapper}>
          {user ? (
            <a 
              href="/dashboard" 
              className={styles.navLink}
              onClick={() => {
                localStorage.setItem('lastViewedFollowingFeed', new Date().toISOString());
                setHasNewArt(false);
              }}
            >
              Dashboard
            </a>
          ) : (
            <a href="/login" className={styles.navLink}>
              Log In
            </a>
          )}
          {hasNewArt && <span className={styles.notificationDot} title="New art from artists you follow!"></span>}
        </div>
        {!user && (
          <a href="/signup" className={styles.signupBtn}>
            Sign Up
          </a>
        )}
      </div>
      <div className={styles.right}>
        {/* Placeholder for future right-side items */}
      </div>
    </nav>
  );
}

