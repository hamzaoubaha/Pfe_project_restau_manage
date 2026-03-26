import { useState, useEffect } from 'react'

function OrderTimer({ lockedAt, onEdit }) {
    const [timeLeft, setTimeLeft] = useState(0)
    const [canEdit, setCanEdit] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime()
            const lockTime = new Date(lockedAt).getTime()
            const distance = lockTime - now

            if (distance < 0) {
                clearInterval(interval)
                setCanEdit(false)
                setTimeLeft(0)
            } else {
                setTimeLeft(distance)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [lockedAt])

    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

    if (!canEdit) return null

    return (
        <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            color: '#fbbf24',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.9rem',
            border: '1px solid rgba(251, 191, 36, 0.2)'
        }}>
            <span>⏳ Editing allowed for: <strong>{minutes}:{seconds < 10 ? '0' + seconds : seconds}</strong></span>
            <button
                onClick={onEdit}
                style={{
                    background: '#fbbf24',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                Edit Order
            </button>
        </div>
    )
}

export default OrderTimer
