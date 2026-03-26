import { useState } from 'react'
import { Users, Hash, ArrowRight } from 'lucide-react'
import './POS.css'

function OrderSetup({ onNext }) {
    const [tableNumber, setTableNumber] = useState('')
    const [guestCount, setGuestCount] = useState(2)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (tableNumber && guestCount > 0) {
            onNext({ tableNumber: parseInt(tableNumber), guestCount })
        }
    }

    return (
        <div className="order-setup-container animate-fade-in">
            <form className="setup-card" onSubmit={handleSubmit}>
                <h2 className="setup-title gradient-text">Start New Order</h2>

                <div className="form-group">
                    <label>
                        <Hash size={18} className="label-icon" />
                        Table Number
                    </label>
                    <input
                        type="number"
                        value={tableNumber}
                        onChange={e => setTableNumber(e.target.value)}
                        placeholder="e.g. 5"
                        required
                        autoFocus
                        className="setup-input"
                    />
                </div>

                <div className="form-group">
                    <label style={{ justifyContent: 'center' }}>
                        <Users size={18} className="label-icon" />
                        Number of Guests
                    </label>
                    <div className="guest-selector">
                        <button type="button" className="btn-circle" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>−</button>
                        <span className="guest-count">{guestCount}</span>
                        <button type="button" className="btn-circle" onClick={() => setGuestCount(guestCount + 1)}>+</button>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary setup-submit-btn">
                    Start Ordering <ArrowRight size={20} />
                </button>
            </form>
        </div>
    )
}

export default OrderSetup
