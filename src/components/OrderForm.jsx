import { useState, useEffect } from 'react'
import './OrderForm.css'

function OrderForm({ onSubmit, onCancel }) {
    const [tableNumber, setTableNumber] = useState('')
    const [items, setItems] = useState([{ name: '', quantity: 1, price: 0 }])

    const [menuItems, setMenuItems] = useState([])

    useEffect(() => {
        fetch('http://localhost:5001/api/menu')
            .then(res => res.json())
            .then(data => setMenuItems(data))
            .catch(err => console.error('Error loading menu:', err))
    }, [])

    const addItem = () => {
        setItems([...items, { name: '', quantity: 1, price: 0 }])
    }

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const updateItem = (index, field, value) => {
        const newItems = [...items]

        if (field === 'name') {
            const menuItem = menuItems.find(item => item.name === value)
            if (menuItem) {
                newItems[index].name = value
                newItems[index].price = menuItem.price
            }
        } else {
            newItems[index][field] = field === 'quantity' ? parseInt(value) || 1 : parseFloat(value) || 0
        }

        setItems(newItems)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!tableNumber || items.some(item => !item.name)) {
            alert('Please fill in all fields')
            return
        }

        onSubmit({
            tableNumber: parseInt(tableNumber),
            items: items.filter(item => item.name)
        })
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return (
        <div className="order-form-overlay">
            <div className="order-form-container animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="form-header">
                    <h2 className="gradient-text">Create New Order</h2>
                    <button className="close-btn" onClick={onCancel}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Table Number</label>
                        <input
                            type="number"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            placeholder="Enter table number"
                            min="1"
                            required
                        />
                    </div>

                    <div className="items-section">
                        <div className="items-header">
                            <label>Order Items</label>
                            <button type="button" className="btn btn-secondary" onClick={addItem}>
                                ➕ Add Item
                            </button>
                        </div>

                        {items.map((item, index) => (
                            <div key={index} className="item-row">
                                <div className="item-inputs">
                                    <select
                                        value={item.name}
                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                        required
                                    >
                                        <option value="">Select item...</option>
                                        {menuItems.map((menuItem) => (
                                            <option key={menuItem.name} value={menuItem.name}>
                                                {menuItem.name} - ${menuItem.price}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                        min="1"
                                        placeholder="Qty"
                                        className="quantity-input"
                                    />

                                    <div className="item-total">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>

                                {items.length > 1 && (
                                    <button
                                        type="button"
                                        className="remove-item-btn"
                                        onClick={() => removeItem(index)}
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="form-total">
                        <span>Order Total:</span>
                        <span className="total-value">${totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default OrderForm
