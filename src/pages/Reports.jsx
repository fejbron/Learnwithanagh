import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend,
} from 'chart.js';
import styles from './Reports.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (n) => 'GH₵ ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Reports() {
    const { sales, expenses } = useApp();

    const totalRevenue = useMemo(() => sales.reduce((a, s) => a + s.total, 0), [sales]);
    const totalExpenses = useMemo(() => expenses.reduce((a, e) => a + e.amount, 0), [expenses]);
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    const year = new Date().getFullYear();

    const monthlyData = useMemo(() => {
        const rev = Array(12).fill(0);
        const exp = Array(12).fill(0);
        sales.forEach(s => {
            const d = new Date(s.date);
            if (d.getFullYear() === year) rev[d.getMonth()] += s.total;
        });
        expenses.forEach(e => {
            const d = new Date(e.date);
            if (d.getFullYear() === year) exp[d.getMonth()] += e.amount;
        });
        return { rev, exp };
    }, [sales, expenses, year]);

    const categoryData = useMemo(() => {
        const m = { Toys: { revenue: 0, units: 0 }, Books: { revenue: 0, units: 0 }, Other: { revenue: 0, units: 0 } };
        sales.forEach(s => {
            const cat = s.category in m ? s.category : 'Other';
            m[cat].revenue += s.total;
            m[cat].units += s.qty;
        });
        return m;
    }, [sales]);

    const topProducts = useMemo(() => {
        const m = {};
        sales.forEach(s => {
            if (!m[s.productName]) m[s.productName] = { name: s.productName, revenue: 0, units: 0 };
            m[s.productName].revenue += s.total;
            m[s.productName].units += s.qty;
        });
        return Object.values(m).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [sales]);

    const chartData = {
        labels: MONTHS,
        datasets: [
            { label: 'Revenue', data: monthlyData.rev, backgroundColor: 'rgba(124,95,245,0.7)', borderColor: '#7c5ff5', borderWidth: 2, borderRadius: 5 },
            { label: 'Expenses', data: monthlyData.exp, backgroundColor: 'rgba(248,113,113,0.6)', borderColor: '#f87171', borderWidth: 2, borderRadius: 5 },
        ],
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#8b90b8', font: { family: 'Outfit' }, padding: 16 } },
            tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` } },
        },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b90b8', font: { family: 'Outfit' } } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8b90b8', font: { family: 'Outfit' }, callback: v => '$' + v } },
        },
    };

    const rankClass = (i) => [styles.rank1, styles.rank2, styles.rank3][i] || styles.rankOther;

    return (
        <div>
            <div className={styles.topGrid}>
                {/* P&L Summary */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}><h2>Profit &amp; Loss Summary</h2></div>
                    <div className={styles.pl}>
                        <div className={styles.plRow}><span className={styles.plLabel}>Total Revenue</span><span className={styles.pos}>{fmt(totalRevenue)}</span></div>
                        <div className={styles.plRow}><span className={styles.plLabel}>Total Expenses</span><span className={styles.neg}>-{fmt(totalExpenses)}</span></div>
                        <div className={`${styles.plRow} ${styles.plTotal}`}>
                            <span>Net Profit</span>
                            <span style={{ color: netProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{fmt(netProfit)}</span>
                        </div>
                        <div className={styles.plRow}><span className={styles.plLabel}>Profit Margin</span><span className={netProfit >= 0 ? styles.pos : styles.neg}>{margin}%</span></div>
                    </div>
                </div>

                {/* Top Products */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}><h2>Top Selling Products</h2></div>
                    <div className={styles.topList}>
                        {topProducts.length === 0 && <div className={styles.empty}>No sales data yet.</div>}
                        {topProducts.map((p, i) => (
                            <div key={p.name} className={styles.topItem}>
                                <div className={`${styles.rank} ${rankClass(i)}`}>{i + 1}</div>
                                <div className={styles.topName}>{p.name}</div>
                                <div>
                                    <div className={styles.topRev}>{fmt(p.revenue)}</div>
                                    <div className={styles.topUnits}>{p.units} units</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Performance Chart */}
            <div className={styles.card} style={{ marginBottom: 24 }}>
                <div className={styles.cardHeader}><h2>Monthly Performance ({year})</h2></div>
                <div className={styles.chartWrap}>
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Category Breakdown */}
            <div className={styles.card}>
                <div className={styles.cardHeader}><h2>Category Breakdown</h2></div>
                <div className={styles.catGrid}>
                    {[
                        { key: 'Toys', emoji: '🧸', color: 'var(--accent-purple-light)' },
                        { key: 'Books', emoji: '📚', color: 'var(--accent-cyan)' },
                        { key: 'Other', emoji: '🎁', color: 'var(--accent-orange)' },
                    ].map(c => (
                        <div key={c.key} className={styles.catCard}>
                            <span className={styles.catEmoji}>{c.emoji}</span>
                            <div className={styles.catName}>{c.key}</div>
                            <div className={styles.catValue} style={{ color: c.color }}>{fmt(categoryData[c.key].revenue)}</div>
                            <div className={styles.catUnits}>{categoryData[c.key].units} units sold</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
