import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Toast from './Toast';
import { useApp } from '../context/AppContext';
import styles from './Layout.module.css';

const pageTitles = {
    '/': { title: 'Dashboard', sub: 'Track and manage your toy & book sales.' },
    '/sales': { title: 'Sales', sub: 'Record and review all your transactions.' },
    '/products': { title: 'Products', sub: 'Manage your catalog of toys, books and more.' },
    '/expenses': { title: 'Expenses', sub: 'Track your business costs and outgoings.' },
    '/reports': { title: 'Reports', sub: 'Insights and performance summaries.' },
};

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useApp();
    const location = useLocation();
    const info = pageTitles[location.pathname] || pageTitles['/'];

    return (
        <div className={styles.layout}>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className={styles.mainContent}>
                {/* Topbar */}
                <header className={styles.topbar}>
                    <div className={styles.topbarLeft}>
                        <button className={styles.menuBtn} onClick={() => setSidebarOpen(o => !o)}>☰</button>
                        <div className={styles.searchWrap}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input className={styles.searchInput} placeholder="Search…" />
                            <span className={styles.searchKbd}>⌘F</span>
                        </div>
                    </div>
                    <div className={styles.topbarRight}>
                        <button className={styles.iconBtn}>✉️</button>
                        <button className={styles.iconBtn}>🔔</button>
                        <div className={styles.userChip}>
                            <div className={styles.userAvatar}>A</div>
                            <div className={styles.userText}>
                                <span className={styles.userName}>Admin</span>
                                <span className={styles.userEmail}>admin@toybox.com</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page area */}
                <main className={styles.pageArea}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h1 className={styles.pageTitle}>{info.title}</h1>
                            <p className={styles.pageSub}>{info.sub}</p>
                        </div>
                    </div>
                    <Outlet />
                </main>
            </div>
            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
    );
}
