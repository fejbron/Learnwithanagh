import React, {
    createContext, useContext, useState,
    useEffect, useCallback, useRef,
} from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

/* ---- column mapping (DB uses snake_case) -------------------------------- */
const toSale = (row) => ({
    id: row.id,
    date: row.date,
    productName: row.product_name,
    category: row.category,
    qty: row.qty,
    unitPrice: row.unit_price,
    total: row.total,
    status: row.status,
});

const fromSale = (s) => ({
    date: s.date,
    product_name: s.productName,
    category: s.category,
    qty: s.qty,
    unit_price: s.unitPrice,
    total: s.total,
    status: s.status,
});

const toProduct = (row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    cost: row.cost,
    stock: row.stock,
    emoji: row.emoji,
});

const toExpense = (row) => ({
    id: row.id,
    date: row.date,
    description: row.description,
    category: row.category,
    amount: row.amount,
});

/* ---- provider ----------------------------------------------------------- */
export function AppProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState(null);   // connection-level error
    const [toast, setToast] = useState(null);
    const configured = useRef(
        import.meta.env.VITE_SUPABASE_URL &&
        !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
        import.meta.env.VITE_SUPABASE_ANON_KEY &&
        !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder')
    );

    /* ---- toast helper ------------------------------------------------------- */
    const showToast = useCallback((msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    /* ---- initial data load -------------------------------------------------- */
    useEffect(() => {
        if (!configured.current) {
            setDbError('notConfigured');
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const [pRes, sRes, eRes] = await Promise.all([
                    supabase.from('products').select('*').order('created_at', { ascending: false }),
                    supabase.from('sales').select('*').order('created_at', { ascending: false }),
                    supabase.from('expenses').select('*').order('created_at', { ascending: false }),
                ]);
                if (pRes.error) throw pRes.error;
                if (sRes.error) throw sRes.error;
                if (eRes.error) throw eRes.error;

                setProducts(pRes.data.map(toProduct));
                setSales(sRes.data.map(toSale));
                setExpenses(eRes.data.map(toExpense));
            } catch (err) {
                console.error('[ToyBox] Supabase load error:', err);
                setDbError(err.message || 'Failed to load data from Supabase.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ---- products ----------------------------------------------------------- */
    const addProduct = useCallback(async (p) => {
        const { data, error } = await supabase
            .from('products')
            .insert([{ name: p.name, category: p.category, price: p.price, cost: p.cost, stock: p.stock, emoji: p.emoji }])
            .select()
            .single();
        if (error) { showToast('Error adding product.', 'error'); return; }
        setProducts(prev => [toProduct(data), ...prev]);
        showToast('Product added!');
        return toProduct(data);
    }, [showToast]);

    const updateProduct = useCallback(async (id, updates) => {
        const patch = {};
        if (updates.name !== undefined) patch.name = updates.name;
        if (updates.category !== undefined) patch.category = updates.category;
        if (updates.price !== undefined) patch.price = updates.price;
        if (updates.cost !== undefined) patch.cost = updates.cost;
        if (updates.stock !== undefined) patch.stock = updates.stock;
        if (updates.emoji !== undefined) patch.emoji = updates.emoji;
        const { error } = await supabase.from('products').update(patch).eq('id', id);
        if (error) { showToast('Error updating product.', 'error'); return; }
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        showToast('Product updated!');
    }, [showToast]);

    const deleteProduct = useCallback(async (id) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) { showToast('Error deleting product.', 'error'); return; }
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast('Product deleted.', 'info');
    }, [showToast]);

    /* ---- sales -------------------------------------------------------------- */
    const addSale = useCallback(async (s) => {
        const { data, error } = await supabase
            .from('sales')
            .insert([fromSale(s)])
            .select()
            .single();
        if (error) { showToast('Error recording sale.', 'error'); return; }
        setSales(prev => [toSale(data), ...prev]);
        showToast('Sale recorded!');
    }, [showToast]);

    const updateSale = useCallback(async (id, updates) => {
        const { error } = await supabase
            .from('sales')
            .update(fromSale({ ...updates }))
            .eq('id', id);
        if (error) { showToast('Error updating sale.', 'error'); return; }
        setSales(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        showToast('Sale updated!');
    }, [showToast]);

    const deleteSale = useCallback(async (id) => {
        const { error } = await supabase.from('sales').delete().eq('id', id);
        if (error) { showToast('Error deleting sale.', 'error'); return; }
        setSales(prev => prev.filter(s => s.id !== id));
        showToast('Sale deleted.', 'info');
    }, [showToast]);

    /* ---- expenses ----------------------------------------------------------- */
    const addExpense = useCallback(async (e) => {
        const { data, error } = await supabase
            .from('expenses')
            .insert([{ date: e.date, description: e.description, category: e.category, amount: e.amount }])
            .select()
            .single();
        if (error) { showToast('Error adding expense.', 'error'); return; }
        setExpenses(prev => [toExpense(data), ...prev]);
        showToast('Expense added!');
    }, [showToast]);

    const updateExpense = useCallback(async (id, updates) => {
        const { error } = await supabase
            .from('expenses')
            .update({ date: updates.date, description: updates.description, category: updates.category, amount: updates.amount })
            .eq('id', id);
        if (error) { showToast('Error updating expense.', 'error'); return; }
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
        showToast('Expense updated!');
    }, [showToast]);

    const deleteExpense = useCallback(async (id) => {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) { showToast('Error deleting expense.', 'error'); return; }
        setExpenses(prev => prev.filter(e => e.id !== id));
        showToast('Expense deleted.', 'info');
    }, [showToast]);

    return (
        <AppContext.Provider value={{
            products, sales, expenses,
            loading, dbError, toast,
            addProduct, updateProduct, deleteProduct,
            addSale, updateSale, deleteSale,
            addExpense, updateExpense, deleteExpense,
            showToast,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
