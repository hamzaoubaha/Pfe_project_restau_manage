import { LayoutDashboard, UtensilsCrossed, PlusCircle, Warehouse } from 'lucide-react'
import './Header.css'

function Header({ onNewOrder, onViewChange, currentView }) {
    return (
        <header className="header">
            <div className="header-inner">
                <div className="logo-container">
                    <img src="/OIP.jpg" alt="Waiter Logo" className="logo-image" />
                    <h1 className="logo-text">Restaurant Management</h1>
                </div>

                <nav className="nav-menu">
                    <button
                        className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => onViewChange('dashboard')}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </button>

                    <button
                        className={`nav-item ${currentView === 'menu_manager' ? 'active' : ''}`}
                        onClick={() => onViewChange('menu_manager')}
                    >
                        <UtensilsCrossed size={20} />
                        <span>Menu</span>
                    </button>

                    <button
                        className={`nav-item ${currentView === 'stock_manager' ? 'active' : ''}`}
                        onClick={() => onViewChange('stock_manager')}
                    >
                        <Warehouse size={20} />
                        <span>Stock</span>
                    </button>
                </nav>

                <button className="btn btn-primary new-order-btn" onClick={onNewOrder}>
                    <PlusCircle size={20} />
                    <span>New Order</span>
                </button>
            </div>
        </header>
    )
}

export default Header
