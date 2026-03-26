import { Coffee, Utensils, Salad, ShoppingCart, Plus } from 'lucide-react'
import './POS.css'

function MenuBrowser({ menuItems, onAddToCart, cart, onOpenCart }) {
    // Helper to filter items by hardcoded category keywords (temporary solution until DB has proper categories)
    const getCategoryItems = (items, category) => {
        return items.filter(item => {
            // If item has a category field, use it
            if (item.category) return item.category.toLowerCase() === category.toLowerCase();

            // Fallback: Guess based on name/description (Simple logic for now)
            const text = (item.name + ' ' + item.description).toLowerCase();
            if (category === 'Drinks') return text.includes('juice') || text.includes('water') || text.includes('soda') || text.includes('coffee') || text.includes('tea');
            if (category === 'Appetizers') return text.includes('salad') || text.includes('soup') || text.includes('fries') || text.includes('rings') || text.includes('bread');
            if (category === 'Main') return !text.includes('juice') && !text.includes('water') && !text.includes('salad') && !text.includes('fries') && !text.includes('tea');
            return true;
        });
    }

    const drinks = getCategoryItems(menuItems, 'Drinks');
    const appetizers = getCategoryItems(menuItems, 'Appetizers');
    const mainDishes = getCategoryItems(menuItems, 'Main');

    const renderItemCard = (item) => (
        <div key={item.id} className="menu-card-compact animate-fade-in" onClick={() => onAddToCart(item)}>
            <img src={item.imageUrl} alt={item.name} />
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{item.name}</div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 600 }}>${item.price.toFixed(2)}</div>
            </div>
            <button className="btn btn-sm" style={{ background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={16} />
            </button>
        </div>
    );

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div style={{ position: 'relative', height: '100%', padding: '0 2rem' }}>
            <div className="menu-browser">
                {/* Column 1: Drinks */}
                <div className="menu-column">
                    <div className="column-header">
                        <Coffee size={24} />
                        <span>Drinks</span>
                    </div>
                    <div className="column-content">
                        {drinks.map(renderItemCard)}
                    </div>
                </div>

                {/* Column 2: Appetizers */}
                <div className="menu-column">
                    <div className="column-header">
                        <Salad size={24} />
                        <span>Appetizers</span>
                    </div>
                    <div className="column-content">
                        {appetizers.map(renderItemCard)}
                    </div>
                </div>

                {/* Column 3: Main Courses */}
                <div className="menu-column">
                    <div className="column-header">
                        <Utensils size={24} />
                        <span>Main Courses</span>
                    </div>
                    <div className="column-content">
                        {mainDishes.map(renderItemCard)}
                    </div>
                </div>
            </div>

            {/* Floating Cart Button */}
            {totalItems > 0 && (
                <button className="floating-cart-btn animate-bounce" onClick={onOpenCart}>
                    <ShoppingCart size={30} />
                    <div className="cart-badge">{totalItems}</div>
                </button>
            )}
        </div>
    )
}

export default MenuBrowser
