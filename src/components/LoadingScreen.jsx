import styles from './LoadingScreen.module.css';

export function LoadingScreen() {
    return (
        <div className={styles.wrap}>
            <div className={styles.spinner} />
            <p className={styles.text}>Loading ToyBox Finance…</p>
        </div>
    );
}

export function SetupBanner({ message }) {
    const isNotConfigured = message === 'notConfigured';
    return (
        <div className={styles.bannerWrap}>
            <div className={styles.banner}>
                <div className={styles.bannerIcon}>{isNotConfigured ? '🔧' : '⚠️'}</div>
                <div>
                    <div className={styles.bannerTitle}>
                        {isNotConfigured ? 'Supabase Not Configured' : 'Database Connection Error'}
                    </div>
                    <div className={styles.bannerMsg}>
                        {isNotConfigured ? (
                            <>
                                Create a <code>.env</code> file in your project root with your Supabase credentials:
                                <pre className={styles.pre}>{`VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=your_anon_key`}</pre>
                                Then run the SQL in <code>supabase/schema.sql</code> in your Supabase SQL editor and restart the dev server.
                            </>
                        ) : (
                            message
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
