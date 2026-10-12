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
import { defaultMenuItems } from './defaultMenu'

function App() {
  // Views: 'dashboard', 'menu_manager', 'pos_setup', 'pos_ordering'
  const [view, setView] = useState('dashboard')
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState(defaultMenuItems)

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
      if (Array.isArray(data) && data.length > 0) {
        setMenuItems(data)
      }
    } catch (err) {
      console.log('Using default Moroccan snack menu')
    }
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
    const calculatedTotal = currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const orderPayload = {
      tableNumber: currentOrder.tableNumber || 1,
      guestCount: currentOrder.guestCount || 1,
      servingPreference: currentOrder.servingPreference || 'all_together',
      items: currentOrder.items,
      total: calculatedTotal,
      status: 'pending',
      timestamp: new Date().toISOString(),
      lockedAt: new Date(Date.now() + 5 * 60000) // Lock in 5 mins
    }

    try {
      const url = editingOrderId
        ? `http://localhost:5001/api/orders/${editingOrderId}`
        : 'http://localhost:5001/api/orders'

      const method = editingOrderId ? 'PUT' : 'POST'

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const savedOrder = await response.json()
        setIsCartOpen(false)
        setView('dashboard')
        fetchOrders()
        setNewOrderId(savedOrder._id || savedOrder.id)
        setTimeout(() => setNewOrderId(null), 10000)
        return
      }
    } catch (error) {
      console.log('Backend unreachable, saving order to local state:', error.message)
    }

    // Local state fallback (works smoothly even if MySQL/Backend is offline)
    if (editingOrderId) {
      setOrders(prev => prev.map(o => o.id === editingOrderId ? { ...o, ...orderPayload, id: editingOrderId } : o))
      setNewOrderId(editingOrderId)
    } else {
      const localId = Date.now()
      const newLocalOrder = { ...orderPayload, id: localId }
      setOrders(prev => [newLocalOrder, ...prev])
      setNewOrderId(localId)
    }

    setIsCartOpen(false)
    setCurrentOrder({ tableNumber: '', guestCount: 1, items: [], servingPreference: 'all_together' })
    setView('dashboard')
    setTimeout(() => setNewOrderId(null), 10000)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    // Optimistic UI update first so it always works immediately
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)
      await fetch(`http://localhost:5001/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
    } catch (error) {
      console.log('Updated order locally')
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
                  setOrders(prev => prev.filter(o => (o._id || o.id) !== id && o.id !== id));
                  try {
                    await fetch(`http://localhost:5001/api/orders/${id}`, { method: 'DELETE' });
                  } catch (e) {
                    console.log('Deleted locally');
                  }
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
