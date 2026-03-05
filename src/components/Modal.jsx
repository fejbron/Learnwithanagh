import styles from './Modal.module.css';
import { useEffect } from 'react';

export default function Modal({ title, children, onClose }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                    <button className={styles.close} onClick={onClose}>✕</button>
                </div>
                <div className={styles.body}>{children}</div>
            </div>
        </div>
    );
}
