import './OrderList.css'
import OrderCard from './OrderCard'
import { ClipboardList } from 'lucide-react'

function OrderList({ orders, onUpdateStatus, onDelete, onEdit, newOrderId, onDismissSuccess }) {
    const sortedOrders = [...orders].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    )

    return (
        <div className="order-list">
            <h2 className="section-title">
                <span>Active Orders</span>
                <span className="order-count">{orders.length} orders</span>
            </h2>

            {sortedOrders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><ClipboardList size={48} strokeWidth={1} /></div>
                    <h3>No orders yet</h3>
                    <p>Click "New Order" to create your first order</p>
                </div>
            ) : (
                <div className="orders-grid">
                    {sortedOrders.map((order, index) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onUpdateStatus={onUpdateStatus}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            index={index} // Stagger animation
                            isNew={order.id === newOrderId || order._id === newOrderId}
                            onDismissSuccess={onDismissSuccess}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default OrderList
