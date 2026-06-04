import { useState, useEffect } from 'react'
import { PlusCircle, Search, Edit2, Trash2, PackagePlus, X, AlertTriangle, Package } from 'lucide-react'
import './StockManager.css'

const API = 'http://localhost:5001/api/stock'

const UNITS = ['kg', 'g', 'L', 'mL', 'pièce(s)', 'boîte(s)', 'sac(s)', 'bouteille(s)']
const CATEGORIES = ['Ingrédients', 'Viandes', 'Légumes', 'Fruits', 'Boissons', 'Épices', 'Produits laitiers', 'Autres']

// Helper: compute bar fill % and color class
function getBarInfo(quantity, min_quantity) {
    const ratio = min_quantity > 0 ? quantity / (min_quantity * 3) : 1
    const pct = Math.min(100, Math.max(0, ratio * 100))
    let cls = 'ok'
    if (ratio <= 0.33) cls = 'low'
    else if (ratio <= 0.66) cls = 'medium'
    return { pct, cls }
}

// ──────────────────────────────────────────
// Add / Edit Modal
// ──────────────────────────────────────────
function StockFormModal({ item, onClose, onSaved }) {
    const isEdit = Boolean(item)
    const [form, setForm] = useState({
        name: item?.name || '',
        quantity: item?.quantity ?? '',
        unit: item?.unit || 'kg',
        min_quantity: item?.min_quantity ?? 1,
        category: item?.category || 'Ingrédients',
    })
    const [saving, setSaving] = useState(false)

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = {
                ...form,
                quantity: parseFloat(form.quantity),
                min_quantity: parseFloat(form.min_quantity),
            }
            const url = isEdit ? `${API}/${item.id}` : API
            const method = isEdit ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (res.ok) {
                onSaved()
                onClose()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="stock-modal-overlay" onClick={onClose}>
            <div className="stock-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{isEdit ? '✏️ Modifier Article' : '➕ Nouvel Article de Stock'}</h3>
                    <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nom de l'article *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            placeholder="ex: Tomates, Farine, Huile..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Catégorie</label>
                        <select value={form.category} onChange={e => set('category', e.target.value)}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="modal-form-grid">
                        <div className="form-group">
                            <label>Quantité actuelle *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.quantity}
                                onChange={e => set('quantity', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Unité</label>
                            <select value={form.unit} onChange={e => set('unit', e.target.value)}>
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Quantité minimale (seuil d'alerte) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.min_quantity}
                            onChange={e => set('min_quantity', e.target.value)}
                            required
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Ajouter au Stock')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ──────────────────────────────────────────
// Restock Modal (quick add quantity)
// ──────────────────────────────────────────
function RestockModal({ item, onClose, onSaved }) {
    const [addQty, setAddQty] = useState('')
    const [saving, setSaving] = useState(false)

    const handleRestock = async (e) => {
        e.preventDefault()
        if (!addQty || parseFloat(addQty) <= 0) return
        setSaving(true)
        try {
            const newQty = item.quantity + parseFloat(addQty)
            const res = await fetch(`${API}/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQty }),
            })
            if (res.ok) { onSaved(); onClose() }
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="stock-modal-overlay" onClick={onClose}>
            <div className="stock-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>📦 Réapprovisionner</h3>
                    <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="restock-info">
                    Article : <strong>{item.name}</strong><br />
                    Stock actuel : <strong>{item.quantity} {item.unit}</strong>
                </div>
                <form className="modal-form" onSubmit={handleRestock}>
                    <div className="form-group">
                        <label>Quantité à ajouter ({item.unit})</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={addQty}
                            onChange={e => setAddQty(e.target.value)}
                            placeholder="ex: 10"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'En cours...' : '✓ Confirmer Réappro.'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ──────────────────────────────────────────
// Main StockManager Component
// ──────────────────────────────────────────
function StockManager() {
    const [items, setItems] = useState([])
    const [search, setSearch] = useState('')
    const [filterCat, setFilterCat] = useState('Toutes')
    const [showLowOnly, setShowLowOnly] = useState(false)

    const [modal, setModal] = useState(null) // null | 'add' | 'edit' | 'restock'
    const [selectedItem, setSelectedItem] = useState(null)

    useEffect(() => { fetchStock() }, [])

    const fetchStock = async () => {
        try {
            const res = await fetch(API)
            const data = await res.json()
            setItems(data)
        } catch (err) {
            console.error('Error fetching stock:', err)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cet article du stock ?')) return
        try {
            await fetch(`${API}/${id}`, { method: 'DELETE' })
            fetchStock()
        } catch (err) {
            console.error(err)
        }
    }

    // Filtered list
    const filtered = items.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
        const matchCat = filterCat === 'Toutes' || item.category === filterCat
        const matchLow = !showLowOnly || item.isLow
        return matchSearch && matchCat && matchLow
    })

    // Stats
    const totalItems = items.length
    const lowItems = items.filter(i => i.isLow).length
    const okItems = totalItems - lowItems

    return (
        <div className="stock-manager animate-fade-in">

            {/* Low Stock Alert Banner */}
            {lowItems > 0 && (
                <div className="stock-alert-banner">
                    <span className="alert-icon">⚠️</span>
                    <span>
                        <strong>{lowItems} article{lowItems > 1 ? 's' : ''}</strong> en rupture ou stock faible —
                        pensez à réapprovisionner !
                    </span>
                    <button
                        className="btn btn-sm"
                        style={{ marginLeft: 'auto', background: '#ff6b6b22', color: '#ff6b6b', border: '1px solid #ff6b6b44', borderRadius: '8px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem' }}
                        onClick={() => setShowLowOnly(v => !v)}
                    >
                        {showLowOnly ? 'Voir tout' : 'Voir les alertes'}
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="stock-header">
                <div className="stock-header-left">
                    <h2>📦 Gestion de Stock</h2>
                    <p>Suivez et gérez les ingrédients de votre restaurant</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setSelectedItem(null); setModal('add') }}>
                    <PlusCircle size={18} /> Ajouter Article
                </button>
            </div>

            {/* Summary Cards */}
            <div className="stock-summary">
                <div className="summary-card">
                    <span className="summary-icon">📦</span>
                    <div>
                        <div className="summary-value">{totalItems}</div>
                        <div className="summary-label">Articles total</div>
                    </div>
                </div>
                <div className="summary-card success">
                    <span className="summary-icon">✅</span>
                    <div>
                        <div className="summary-value">{okItems}</div>
                        <div className="summary-label">Stock OK</div>
                    </div>
                </div>
                <div className="summary-card danger">
                    <span className="summary-icon">🔴</span>
                    <div>
                        <div className="summary-value">{lowItems}</div>
                        <div className="summary-label">Stock faible</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="stock-filters">
                <div className="stock-search">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher un article..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filterCat}
                    onChange={e => setFilterCat(e.target.value)}
                >
                    <option value="Toutes">Toutes catégories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="stock-table-wrapper">
                {filtered.length === 0 ? (
                    <div className="stock-empty">
                        <div className="empty-icon"><Package size={56} strokeWidth={1} /></div>
                        <h3>Aucun article trouvé</h3>
                        <p>Ajoutez votre premier article ou modifiez les filtres</p>
                    </div>
                ) : (
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th>Catégorie</th>
                                <th>Quantité en stock</th>
                                <th>Seuil min.</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(item => {
                                const { pct, cls } = getBarInfo(item.quantity, item.min_quantity)
                                return (
                                    <tr key={item.id} className={item.isLow ? 'low-stock-row' : ''}>
                                        {/* Name */}
                                        <td>
                                            <div className="item-name-cell">
                                                <span style={{ fontSize: '1.3rem' }}>
                                                    {item.category === 'Viandes' ? '🥩' :
                                                     item.category === 'Légumes' ? '🥦' :
                                                     item.category === 'Fruits' ? '🍎' :
                                                     item.category === 'Boissons' ? '🥤' :
                                                     item.category === 'Épices' ? '🌶️' :
                                                     item.category === 'Produits laitiers' ? '🧀' : '📦'}
                                                </span>
                                                <strong>{item.name}</strong>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td>
                                            <span className="item-category-badge">{item.category}</span>
                                        </td>

                                        {/* Quantity + bar */}
                                        <td>
                                            <div className="quantity-display">
                                                <div className="quantity-bar">
                                                    <div
                                                        className={`quantity-fill ${cls}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="quantity-text">
                                                    {item.quantity} {item.unit}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Min */}
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {item.min_quantity} {item.unit}
                                        </td>

                                        {/* Status */}
                                        <td>
                                            {item.isLow ? (
                                                <span className="status-badge low">⚠️ Stock faible</span>
                                            ) : (
                                                <span className="status-badge ok">✓ OK</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="icon-btn restock"
                                                    title="Réapprovisionner"
                                                    onClick={() => { setSelectedItem(item); setModal('restock') }}
                                                >
                                                    <PackagePlus size={16} />
                                                </button>
                                                <button
                                                    className="icon-btn edit"
                                                    title="Modifier"
                                                    onClick={() => { setSelectedItem(item); setModal('edit') }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="icon-btn delete"
                                                    title="Supprimer"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modals */}
            {(modal === 'add' || modal === 'edit') && (
                <StockFormModal
                    item={modal === 'edit' ? selectedItem : null}
                    onClose={() => setModal(null)}
                    onSaved={fetchStock}
                />
            )}

            {modal === 'restock' && selectedItem && (
                <RestockModal
                    item={selectedItem}
                    onClose={() => setModal(null)}
                    onSaved={fetchStock}
                />
            )}
        </div>
    )
}

export default StockManager
