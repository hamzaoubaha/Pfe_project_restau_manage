const pool = require('../db');

// Helper: fetch a single order with its items from MySQL
async function getOrderById(id) {
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orderRows.length === 0) return null;

    const order = orderRows[0];
    const [itemRows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);

    return formatOrder(order, itemRows);
}

// Format a raw DB row into the response shape the frontend expects
function formatOrder(order, items) {
    return {
        id: order.id,
        tableNumber: order.tableNumber,
        guestCount: order.guestCount,
        servingPreference: order.servingPreference,
        lockedAt: order.lockedAt,
        status: order.status,
        total: parseFloat(order.total),
        timestamp: order.timestamp,
        items: items.map(i => ({
            name: i.name,
            quantity: i.quantity,
            price: parseFloat(i.price),
            category: i.category
        }))
    };
}

// GET all orders (sorted newest first), each with its items array
async function getAllOrders() {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY timestamp DESC');
    if (orders.length === 0) return [];

    const orderIds = orders.map(o => o.id);
    const [allItems] = await pool.query(
        'SELECT * FROM order_items WHERE order_id IN (?)',
        [orderIds]
    );

    return orders.map(order => {
        const items = allItems.filter(i => i.order_id === order.id);
        return formatOrder(order, items);
    });
}

// CREATE a new order
async function createOrder(data) {
    const { tableNumber, guestCount, servingPreference, lockedAt, items, total } = data;

    const calculatedTotal = total ||
        (items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [result] = await pool.query(
        `INSERT INTO orders (tableNumber, guestCount, servingPreference, lockedAt, total)
         VALUES (?, ?, ?, ?, ?)`,
        [tableNumber, guestCount, servingPreference || 'all_together', lockedAt || null, calculatedTotal]
    );
    const newOrderId = result.insertId;

    if (items && items.length > 0) {
        const itemRows = items.map(i => [newOrderId, i.name, i.quantity, i.price, i.category || null]);
        await pool.query(
            'INSERT INTO order_items (order_id, name, quantity, price, category) VALUES ?',
            [itemRows]
        );
    }

    return await getOrderById(newOrderId);
}

// UPDATE an order (status, items, total, etc.)
async function updateOrder(id, data) {
    const allowedFields = ['tableNumber', 'guestCount', 'servingPreference', 'lockedAt', 'status', 'total'];
    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            setClauses.push(`\`${field}\` = ?`);
            values.push(data[field]);
        }
    }

    if (setClauses.length > 0) {
        values.push(id);
        await pool.query(`UPDATE orders SET ${setClauses.join(', ')} WHERE id = ?`, values);
    }

    // Replace items if a new items array was provided
    if (data.items) {
        await pool.query('DELETE FROM order_items WHERE order_id = ?', [id]);
        if (data.items.length > 0) {
            const itemRows = data.items.map(i => [id, i.name, i.quantity, i.price, i.category || null]);
            await pool.query(
                'INSERT INTO order_items (order_id, name, quantity, price, category) VALUES ?',
                [itemRows]
            );
        }
    }

    return await getOrderById(id);
}

// DELETE an order (order_items cascade-deleted by FK)
async function deleteOrder(id) {
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);
}

module.exports = { getAllOrders, createOrder, updateOrder, deleteOrder };
