import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { useApp } from '../context/AppContext';
import styles from './Dashboard.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function categoryBadge(cat) {
    const map = { Toys: 'toys', Books: 'books', Other: 'other' };
    return <span className={`${styles.badge} ${styles['badge_' + (map[cat] || 'other')]}`}>{cat}</span>;
}
function statusBadge(s) {
    const map = { Completed: 'completed', Pending: 'pending', Refunded: 'refunded' };
    return <span className={`${styles.badge} ${styles['badge_' + (map[s] || 'other')]}`}>{s}</span>;
}

function StatCard({ label, value, change, changeType = 'positive', hero = false, to }) {
    return (
        <div className={`${styles.statCard} ${hero ? styles.hero : ''}`}>
            <div className={styles.statTopRow}>
                <span className={styles.statLabel}>{label}</span>
                <Link to={to || '/'} className={styles.statArrow}>↗</Link>
            </div>
            <div className={styles.statValue}>{value}</div>
            {change && (
                <span className={`${styles.statChange} ${hero ? '' : styles[changeType]}`}>
                    ↑ {change}
                </span>
            )}
        </div>
    );
}

export default function Dashboard() {
    const { sales, expenses } = useApp();

    const totalRevenue = useMemo(() => sales.reduce((a, s) => a + s.total, 0), [sales]);
    const totalExpenses = useMemo(() => expenses.reduce((a, e) => a + e.amount, 0), [expenses]);
    const netProfit = totalRevenue - totalExpenses;
    const unitsSold = useMemo(() => sales.reduce((a, s) => a + s.qty, 0), [sales]);
    const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    const year = new Date().getFullYear();

    const monthlyRevenue = useMemo(() => {
        const arr = Array(12).fill(0);
        sales.forEach(s => {
            const d = new Date(s.date);
            if (d.getFullYear() === year) arr[d.getMonth()] += s.total;
        });
        return arr;
    }, [sales, year]);

    const categoryTotals = useMemo(() => {
        const m = { Toys: 0, Books: 0, Other: 0 };
        sales.forEach(s => { m[s.category] = (m[s.category] || 0) + s.total; });
        return m;
    }, [sales]);

    const recentSales = useMemo(() =>
        [...sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6),
        [sales]);

    const barData = {
        labels: MONTHS,
        datasets: [{
            label: 'Revenue',
            data: monthlyRevenue,
            backgroundColor: (ctx) => {
                const max = Math.max(...monthlyRevenue);
                return ctx.raw === max ? '#1b3a2f' : '#d8f3dc';
            },
            borderRadius: 8, borderSkipped: false,
        }],
    };

    const barOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmt(ctx.raw) } } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { family: 'Outfit', size: 12 } } },
            y: { grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af', font: { family: 'Outfit', size: 12 }, callback: v => '$' + v } },
        },
    };

    const doughnutData = {
        labels: ['Toys 🧸', 'Books 📚', 'Other 🎁'],
        datasets: [{
            data: [categoryTotals.Toys, categoryTotals.Books, categoryTotals.Other],
            backgroundColor: ['#1b3a2f', '#52b788', '#d8f3dc'],
            borderColor: ['#1b3a2f', '#52b788', '#b7e4c7'],
            borderWidth: 2, hoverOffset: 6,
        }],
    };

    const doughnutOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#6b7280', font: { family: 'Outfit', size: 12 }, padding: 14 } },
            tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.raw)}` } },
        },
    };

    return (
        <div>
            {/* Stats — first card is the green hero */}
            <div className={styles.statsGrid}>
                <StatCard hero label="Total Revenue" value={fmt(totalRevenue)} change="Increased from last month" to="/reports" />
                <StatCard label="Total Expenses" value={fmt(totalExpenses)} change="Increased from last month" changeType="negative" to="/expenses" />
                <StatCard label="Net Profit" value={fmt(netProfit)} change={`${margin}% margin`} changeType={netProfit >= 0 ? 'positive' : 'negative'} to="/reports" />
                <StatCard label="Units Sold" value={unitsSold} change="All time" changeType="neutral" to="/sales" />
            </div>

            {/* Charts */}
            <div className={styles.chartsGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}><h2>Sales Analytics ({year})</h2></div>
                    <div className={styles.chartWrap}><Bar data={barData} options={barOptions} /></div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardHeader}><h2>Category Split</h2></div>
                    <div className={styles.chartWrapDonut}><Doughnut data={doughnutData} options={doughnutOptions} /></div>
                </div>
            </div>

            {/* Recent sales */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2>Recent Transactions</h2>
                    <Link to="/sales" className={styles.linkBtn}>View All →</Link>
                </div>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr><th>Date</th><th>Product</th><th>Category</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {recentSales.length === 0
                                ? <tr><td colSpan={7} className={styles.emptyRow}>No sales yet. Go to Sales to add one!</td></tr>
                                : recentSales.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.date}</td>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.productName}</td>
                                        <td>{categoryBadge(s.category)}</td>
                                        <td>{s.qty}</td>
                                        <td>{fmt(s.unitPrice)}</td>
                                        <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{fmt(s.total)}</td>
                                        <td>{statusBadge(s.status)}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
