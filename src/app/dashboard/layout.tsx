'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { logoutUser, selectUser, selectIsAuthLoading } from '@/lib/features/auth/authSlice';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const isLoadingAuth = useSelector(selectIsAuthLoading);

  // Check if viewport is mobile on initial load and when window resizes
  useEffect(() => {
    // Set sidebar collapsed by default on mobile
    if (window.innerWidth <= 768) {
      setSidebarCollapsed(true);
    }

    // Function to handle window resize
    const handleResize = () => {
      // Auto-collapse sidebar on mobile devices
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // We rely on fetchUser being dispatched in RootLayout.
    // If still loading, wait. If not loading and no user, redirect.
    if (!isLoadingAuth && !user) {
      router.push('/auth?mode=login&redirect=/dashboard'); // Added redirect query
    }
  }, [isLoadingAuth, user, router]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap(); // unwrap to catch potential rejections
      router.push('/auth');
    } catch (error) {
      console.error("Logout failed in layout:", error);
      // Optionally show an error message to the user, e.g., via a local state or a notification system
    }
  };

  // isLoadingAuth will be true initially due to fetchUser, then false.
  // If after loading there's no user, the useEffect above will redirect.
  // So, we can show loading screen while isLoadingAuth is true AND there's no user yet.
  // Or if fetchUser has completed and there's still no user (already handled by redirect).
  if (isLoadingAuth && !user) {
    return <div className={styles.loadingScreen}>Loading dashboard...</div>;
  }

  // If not loading and still no user, it means redirect should have happened.
  // As a safeguard, return null, but this should be rare.
  if (!isLoadingAuth && !user) {
    return null;
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <button className={styles.toggleButton} onClick={toggleSidebar} aria-label="Toggle sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <Link href="/dashboard" className={styles.logo}>
          Teacherly
        </Link>
      </header>

      <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarSectionTitle}>MAIN</h3>
            <nav className={styles.sidebarNav}>
              <Link href="/dashboard" className={`${styles.navItem} ${isActive('/dashboard') && !isActive('/dashboard/generation-hub') && !isActive('/dashboard/students') && !isActive('/dashboard/grades') ? styles.active : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Home</span>
              </Link>
              <Link href="/dashboard/generation-hub" className={`${styles.navItem} ${isActive('/dashboard/generation-hub') ? styles.active : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>Generation Hub</span>
              </Link>
              <Link href="/dashboard/students" className={`${styles.navItem} ${isActive('/dashboard/students') ? styles.active : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Students</span>
              </Link>
              <Link href="/dashboard/grades" className={`${styles.navItem} ${isActive('/dashboard/grades') ? styles.active : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>Grades and Attendance</span>
              </Link>
            </nav>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarSectionTitle}>SETTINGS</h3>
            <nav className={styles.sidebarNav}>
              <Link href="/dashboard/settings" className={`${styles.navItem} ${isActive('/dashboard/settings') ? styles.active : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span>Settings</span>
              </Link>
            </nav>
          </div>
        </div>

        <footer className={styles.sidebarFooter}>
          <Link href="/dashboard/help" className={`${styles.navItem} ${isActive('/dashboard/help') ? styles.active : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Help</span>
          </Link>
          <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutButton}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout Account</span>
          </button>
        </footer>
      </aside>

      <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expandedContent : ''}`}>
        {children}
      </main>
    </div>
  );
}
