import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import styles from './PageShared.module.css';
import prodStyles from './Products.module.css';

const CATEGORIES = ['Toys', 'Books', 'Other'];
const EMOJIS = { Toys: '🧸', Books: '📚', Other: '🎁' };

const empty = { name: '', category: 'Toys', price: '', cost: '', stock: '', emoji: '🧸' };

const fmt = (n) => 'GH₵ ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Products() {
    const { products, addProduct, updateProduct, deleteProduct } = useApp();
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(empty);

    const filtered = useMemo(() => products
        .filter(p => !filterCat || p.category === filterCat)
        .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())),
        [products, search, filterCat]);

    function openAdd() { setForm({ ...empty }); setModal({ mode: 'add' }); }
    function openEdit(p) { setForm({ name: p.name, category: p.category, price: p.price, cost: p.cost, stock: p.stock, emoji: p.emoji }); setModal({ mode: 'edit', id: p.id }); }

    function handleSubmit(e) {
        e.preventDefault();
        const payload = { ...form, price: parseFloat(form.price), cost: parseFloat(form.cost), stock: parseInt(form.stock) };
        if (modal.mode === 'add') addProduct(payload);
        else updateProduct(modal.id, payload);
        setModal(null);
    }

    const catClass = { Toys: styles.catToys, Books: styles.catBooks, Other: styles.catOther };

    return (
        <div>
            <div className={styles.actions}>
                <div className={styles.searchBar}>
                    <span>🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." />
                </div>
                <select className={styles.selectMd} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <button className={styles.btnPrimary} onClick={openAdd}>+ Add Product</button>
            </div>

            <div className={prodStyles.grid}>
                {filtered.length === 0 && (
                    <div className={prodStyles.empty}>No products found. Add your first product!</div>
                )}
                {filtered.map(p => (
                    <div key={p.id} className={prodStyles.card}>
                        <span className={prodStyles.emoji}>{p.emoji}</span>
                        <div className={`${prodStyles.catBadge} ${catClass[p.category]}`}>{p.category}</div>
                        <div className={prodStyles.name}>{p.name}</div>
                        <div className={prodStyles.price}>{fmt(p.price)}</div>
                        <div className={prodStyles.meta}>
                            <span className={prodStyles.stock}>Stock: {p.stock}</span>
                            <span className={prodStyles.cost}>Cost: {fmt(p.cost)}</span>
                        </div>
                        <div className={prodStyles.margin}>
                            Margin: <strong style={{ color: 'var(--accent-green)' }}>{p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(0) : 0}%</strong>
                        </div>
                        <div className={prodStyles.actions}>
                            <button className={`${styles.btnOutline} ${styles.btnOutline}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(p)}>✏️ Edit</button>
                            <button className={prodStyles.delBtn} onClick={() => deleteProduct(p.id)}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            {modal && (
                <Modal title={modal.mode === 'add' ? '📦 Add Product' : '✏️ Edit Product'} onClose={() => setModal(null)}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGrid}>
                            <div className={`${styles.formGroup} ${styles.full}`}>
                                <label className={styles.label}>Product Name</label>
                                <input className={styles.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. LEGO City Set" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Category</label>
                                <select className={styles.input} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, emoji: EMOJIS[e.target.value] }))}>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Emoji Icon</label>
                                <input className={styles.input} value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🧸" maxLength={2} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Selling Price</label>
                                <span style={{ position: 'absolute', left: 14, top: 41, color: 'var(--text-muted)' }}>GH₵</span>
                                <input required className={styles.input} style={{ paddingLeft: 50 }} type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Cost Price</label>
                                <span style={{ position: 'absolute', left: 14, top: 41, color: 'var(--text-muted)' }}>GH₵</span>
                                <input required className={styles.input} style={{ paddingLeft: 50 }} type="number" step="0.01" min="0" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
                            </div>
                            <div className={`${styles.formGroup} ${styles.full}`}>
                                <label className={styles.label}>Stock Quantity</label>
                                <input type="number" min="0" className={styles.input} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <button type="button" className={styles.btnOutline} onClick={() => setModal(null)}>Cancel</button>
                            <button type="submit" className={styles.btnPrimary}>{modal.mode === 'add' ? 'Add Product' : 'Save Changes'}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
