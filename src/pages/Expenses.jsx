import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import styles from './PageShared.module.css';

const CATEGORIES = ['Rent', 'Inventory', 'Utilities', 'Marketing', 'Salaries', 'Shipping', 'Other'];
const empty = { date: '', description: '', category: 'Inventory', amount: '' };
const fmt = (n) => 'GH₵ ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Expenses() {
    const { expenses, addExpense, updateExpense, deleteExpense } = useApp();
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(empty);

    const filtered = useMemo(() => expenses
        .filter(e => !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
        [expenses, search]);

    const total = useMemo(() => expenses.reduce((a, e) => a + e.amount, 0), [expenses]);

    function openAdd() { setForm({ ...empty, date: new Date().toISOString().slice(0, 10) }); setModal({ mode: 'add' }); }
    function openEdit(e) { setForm({ date: e.date, description: e.description, category: e.category, amount: e.amount }); setModal({ mode: 'edit', id: e.id }); }

    function handleSubmit(ev) {
        ev.preventDefault();
        const payload = { ...form, amount: parseFloat(form.amount) };
        if (modal.mode === 'add') addExpense(payload);
        else updateExpense(modal.id, payload);
        setModal(null);
    }

    return (
        <div>
            <div className={styles.actions}>
                <div className={styles.searchBar}>
                    <span>🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..." />
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Total: <strong style={{ color: 'var(--accent-red)', fontSize: '18px' }}>{fmt(total)}</strong>
                </div>
                <button className={styles.btnPrimary} onClick={openAdd}>+ Add Expense</button>
            </div>

            <div className={styles.card}>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0
                                ? <tr><td colSpan={5} className={styles.emptyRow}>No expenses found.</td></tr>
                                : filtered.map(e => (
                                    <tr key={e.id}>
                                        <td>{e.date}</td>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{e.description}</td>
                                        <td><span className={styles.badge} style={{ background: 'rgba(255,159,74,.12)', color: 'var(--accent-orange)' }}>{e.category}</span></td>
                                        <td style={{ color: 'var(--accent-red)', fontWeight: 700 }}>{fmt(e.amount)}</td>
                                        <td>
                                            <div className={styles.rowActions}>
                                                <button className={`${styles.iconBtn} ${styles.edit}`} onClick={() => openEdit(e)}>✏️</button>
                                                <button className={`${styles.iconBtn} ${styles.del}`} onClick={() => deleteExpense(e.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <Modal title={modal.mode === 'add' ? '💸 Add Expense' : '✏️ Edit Expense'} onClose={() => setModal(null)}>
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
                                <label className={styles.label}>Description</label>
                                <input className={styles.input} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Monthly stock purchase" required />
                            </div>
                            <div className={`${styles.formGroup} ${styles.full}`}>
                                <span style={{ position: 'absolute', left: 14, top: 11, color: 'var(--text-muted)' }}>GH₵</span>
                                <input required className={styles.input} style={{ paddingLeft: 50 }} type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <button type="button" className={styles.btnOutline} onClick={() => setModal(null)}>Cancel</button>
                            <button type="submit" className={styles.btnPrimary}>{modal.mode === 'add' ? 'Add Expense' : 'Save Changes'}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
