import { useState, useEffect } from 'react'
import { PlusCircle, Trash2, Image, Tag, Coins, Search, Edit2, ArrowLeft, Save, Coffee, Utensils, Salad, Cake, Sparkles } from 'lucide-react'
import './MenuManager.css'
import { defaultMenuItems } from '../defaultMenu'

function MenuManager() {
    const [view, setView] = useState('list') // 'list' | 'form'
    const [items, setItems] = useState(defaultMenuItems)
    const [editingId, setEditingId] = useState(null)

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Main',
        description: '',
        ingredients: '',
        imageUrl: ''
    })

    const categories = ['Main', 'Appetizers', 'Drinks', 'Dessert']

    useEffect(() => {
        fetchMenuItems()
    }, [])

    const fetchMenuItems = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/menu')
            const data = await response.json()
            if (Array.isArray(data) && data.length > 0) {
                setItems(data)
            }
        } catch (error) {
            console.log('Using default Moroccan snack menu for MenuManager')
        }
    }

    const handleEditClick = (item) => {
        setEditingId(item._id || item.id)
        setFormData({
            name: item.name,
            price: item.price,
            category: item.category || 'Main',
            description: item.description || '',
            ingredients: Array.isArray(item.ingredients) 
                ? item.ingredients.join(', ') 
                : (typeof item.ingredients === 'string' ? item.ingredients.replace(/[\[\]"]/g, '') : ''),
            imageUrl: item.imageUrl || ''
        })
        setView('form')
    }

    const handleAddNew = () => {
        setEditingId(null)
        setFormData({
            name: '',
            price: '',
            category: 'Main',
            description: '',
            ingredients: '',
            imageUrl: ''
        })
        setView('form')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const itemData = {
                ...formData,
                price: parseFloat(formData.price),
                ingredients: formData.ingredients.split(',').map(i => i.trim()),
                imageUrl: formData.imageUrl || undefined
            }

            const url = editingId
                ? `http://localhost:5001/api/menu/${editingId}`
                : 'http://localhost:5001/api/menu'

            const method = editingId ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            })

            if (response.ok) {
                fetchMenuItems()
                setView('list')
            }
        } catch (error) {
            console.error('Error saving item:', error)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return
        try {
            await fetch(`http://localhost:5001/api/menu/${id}`, { method: 'DELETE' })
            fetchMenuItems()
        } catch (error) {
            console.error('Error deleting item:', error)
        }
    }

    // Filter Logic
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="menu-manager animate-fade-in">
            {view === 'list' ? (
                <>
                    <div className="menu-header">
                        <div className="header-top">
                            <h2 className="section-title">Menu Management</h2>
                            <button className="btn btn-primary" onClick={handleAddNew}>
                                <PlusCircle size={18} /> Add New Dish
                            </button>
                        </div>

                        <div className="filters-bar">
                            <div className="search-box">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search menu..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="category-tabs">
                                <button
                                    className={`tab ${activeCategory === 'All' ? 'active' : ''}`}
                                    onClick={() => setActiveCategory('All')}
                                >All</button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`tab ${activeCategory === cat ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="menu-grid">
                        {filteredItems.map(item => (
                            <div key={item.id || item._id} className="menu-item-card">
                                <img 
                                    src={item.imageUrl || 'https://placehold.co/400x300?text=No+Image'} 
                                    alt={item.name} 
                                    className="item-image" 
                                    onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=No+Image' }}
                                />
                                <div className="item-content">
                                    <div className="item-header">
                                        <div>
                                            <span className="category-badge">{item.category || 'Main'}</span>
                                            <h3 className="item-title">{item.name}</h3>
                                        </div>
                                        <div className="item-price">{item.price.toFixed(0)} MAD</div>
                                    </div>
                                    <p className="item-description">{item.description}</p>

                                    <div className="item-actions">
                                        <button className="action-btn edit" onClick={() => handleEditClick(item)}>
                                            <Edit2 size={16} /> Edit
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(item.id || item._id)}>
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="form-container">
                    <div className="form-header-bar">
                        <button className="back-btn" onClick={() => setView('list')}>
                            <ArrowLeft size={18} /> Back to Menu
                        </button>
                        <h3 className="form-title-clean">
                            <Sparkles size={20} className="title-icon" />
                            {editingId ? 'Modifier le plat' : 'Ajouter un nouvel article'}
                        </h3>
                    </div>

                    <div className="form-layout-wrapper">
                        <form className="add-item-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Nom du plat / Article</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: طاكوس ميكس أو برجر دجاج"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Catégorie</label>
                                    <div className="input-with-icon">
                                        <Utensils size={16} className="input-icon" />
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="category-select"
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Prix (MAD)</label>
                                    <div className="input-with-icon">
                                        <Coins size={16} className="input-icon" />
                                        <input
                                            type="number"
                                            step="1"
                                            placeholder="35"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            required
                                        />
                                        <span className="currency-suffix">MAD</span>
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label>Lien de l'image (URL)</label>
                                    <div className="input-with-icon">
                                        <Image size={16} className="input-icon" />
                                        <input
                                            type="url"
                                            placeholder="https://images.unsplash.com/..."
                                            value={formData.imageUrl}
                                            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="وصف شهي للمكونات والمذاق..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Ingrédients (séparés par des virgules)</label>
                                    <div className="input-with-icon">
                                        <Tag size={16} className="input-icon" />
                                        <input
                                            type="text"
                                            placeholder="خبز، جبن، دجاج، صوص..."
                                            value={formData.ingredients}
                                            onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary save-btn">
                                <Save size={18} /> {editingId ? 'Enregistrer les modifications' : 'Ajouter au Menu'}
                            </button>
                        </form>

                        {/* Live Preview Card */}
                        <div className="form-preview-panel">
                            <span className="preview-label">Aperçu en direct (Live Preview)</span>
                            <div className="preview-card">
                                <div className="preview-img-box">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                                    ) : (
                                        <div className="preview-placeholder">
                                            <Utensils size={36} />
                                            <span>Image preview</span>
                                        </div>
                                    )}
                                    <span className="preview-price-tag">{formData.price || '0'} MAD</span>
                                </div>
                                <div className="preview-details">
                                    <span className="preview-cat">{formData.category || 'Main'}</span>
                                    <h4 className="preview-name">{formData.name || 'Nom du plat'}</h4>
                                    <p className="preview-desc">{formData.description || 'La description apparaîtra ici...'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MenuManager
