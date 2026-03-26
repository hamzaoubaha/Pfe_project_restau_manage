import { useState } from 'react'
import { Clock, CheckCircle, ChefHat, Package, Trash2, Edit2, User, X } from 'lucide-react'
import OrderTimer from './pos/OrderTimer'
import './OrderCard.css'

function OrderCard({ order, onUpdateStatus, onDelete, onEdit, isNew, onDismissSuccess, index = 0 }) {
    const [isLeaving, setIsLeaving] = useState(false)

    // Status Config
    const statusConfig = {
        pending: { icon: Clock, color: '#F59E0B', label: 'Pending' },
        preparing: { icon: ChefHat, color: '#3B82F6', label: 'Preparing' },
        ready: { icon: CheckCircle, color: '#10B981', label: 'Ready' },
        completed: { icon: Package, color: '#6B7280', label: 'Completed' },
        cancelled: { icon: Trash2, color: '#EF4444', label: 'Cancelled' }
    }

    const currentStatus = statusConfig[order.status] || statusConfig.pending
    const StatusIcon = currentStatus.icon

    // Check if order is editable
    const lockTime = order.lockedAt || new Date(new Date(order.timestamp).getTime() + 5 * 60000).toISOString()

    const handleEdit = () => {
        alert('Edit functionality coming soon!')
    }

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this order?')) {
            setIsLeaving(true)
            setTimeout(() => onDelete(order.id), 500)
        }
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className={`order-card ${isLeaving ? 'slide-out' : 'animate-fade-in'}`} style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="order-header">
                <div className="table-badge">
                    <span className="table-label">Table</span>
                    <span className="table-number">{order.tableNumber}</span>
                </div>
                <div className="order-meta">
                    <div className="meta-item">
                        <User size={14} />
                        <span>{order.guestCount || 1}</span>
                    </div>
                    <span className="time-display">{formatTime(order.timestamp)}</span>
                </div>
            </div>

            <div className="order-items">
                {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                        <div className="item-qty">{item.quantity}x</div>
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                ))}
            </div>

            {isNew && (
                <div className="success-notification animate-slide-in">
                    <div className="success-content">
                        <span>🚀 Order Placed Successfully! You have 5 minutes to edit.</span>
                    </div>
                    <button className="dismiss-btn" onClick={onDismissSuccess}>
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="order-footer">
                <div className="total-row">
                    <span>Total</span>
                    <span className="total-amount">${order.total ? order.total.toFixed(2) : '0.00'}</span>
                </div>

                {order.status === 'pending' && (
                    <div className="timer-wrapper">
                        <OrderTimer lockedAt={lockTime} onEdit={() => onEdit(order)} />
                    </div>
                )}

                <div className="actions-row">
                    <div className="status-selector-wrapper">
                        <StatusIcon size={16} color={currentStatus.color} style={{ position: 'absolute', left: '10px', zIndex: 1 }} />
                        <select
                            className="status-select"
                            value={order.status}
                            onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                            style={{ color: currentStatus.color, borderColor: currentStatus.color }}
                        >
                            {Object.keys(statusConfig).map(status => (
                                <option key={status} value={status}>
                                    {statusConfig[status].label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button className="icon-btn delete-btn" onClick={handleDelete} title="Delete">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OrderCard
