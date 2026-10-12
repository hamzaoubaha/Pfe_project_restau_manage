import { Coffee, Utensils, Salad, ShoppingCart, Plus, Cake } from 'lucide-react'
import './POS.css'

function MenuBrowser({ menuItems, onAddToCart, cart, onOpenCart }) {
    // Filter items by category (case-insensitive)
    const getCategoryItems = (items, category) => {
        return items.filter(item => {
            if (item.category) return item.category.toLowerCase() === category.toLowerCase();
            // Fallback by keyword
            const text = (item.name + ' ' + (item.description || '')).toLowerCase();
            if (category === 'drinks')     return text.includes('juice') || text.includes('water') || text.includes('soda') || text.includes('coffee') || text.includes('tea') || text.includes('مشروب') || text.includes('غازي');
            if (category === 'appetizers') return text.includes('salad') || text.includes('soup') || text.includes('fries') || text.includes('rings') || text.includes('بطاطس');
            if (category === 'dessert')    return text.includes('cake') || text.includes('ice cream') || text.includes('dessert') || text.includes('sweet');
            if (category === 'main')       return true;
            return true;
        });
    }

    const drinks     = getCategoryItems(menuItems, 'drinks');
    const appetizers = getCategoryItems(menuItems, 'appetizers');
    const mainDishes = getCategoryItems(menuItems, 'main');
    const desserts   = getCategoryItems(menuItems, 'dessert');

    const renderItemCard = (item) => (
        <div key={item.id || item.name} className="menu-card-compact animate-fade-in" onClick={() => onAddToCart(item)}>
            <img
                src={item.imageUrl || 'https://placehold.co/80x80?text=🍽️'}
                alt={item.name}
                onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80?text=Food'; }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 700 }}>{item.price} DH</div>
            </div>
            <button
                className="btn btn-sm"
                style={{ background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                onClick={e => { e.stopPropagation(); onAddToCart(item); }}
            >
                <Plus size={16} />
            </button>
        </div>
    );

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const columns = [
        { key: 'drinks',     icon: <Coffee size={20} />,   label: 'Boissons',    items: drinks },
        { key: 'appetizers', icon: <Salad size={20} />,    label: 'Entrées',     items: appetizers },
        { key: 'main',       icon: <Utensils size={20} />, label: 'Plats',       items: mainDishes },
        { key: 'dessert',    icon: <Cake size={20} />,     label: 'Desserts',    items: desserts },
    ].filter(col => col.items.length > 0); // only show columns that have items

    return (
        <div className="menu-browser-wrapper">
            <div className="menu-browser" style={{ gridTemplateColumns: `repeat(${Math.min(columns.length, 4)}, 1fr)` }}>
                {columns.map(col => (
                    <div key={col.key} className="menu-column">
                        <div className="column-header">
                            {col.icon}
                            <span>{col.label}</span>
                        </div>
                        <div className="column-content">
                            {col.items.map(renderItemCard)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Cart Button */}
            {totalItems > 0 && (
                <button className="floating-cart-btn animate-bounce" onClick={onOpenCart}>
                    <ShoppingCart size={28} />
                    <div className="cart-badge">{totalItems}</div>
                </button>
            )}
        </div>
    )
}

export default MenuBrowser
