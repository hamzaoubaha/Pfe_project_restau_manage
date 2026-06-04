const pool = require('../db');

// Format a raw DB row into the API response shape
function formatItem(row) {
    return {
        id: row.id,
        name: row.name,
        quantity: parseFloat(row.quantity),
        unit: row.unit,
        min_quantity: parseFloat(row.min_quantity),
        category: row.category,
        isLow: parseFloat(row.quantity) <= parseFloat(row.min_quantity),
        updated_at: row.updated_at,
        created_at: row.created_at
    };
}

// GET all stock items
async function getAllStockItems() {
    const [rows] = await pool.query('SELECT * FROM stock_items ORDER BY name ASC');
    return rows.map(formatItem);
}

// GET single stock item by ID
async function getStockItemById(id) {
    const [rows] = await pool.query('SELECT * FROM stock_items WHERE id = ?', [id]);
    return rows.length > 0 ? formatItem(rows[0]) : null;
}

// CREATE a new stock item
async function createStockItem(data) {
    const { name, quantity, unit, min_quantity, category } = data;

    const [result] = await pool.query(
        `INSERT INTO stock_items (name, quantity, unit, min_quantity, category)
         VALUES (?, ?, ?, ?, ?)`,
        [
            name,
            quantity || 0,
            unit || 'kg',
            min_quantity || 1,
            category || 'Ingrédients'
        ]
    );

    return await getStockItemById(result.insertId);
}

// UPDATE a stock item (restock or edit)
async function updateStockItem(id, data) {
    const allowedFields = ['name', 'quantity', 'unit', 'min_quantity', 'category'];
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
        await pool.query(
            `UPDATE stock_items SET ${setClauses.join(', ')} WHERE id = ?`,
            values
        );
    }

    return await getStockItemById(id);
}

// DELETE a stock item
async function deleteStockItem(id) {
    await pool.query('DELETE FROM stock_items WHERE id = ?', [id]);
}

// GET low stock items (quantity <= min_quantity)
async function getLowStockItems() {
    const [rows] = await pool.query(
        'SELECT * FROM stock_items WHERE quantity <= min_quantity ORDER BY quantity ASC'
    );
    return rows.map(formatItem);
}

module.exports = {
    getAllStockItems,
    getStockItemById,
    createStockItem,
    updateStockItem,
    deleteStockItem,
    getLowStockItems
};
