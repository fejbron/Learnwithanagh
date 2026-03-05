import styles from './Sidebar.module.css';
import { NavLink } from 'react-router-dom';

const menuItems = [
    { path: '/', label: 'Dashboard', icon: '⊞' },
    { path: '/sales', label: 'Sales', icon: '🛒' },
    { path: '/products', label: 'Products', icon: '📦' },
];

const generalItems = [
    { path: '/expenses', label: 'Expenses', icon: '💸' },
    { path: '/reports', label: 'Reports', icon: '📈' },
];

export default function Sidebar({ open, onClose }) {
    return (
        <>
            {open && <div className={styles.overlay} onClick={onClose} />}
            <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
                {/* Brand */}
                <div className={styles.brand}>
                    <div className={styles.brandLogo}>🧸</div>
                    <span className={styles.brandName}>ToyBox</span>
                </div>

                {/* Menu section */}
                <div className={styles.sectionLabel}>MENU</div>
                <nav className={styles.nav}>
                    {menuItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                            onClick={onClose}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navLabel}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* General section */}
                <div className={styles.sectionLabel} style={{ marginTop: 24 }}>GENERAL</div>
                <nav className={styles.nav}>
                    {generalItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                            onClick={onClose}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navLabel}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Download promo card */}
                <div className={styles.promo}>
                    <div className={styles.promoIcon}>📲</div>
                    <p><strong>Download</strong> our Mobile App</p>
                    <p className={styles.promoSub}>Get easy in another way.</p>
                    <button className={styles.promoBtn}>Download</button>
                </div>
            </aside>
        </>
    );
}
