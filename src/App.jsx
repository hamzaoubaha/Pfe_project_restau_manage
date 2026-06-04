import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import MenuManager from './components/MenuManager'
import OrderList from './components/OrderList'
import StockManager from './components/StockManager'
// POS Components
import OrderSetup from './components/pos/OrderSetup'
import MenuBrowser from './components/pos/MenuBrowser'
import CartDrawer from './components/pos/CartDrawer'

function App() {
  // Views: 'dashboard', 'menu_manager', 'pos_setup', 'pos_ordering'
  const [view, setView] = useState('dashboard')
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])

  // POS State
  const [currentOrder, setCurrentOrder] = useState({
    tableNumber: '',
    guestCount: 1,
    items: [],
    servingPreference: 'all_together'
  })
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Fetch initial data
  useEffect(() => {
    fetchOrders()
    fetchMenu()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/orders')
      const data = await res.json()
      setOrders(data)
    } catch (err) { console.error(err) }
  }

  const fetchMenu = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/menu')
      const data = await res.json()
      setMenuItems(data)
    } catch (err) { console.error(err) }
  }

  // Edit Mode State
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [newOrderId, setNewOrderId] = useState(null) // For success notification

  const startNewOrder = (setupData) => {
    setEditingOrderId(null) // Reset edit mode
    setCurrentOrder({ ...currentOrder, ...setupData, items: [] })
    setView('pos_ordering')
  }

  const editOrder = (order) => {
    setEditingOrderId(order.id)
    setCurrentOrder({
      tableNumber: order.tableNumber,
      guestCount: order.guestCount,
      items: order.items,
      servingPreference: order.servingPreference || 'all_together'
    })
    setView('pos_ordering')
    setIsCartOpen(true)
  }

  const submitOrder = async () => {
    try {
      const orderPayload = {
        tableNumber: currentOrder.tableNumber,
        guestCount: currentOrder.guestCount,
        servingPreference: currentOrder.servingPreference,
        items: currentOrder.items,
        total: currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        lockedAt: new Date(Date.now() + 5 * 60000) // Lock in 5 mins
      }

      const url = editingOrderId
        ? `http://localhost:5001/api/orders/${editingOrderId}`
        : 'http://localhost:5001/api/orders'

      const method = editingOrderId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })

      if (response.ok) {
        const savedOrder = await response.json()
        setIsCartOpen(false)
        setView('dashboard')
        fetchOrders()

        // Success Notification Logic
        setNewOrderId(savedOrder._id || savedOrder.id)
        // Clear notification after 10 seconds if not dismissed
        setTimeout(() => setNewOrderId(null), 10000)
      }
    } catch (error) {
      console.error('Error submitting order', error)
    }
  }
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        )
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // --- Cart Functions ---
  const addToCart = (item) => {
    setCurrentOrder(prev => {
      const existingItem = prev.items.find(i => i.name === item.name);
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(i =>
            i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
          )
        };
      }
      return {
        ...prev,
        items: [...prev.items, { ...item, quantity: 1, price: item.price, category: item.category }]
      };
    });
  };

  const updateCartItem = (name, quantity) => {
    setCurrentOrder(prev => {
      if (quantity <= 0) {
        return { ...prev, items: prev.items.filter(i => i.name !== name) };
      }
      return {
        ...prev,
        items: prev.items.map(i => i.name === name ? { ...i, quantity } : i)
      };
    });
  };

  const removeFromCart = (name) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.filter(i => i.name !== name)
    }));
  };

  // --- Render Helpers ---
  const renderContent = () => {
    switch (view) {
      case 'menu_manager':
        return <MenuManager />
      case 'stock_manager':
        return <StockManager />
      case 'pos_setup':
        return <OrderSetup onNext={startNewOrder} />
      case 'pos_ordering':
        return (
          <>
            <MenuBrowser
              menuItems={menuItems}
              onAddToCart={addToCart}
              cart={currentOrder.items}
              onOpenCart={() => setIsCartOpen(true)}
            />
            {isCartOpen && (
              <CartDrawer
                cart={currentOrder.items}
                onClose={() => setIsCartOpen(false)}
                onUpdateQuantity={updateCartItem}
                onRemoveItem={removeFromCart}
                servingPreference={currentOrder.servingPreference}
                setServingPreference={(pref) => setCurrentOrder(prev => ({ ...prev, servingPreference: pref }))}
                onSubmit={submitOrder}
              />
            )}
          </>
        )
      case 'dashboard':
      default:
        return (
          <>
            <Dashboard orders={orders} />
            <div className="content-grid" style={{ marginTop: '2rem' }}>
              <OrderList
                orders={orders}
                onUpdateStatus={updateOrderStatus}
                onEdit={editOrder}
                newOrderId={newOrderId}
                onDismissSuccess={() => setNewOrderId(null)}
                onDelete={async (id) => {
                  await fetch(`http://localhost:5001/api/orders/${id}`, { method: 'DELETE' });
                  fetchOrders();
                }}
              />
            </div>
          </>
        )
    }
  }

  return (
    <div className="app">
      <Header
        onNewOrder={() => setView('pos_setup')}
        onViewChange={setView}
        currentView={view}
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
