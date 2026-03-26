const pool = require('../db');

// Format a raw DB row into the API response shape
function formatItem(row) {
    let parsedIngredients = [];
    if (typeof row.ingredients === 'string') {
        try { parsedIngredients = JSON.parse(row.ingredients); } catch (e) { parsedIngredients = []; }
    } else if (Array.isArray(row.ingredients)) {
        parsedIngredients = row.ingredients;
    } else if (row.ingredients) {
        parsedIngredients = [row.ingredients];
    }

    return {
        id: row.id,
        name: row.name,
        price: parseFloat(row.price),
        description: row.description,
        ingredients: parsedIngredients,
        imageUrl: row.imageUrl,
        category: row.category,
        available: row.available === 1
    };
}

// GET all menu items
async function getAllMenuItems() {
    const [rows] = await pool.query('SELECT * FROM menu_items');
    return rows.map(formatItem);
}

// CREATE a new menu item
async function createMenuItem(data) {
    const { name, price, description, ingredients, imageUrl, category, available } = data;

    const [result] = await pool.query(
        `INSERT INTO menu_items (name, price, description, ingredients, imageUrl, category, available)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            name,
            price,
            description || null,
            JSON.stringify(ingredients || []),
            imageUrl || 'https://placehold.co/400x300?text=No+Image',
            category || 'Main',
            available !== undefined ? (available ? 1 : 0) : 1
        ]
    );

    const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);
    return formatItem(rows[0]);
}

// UPDATE a menu item
async function updateMenuItem(id, data) {
    const allowedFields = ['name', 'price', 'description', 'imageUrl', 'category', 'available'];
    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            setClauses.push(`\`${field}\` = ?`);
            values.push(field === 'available' ? (data[field] ? 1 : 0) : data[field]);
        }
    }

    // Handle ingredients separately (needs JSON.stringify)
    if (data.ingredients !== undefined) {
        setClauses.push('`ingredients` = ?');
        values.push(JSON.stringify(data.ingredients));
    }

    if (setClauses.length > 0) {
        values.push(id);
        await pool.query(`UPDATE menu_items SET ${setClauses.join(', ')} WHERE id = ?`, values);
    }

    const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [id]);
    return rows.length > 0 ? formatItem(rows[0]) : null;
}

// DELETE a menu item
async function deleteMenuItem(id) {
    await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);
}

module.exports = { getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
