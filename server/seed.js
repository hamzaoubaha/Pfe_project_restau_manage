const pool = require('./db');

async function seed() {
    try {
        console.log('Seeding Database...');

        await pool.query('DELETE FROM order_items');
        await pool.query('DELETE FROM orders');
        await pool.query('DELETE FROM menu_items');

        const menuItems = [
            { name: 'Classic Burger', price: 12.99, description: 'Beef patty with cheese, lettuce, and tomato', ingredients: ['bun', 'beef', 'cheese', 'lettuce', 'tomato'], category: 'Main', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400&h=300' },
            { name: 'Margherita Pizza', price: 14.50, description: 'Classic tomato and mozzarella pizza', ingredients: ['dough', 'tomato sauce', 'mozzarella', 'basil'], category: 'Main', imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&q=80&w=400&h=300' },
            { name: 'Caesar Salad', price: 8.99, description: 'Fresh romaine lettuce with Caesar dressing and croutons', ingredients: ['romaine', 'croutons', 'parmesan', 'caesar dressing'], category: 'Appetizers', imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=400&h=300' },
            { name: 'Iced Latte', price: 4.50, description: 'Espresso with cold milk and ice', ingredients: ['espresso', 'milk', 'ice'], category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400&h=300' },
            { name: 'Cheesecake', price: 6.99, description: 'New York style cheesecake', ingredients: ['cream cheese', 'graham cracker', 'sugar'], category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&q=80&w=400&h=300' }
        ];

        for (const item of menuItems) {
            await pool.query(
                'INSERT INTO menu_items (name, price, description, ingredients, imageUrl, category, available) VALUES (?, ?, ?, ?, ?, ?, 1)',
                [item.name, item.price, item.description, JSON.stringify(item.ingredients), item.imageUrl, item.category]
            );
        }

        const [ordersResult] = await pool.query(
            "INSERT INTO orders (tableNumber, guestCount, servingPreference, status, total) VALUES (?, ?, ?, ?, ?)",
            [5, 2, 'all_together', 'pending', 21.98]
        );
        const order1Id = ordersResult.insertId;

        await pool.query(
            'INSERT INTO order_items (order_id, name, quantity, price, category) VALUES ?',
            [[
                [order1Id, 'Classic Burger', 1, 12.99, 'Main'],
                [order1Id, 'Caesar Salad', 1, 8.99, 'Appetizers']
            ]]
        );

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
