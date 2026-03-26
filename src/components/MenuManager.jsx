import { useState, useEffect } from 'react'
import { PlusCircle, Trash2, Image, Tag, DollarSign, Search, Edit2, ArrowLeft, Save, Coffee, Utensils, Salad, Cake } from 'lucide-react'
import './MenuManager.css'

function MenuManager() {
    const [view, setView] = useState('list') // 'list' | 'form'
    const [items, setItems] = useState([])
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
            setItems(data)
        } catch (error) {
            console.error('Error fetching menu:', error)
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
                                <img src={item.imageUrl} alt={item.name} className="item-image" />
                                <div className="item-content">
                                    <div className="item-header">
                                        <div>
                                            <span className="category-badge">{item.category || 'Main'}</span>
                                            <h3 className="item-title">{item.name}</h3>
                                        </div>
                                        <div className="item-price">${item.price.toFixed(2)}</div>
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
                    <button className="back-btn" onClick={() => setView('list')}>
                        <ArrowLeft size={18} /> Back to Menu
                    </button>

                    <form className="add-item-form" onSubmit={handleSubmit}>
                        <h3 className="form-title">{editingId ? 'Edit Dish' : 'Add New Dish'}</h3>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Dish Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
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
                                <label>Price ($)</label>
                                <div className="input-with-icon">
                                    <DollarSign size={16} className="input-icon" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Image URL</label>
                                <div className="input-with-icon">
                                    <Image size={16} className="input-icon" />
                                    <input
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Ingredients (comma separated)</label>
                                <div className="input-with-icon">
                                    <Tag size={16} className="input-icon" />
                                    <input
                                        type="text"
                                        value={formData.ingredients}
                                        onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary save-btn">
                            <Save size={18} /> {editingId ? 'Update Dish' : 'Save Dish'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default MenuManager
