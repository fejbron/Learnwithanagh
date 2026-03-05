import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export default function Toast({ msg, type }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        setVisible(true);
        return () => setVisible(false);
    }, []);

    return (
        <div className={`${styles.toast} ${styles[type]} ${visible ? styles.show : ''}`}>
            {type === 'success' && '✅ '}{type === 'error' && '❌ '}{type === 'info' && 'ℹ️ '}
            {msg}
        </div>
    );
}
