import { useState, useEffect } from 'react'
import { PlusCircle, Search, Edit2, Trash2, PackagePlus, X, Package, Sparkles, Tag, Layers, Scale, BellRing, ArrowLeft, Save } from 'lucide-react'
import './StockManager.css'

const API = 'http://localhost:5001/api/stock'

const UNITS = ['kg', 'g', 'L', 'mL', 'pièce(s)', 'boîte(s)', 'sac(s)', 'bouteille(s)']
const CATEGORIES = ['Ingrédients', 'Viandes', 'Légumes', 'Fruits', 'Boissons', 'Épices', 'Produits laitiers', 'Autres']

const INITIAL_FALLBACK_STOCK = [
    { id: 1, name: 'Farine T55', quantity: 25, unit: 'kg', min_quantity: 10, category: 'Ingrédients', isLow: false },
    { id: 2, name: 'Viande hachée', quantity: 3.5, unit: 'kg', min_quantity: 5, category: 'Viandes', isLow: true },
    { id: 3, name: 'Fromage Mozzarella', quantity: 4, unit: 'kg', min_quantity: 6, category: 'Produits laitiers', isLow: true },
    { id: 4, name: 'Tomates fraîches', quantity: 18, unit: 'kg', min_quantity: 8, category: 'Légumes', isLow: false },
    { id: 5, name: 'Boissons Coca/Fanta', quantity: 48, unit: 'bouteille(s)', min_quantity: 20, category: 'Boissons', isLow: false },
    { id: 6, name: 'Huile de friture', quantity: 2, unit: 'L', min_quantity: 5, category: 'Ingrédients', isLow: true }
]

// Helper: compute bar fill % and color class
function getBarInfo(quantity, min_quantity) {
    const ratio = min_quantity > 0 ? quantity / (min_quantity * 3) : 1
    const pct = Math.min(100, Math.max(0, ratio * 100))
    let cls = 'ok'
    if (ratio <= 0.33) cls = 'low'
    else if (ratio <= 0.66) cls = 'medium'
    return { pct, cls }
}

function getCategoryEmoji(cat) {
    switch (cat) {
        case 'Viandes': return '🥩'
        case 'Légumes': return '🥦'
        case 'Fruits': return '🍎'
        case 'Boissons': return '🥤'
        case 'Épices': return '🌶️'
        case 'Produits laitiers': return '🧀'
        default: return '📦'
    }
}

// ──────────────────────────────────────────
// Restock Quick Modal (Clean Light Design)
// ──────────────────────────────────────────
function RestockModal({ item, onClose, onSaved }) {
    const [addQty, setAddQty] = useState('')
    const [saving, setSaving] = useState(false)

    const handleRestock = async (e) => {
        e.preventDefault()
        const qtyNum = parseFloat(addQty)
        if (!qtyNum || qtyNum <= 0) return
        setSaving(true)

        const newQty = (item.quantity || 0) + qtyNum
        const isLowNow = newQty <= item.min_quantity

        try {
            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), 2000)
            const res = await fetch(`${API}/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQty }),
                signal: controller.signal
            })
            clearTimeout(timer)
            if (res.ok) {
                onSaved()
                onClose()
                return
            }
        } catch (err) {
            console.log('Restock API offline, updating locally')
        }

        onSaved({ ...item, quantity: newQty, isLow: isLowNow })
        onClose()
        setSaving(false)
    }

    return (
        <div className="restock-modal-overlay" onClick={onClose}>
            <div className="restock-modal-card" onClick={e => e.stopPropagation()}>
                <div className="restock-header">
                    <h3>📦 Réapprovisionner le Stock</h3>
                    <button className="restock-close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="restock-info-box">
                    Article : <strong>{item.name}</strong><br />
                    Stock actuel : <strong>{item.quantity} {item.unit}</strong>
                </div>
                <form onSubmit={handleRestock}>
                    <div className="stock-form-group">
                        <label>Quantité à ajouter ({item.unit})</label>
                        <div className="stock-input-wrap">
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
                            <span className="stock-input-suffix">{item.unit}</span>
                        </div>
                    </div>
                    <div className="restock-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'En cours...' : '✓ Confirmer'}
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
    const [view, setView] = useState('list') // 'list' | 'form'
    const [items, setItems] = useState(INITIAL_FALLBACK_STOCK)
    const [search, setSearch] = useState('')
    const [filterCat, setFilterCat] = useState('Toutes')
    const [showLowOnly, setShowLowOnly] = useState(false)

    // Form State (Matches MenuManager exact pattern)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        unit: 'kg',
        min_quantity: 5,
        category: 'Ingrédients'
    })
    const [saving, setSaving] = useState(false)

    // Restock Modal
    const [restockItem, setRestockItem] = useState(null)

    useEffect(() => { fetchStock() }, [])

    const fetchStock = async () => {
        try {
            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), 2000)
            const res = await fetch(API, { signal: controller.signal })
            clearTimeout(timer)
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data) && data.length > 0) {
                    setItems(data)
                }
            }
        } catch (err) {
            console.log('Stock API offline, using local state')
        }
    }

    const handleOpenAdd = () => {
        setEditingItem(null)
        setFormData({
            name: '',
            quantity: '',
            unit: 'kg',
            min_quantity: 5,
            category: 'Ingrédients'
        })
        setView('form')
    }

    const handleOpenEdit = (item) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit || 'kg',
            min_quantity: item.min_quantity || 5,
            category: item.category || 'Ingrédients'
        })
        setView('form')
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        const numQty = parseFloat(formData.quantity) || 0
        const numMin = parseFloat(formData.min_quantity) || 0
        const isLow = numQty <= numMin

        const payload = {
            ...formData,
            name: formData.name.trim(),
            quantity: numQty,
            min_quantity: numMin,
            isLow,
            id: editingItem?.id || Date.now()
        }

        try {
            const url = editingItem ? `${API}/${editingItem.id}` : API
            const method = editingItem ? 'PUT' : 'POST'
            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), 2000)
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            })
            clearTimeout(timer)
            if (res.ok) {
                fetchStock()
                setView('list')
                setSaving(false)
                return
            }
        } catch (err) {
            console.log('Stock API offline, saving locally')
        }

        // Local state update
        setItems(prev => {
            if (editingItem) {
                return prev.map(i => i.id === editingItem.id ? { ...i, ...payload } : i)
            }
            return [payload, ...prev]
        })

        setView('list')
        setSaving(false)
    }

    const handleRestockSaved = (updatedItem) => {
        fetchStock()
        if (updatedItem) {
            setItems(prev => prev.map(i => i.id === updatedItem.id ? { ...i, ...updatedItem } : i))
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cet article du stock ?')) return
        setItems(prev => prev.filter(i => i.id !== id))
        try {
            await fetch(`${API}/${id}`, { method: 'DELETE' })
        } catch (err) {
            console.log('Deleted locally')
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

    // Live preview values
    const previewQty = parseFloat(formData.quantity) || 0
    const previewMin = parseFloat(formData.min_quantity) || 0
    const previewIsLow = previewQty <= previewMin

    return (
        <div className="stock-manager animate-fade-in">
            {view === 'list' ? (
                <>
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
                                style={{ marginLeft: 'auto', background: '#FED7D7', color: '#C53030', border: '1px solid #FEB2B2', borderRadius: '8px', padding: '0.35rem 0.85rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
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
                            <p>Suivez et gérez les ingrédients et matières premières</p>
                        </div>
                        <button className="btn btn-primary" onClick={handleOpenAdd}>
                            <PlusCircle size={18} /> Ajouter Article
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="stock-summary">
                        <div className="summary-card">
                            <span className="summary-icon">📦</span>
                            <div>
                                <div className="summary-value">{totalItems}</div>
                                <div className="summary-label">Articles en catalogue</div>
                            </div>
                        </div>
                        <div className="summary-card success">
                            <span className="summary-icon">✅</span>
                            <div>
                                <div className="summary-value">{okItems}</div>
                                <div className="summary-label">Stock suffisant</div>
                            </div>
                        </div>
                        <div className="summary-card danger">
                            <span className="summary-icon">🔴</span>
                            <div>
                                <div className="summary-value">{lowItems}</div>
                                <div className="summary-label">Articles à commander</div>
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
                                <p>Ajoutez votre premier article de stock ou ajustez les filtres</p>
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
                                                <td>
                                                    <div className="item-name-cell">
                                                        <span style={{ fontSize: '1.3rem' }}>
                                                            {getCategoryEmoji(item.category)}
                                                        </span>
                                                        <strong>{item.name}</strong>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="item-category-badge">{item.category}</span>
                                                </td>

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

                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                                                    {item.min_quantity} {item.unit}
                                                </td>

                                                <td>
                                                    {item.isLow ? (
                                                        <span className="status-badge low">⚠️ Stock faible</span>
                                                    ) : (
                                                        <span className="status-badge ok">✓ OK</span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="icon-btn restock"
                                                            title="Réapprovisionner"
                                                            onClick={() => setRestockItem(item)}
                                                        >
                                                            <PackagePlus size={16} />
                                                        </button>
                                                        <button
                                                            className="icon-btn edit"
                                                            title="Modifier"
                                                            onClick={() => handleOpenEdit(item)}
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
                </>
            ) : (
                /* ==========================================================
                   Full Page Form (Exact MenuManager Luxury Pattern)
                   ========================================================== */
                <div className="stock-form-page-container">
                    <div className="stock-form-header-bar">
                        <button className="stock-back-btn" onClick={() => setView('list')}>
                            <ArrowLeft size={18} /> Retour au Stock
                        </button>
                        <h3 className="stock-form-title-clean">
                            <Sparkles size={20} className="title-icon" />
                            {editingItem ? 'Modifier l\'article de stock' : 'Ajouter un nouvel article de stock'}
                        </h3>
                    </div>

                    <div className="stock-form-layout-wrapper">
                        <form className="stock-form-content" onSubmit={handleFormSubmit}>
                            <div className="stock-form-grid">
                                <div className="stock-form-group stock-full-width">
                                    <label>Nom de l'article *</label>
                                    <div className="stock-input-wrap">
                                        <Tag size={16} className="stock-input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Ex: Viande hachée, Farine T55, Sauce tomate..."
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="stock-form-group">
                                    <label>Catégorie</label>
                                    <div className="stock-input-wrap">
                                        <Layers size={16} className="stock-input-icon" />
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="stock-form-group">
                                    <label>Unité de mesure</label>
                                    <div className="stock-input-wrap">
                                        <Package size={16} className="stock-input-icon" />
                                        <select
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        >
                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="stock-form-group">
                                    <label>Quantité actuelle *</label>
                                    <div className="stock-input-wrap">
                                        <Scale size={16} className="stock-input-icon" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                            required
                                        />
                                        <span className="stock-input-suffix">{formData.unit}</span>
                                    </div>
                                </div>

                                <div className="stock-form-group">
                                    <label>Seuil d'alerte minimale *</label>
                                    <div className="stock-input-wrap">
                                        <BellRing size={16} className="stock-input-icon" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="5"
                                            value={formData.min_quantity}
                                            onChange={e => setFormData({ ...formData, min_quantity: e.target.value })}
                                            required
                                        />
                                        <span className="stock-input-suffix">{formData.unit}</span>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="stock-save-btn" disabled={saving}>
                                <Save size={18} />
                                {saving ? 'Enregistrement...' : (editingItem ? 'Mettre à jour l\'article' : 'Enregistrer dans le Stock')}
                            </button>
                        </form>

                        {/* Side Live Preview Panel (Just like MenuManager) */}
                        <div className="stock-preview-panel">
                            <span className="stock-preview-label">Aperçu en direct (Live Preview)</span>
                            <div className="stock-preview-card">
                                <div className="stock-preview-top">
                                    <div className="stock-preview-icon-circle">
                                        {getCategoryEmoji(formData.category)}
                                    </div>
                                    <div className="stock-preview-title-box">
                                        <span className="stock-preview-cat">{formData.category}</span>
                                        <h4 className="stock-preview-name">{formData.name || 'Nom de l\'article'}</h4>
                                    </div>
                                </div>

                                <div className="stock-preview-metrics">
                                    <div className="stock-metric-col">
                                        <span className="stock-metric-title">En Stock</span>
                                        <span className="stock-metric-val">{previewQty} <small>{formData.unit}</small></span>
                                    </div>
                                    <div className="stock-metric-col">
                                        <span className="stock-metric-title">Seuil Min.</span>
                                        <span className="stock-metric-val">{previewMin} <small>{formData.unit}</small></span>
                                    </div>
                                </div>

                                <div className={`stock-preview-status ${previewIsLow ? 'low' : 'ok'}`}>
                                    <span>Statut estimé</span>
                                    <span>{previewIsLow ? '⚠️ Seuil d\'alerte' : '✓ Stock suffisant'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Restock Modal */}
            {restockItem && (
                <RestockModal
                    item={restockItem}
                    onClose={() => setRestockItem(null)}
                    onSaved={handleRestockSaved}
                />
            )}
        </div>
    )
}

export default StockManager
