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
      try {
        const strapiUrl = import.meta.env.PUBLIC_STRAPI_URL || import.meta.env.STRAPI_URL || "http://127.0.0.1:1337"; // Using IP to avoid resolution issues
        const followingIds = user.following?.map((u: any) => u.id) || [];
        
        if (followingIds.length === 0) return;

        const params = new URLSearchParams();
        followingIds.forEach((id: number, index: number) => {
          params.append(`filters[author][id][$in][${index}]`, id.toString());
        });
        params.append('sort', 'createdAt:desc');
        params.append('pagination[limit]', '1');

        const res = await fetch(`${strapiUrl}/api/photos?${params.toString()}`);
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
    // Check every 5 minutes
    const interval = setInterval(checkNewArt, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
            <a href="/dashboard" className={styles.navLink}>
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
