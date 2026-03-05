import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import styles from './PageShared.module.css';

const STATUSES = ['Completed', 'Pending', 'Refunded'];
const CATEGORIES = ['Toys', 'Books', 'Other'];

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const empty = { date: '', productName: '', category: 'Toys', qty: 1, unitPrice: '', status: 'Completed' };

export default function Sales() {
    const { sales, products, addSale, updateSale, deleteSale } = useApp();
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data }
    const [form, setForm] = useState(empty);

    const filtered = useMemo(() => {
        return sales
            .filter(s => (!filterCat || s.category === filterCat))
            .filter(s => !search || s.productName.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [sales, search, filterCat]);

    function openAdd() {
        setForm({ ...empty, date: new Date().toISOString().slice(0, 10) });
        setModal({ mode: 'add' });
    }

    function openEdit(s) {
        setForm({ date: s.date, productName: s.productName, category: s.category, qty: s.qty, unitPrice: s.unitPrice, status: s.status });
        setModal({ mode: 'edit', id: s.id });
    }

    function onProductChange(e) {
        const name = e.target.value;
        const prod = products.find(p => p.name === name);
        setForm(f => ({ ...f, productName: name, category: prod?.category || f.category, unitPrice: prod?.price || f.unitPrice }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        const total = parseFloat(form.qty) * parseFloat(form.unitPrice);
        const payload = { ...form, qty: parseInt(form.qty), unitPrice: parseFloat(form.unitPrice), total };
        if (modal.mode === 'add') addSale(payload);
        else updateSale(modal.id, payload);
        setModal(null);
    }

    const catBadge = (cat) => {
        const map = { Toys: 'toys', Books: 'books', Other: 'other' };
        return <span className={`${styles.badge} ${styles['badge_' + (map[cat] || 'other')]}`}>{cat}</span>;
    };
    const statusBadge = (s) => {
        const map = { Completed: 'completed', Pending: 'pending', Refunded: 'refunded' };
        return <span className={`${styles.badge} ${styles['badge_' + (map[s] || 'other')]}`}>{s}</span>;
    };

    return (
        <div>
            <div className={styles.actions}>
                <div className={styles.searchBar}>
                    <span>🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sales..." />
                </div>
                <select className={styles.selectMd} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <button className={styles.btnPrimary} onClick={openAdd}>+ Add Sale</button>
            </div>

            <div className={styles.card}>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr><th>Date</th><th>Product</th><th>Category</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0
                                ? <tr><td colSpan={8} className={styles.emptyRow}>No sales found.</td></tr>
                                : filtered.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.date}</td>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.productName}</td>
                                        <td>{catBadge(s.category)}</td>
                                        <td>{s.qty}</td>
                                        <td>{fmt(s.unitPrice)}</td>
                                        <td style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{fmt(s.total)}</td>
                                        <td>{statusBadge(s.status)}</td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <button className={`${styles.iconBtn} ${styles.edit}`} onClick={() => openEdit(s)} title="Edit">✏️</button>
                                                <button className={`${styles.iconBtn} ${styles.del}`} onClick={() => deleteSale(s.id)} title="Delete">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <Modal title={modal.mode === 'add' ? '🛒 Record New Sale' : '✏️ Edit Sale'} onClose={() => setModal(null)}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Date</label>
                                <input type="date" className={styles.input} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category</label>
                                <select className={styles.input} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className={`${styles.formGroup} ${styles.full}`}>
                                <label className={styles.label}>Product Name</label>
                                <input className={styles.input} list="products-list" value={form.productName} onChange={onProductChange} placeholder="Select or type product name" required />
                                <datalist id="products-list">
                                    {products.map(p => <option key={p.id} value={p.name} />)}
                                </datalist>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Quantity</label>
                                <input type="number" min="1" className={styles.input} value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Unit Price ($)</label>
                                <input type="number" step="0.01" min="0" className={styles.input} value={form.unitPrice} onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Status</label>
                                <select className={styles.input} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className={`${styles.formGroup} ${styles.full}`}>
                                <div className={styles.totalPreview}>
                                    Total: <strong style={{ color: 'var(--accent-green)' }}>{fmt((parseFloat(form.qty) || 0) * (parseFloat(form.unitPrice) || 0))}</strong>
                                </div>
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <button type="button" className={styles.btnOutline} onClick={() => setModal(null)}>Cancel</button>
                            <button type="submit" className={styles.btnPrimary}>{modal.mode === 'add' ? 'Record Sale' : 'Save Changes'}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
