import { Clock, ChefHat, CheckCircle, Package, DollarSign } from 'lucide-react'
import './Dashboard.css'

function Dashboard({ orders }) {
    const stats = {
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: orders.filter(o => o.status === 'completed').length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
    }

    return (
        <div className="dashboard animate-fade-in">
            <div className="stat-card stat-pending">
                <div className="stat-icon"><Clock size={32} /></div>
                <div className="stat-info">
                    <div className="stat-value">{stats.pending}</div>
                    <div className="stat-label">Pending</div>
                </div>
            </div>

            <div className="stat-card stat-preparing">
                <div className="stat-icon"><ChefHat size={32} /></div>
                <div className="stat-info">
                    <div className="stat-value">{stats.preparing}</div>
                    <div className="stat-label">Preparing</div>
                </div>
            </div>

            <div className="stat-card stat-ready">
                <div className="stat-icon"><CheckCircle size={32} /></div>
                <div className="stat-info">
                    <div className="stat-value">{stats.ready}</div>
                    <div className="stat-label">Ready</div>
                </div>
            </div>

            <div className="stat-card stat-completed">
                <div className="stat-icon"><Package size={32} /></div>
                <div className="stat-info">
                    <div className="stat-value">{stats.completed}</div>
                    <div className="stat-label">Completed</div>
                </div>
            </div>

            <div className="stat-card stat-revenue">
                <div className="stat-icon"><DollarSign size={32} /></div>
                <div className="stat-info">
                    <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
