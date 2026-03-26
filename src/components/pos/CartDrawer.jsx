import { X, Trash2, Minus, Plus, Utensils, Zap, ShoppingCart } from 'lucide-react'
import './POS.css'

function CartDrawer({
    cart,
    onClose,
    onUpdateQuantity,
    onRemoveItem,
    servingPreference,
    setServingPreference,
    onSubmit
}) {
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="cart-drawer-overlay" onClick={onClose}>
            <div className="cart-drawer" onClick={e => e.stopPropagation()}>
                <div className="cart-header">
                    <h3>Your Order</h3>
                    <button className="close-btn" onClick={onClose}><X /></button>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                            <div style={{ marginBottom: '1rem', opacity: 0.5, display: 'flex', justifyContent: 'center' }}>
                                <ShoppingCart size={48} strokeWidth={1} />
                            </div>
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-item-row animate-fade-in">
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>${item.price.toFixed(2)}</div>
                                </div>

                                <div className="quantity-controls">
                                    <button
                                        className="qty-btn"
                                        onClick={() => item.quantity > 1 ? onUpdateQuantity(item.id, item.quantity - 1) : onRemoveItem(item.id)}
                                    ><Minus size={14} /></button>
                                    <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    ><Plus size={14} /></button>
                                </div>

                                <button
                                    onClick={() => onRemoveItem(item.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    title="Remove"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="preferences-section">
                            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Serving Preference</label>
                            <div className="preference-options">
                                <div
                                    className={`pref-option ${servingPreference === 'all_together' ? 'selected' : ''}`}
                                    onClick={() => setServingPreference('all_together')}
                                >
                                    <Utensils size={18} style={{ marginBottom: '5px' }} />
                                    <div>All Together</div>
                                </div>
                                <div
                                    className={`pref-option ${servingPreference === 'as_ready' ? 'selected' : ''}`}
                                    onClick={() => setServingPreference('as_ready')}
                                >
                                    <Zap size={18} style={{ marginBottom: '5px' }} />
                                    <div>As Ready</div>
                                </div>
                            </div>
                        </div>

                        <div className="form-total" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
                            <span>Total</span>
                            <span className="total-value">${totalAmount.toFixed(2)}</span>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', fontSize: '1rem', fontWeight: 600 }} onClick={onSubmit}>
                            Confirm Order
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartDrawer
