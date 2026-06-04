const express = require('express');
const cors = require('cors');

const { getAllOrders, createOrder, updateOrder, deleteOrder } = require('./models/Order');
const { getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } = require('./models/MenuItem');
const { getAllStockItems, createStockItem, updateStockItem, deleteStockItem, getLowStockItems } = require('./models/StockItem');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// -------------------------------------------------------
// Order Routes
// -------------------------------------------------------

// GET all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await getAllOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE new order
app.post('/api/orders', async (req, res) => {
    try {
        const savedOrder = await createOrder(req.body);
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE order (status, items, etc.)
app.put('/api/orders/:id', async (req, res) => {
    try {
        const updatedOrder = await updateOrder(req.params.id, req.body);
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE order
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await deleteOrder(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// -------------------------------------------------------
// Menu Routes
// -------------------------------------------------------

// GET all menu items
app.get('/api/menu', async (req, res) => {
    try {
        const items = await getAllMenuItems();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE new menu item
app.post('/api/menu', async (req, res) => {
    try {
        const savedItem = await createMenuItem(req.body);
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE menu item
app.put('/api/menu/:id', async (req, res) => {
    try {
        const updatedItem = await updateMenuItem(req.params.id, req.body);
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE menu item
app.delete('/api/menu/:id', async (req, res) => {
    try {
        await deleteMenuItem(req.params.id);
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// -------------------------------------------------------
// Stock Routes (Gestion de Stock)
// -------------------------------------------------------

// GET all stock items
app.get('/api/stock', async (req, res) => {
    try {
        const items = await getAllStockItems();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET low stock items (alerts)
app.get('/api/stock/low', async (req, res) => {
    try {
        const items = await getLowStockItems();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE a new stock item
app.post('/api/stock', async (req, res) => {
    try {
        const savedItem = await createStockItem(req.body);
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE a stock item (restock / edit)
app.put('/api/stock/:id', async (req, res) => {
    try {
        const updatedItem = await updateStockItem(req.params.id, req.body);
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a stock item
app.delete('/api/stock/:id', async (req, res) => {
    try {
        await deleteStockItem(req.params.id);
        res.json({ message: 'Stock item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// -------------------------------------------------------
// Start Server
// -------------------------------------------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('✅ Connected to MySQL database');
});
