const pool = require('./db');

async function seed() {
    try {
        console.log('Seeding Database with Moroccan Snack data...');

        await pool.query('DELETE FROM order_items');
        await pool.query('DELETE FROM orders');
        await pool.query('DELETE FROM menu_items');

        const menuItems = [
            {
                name: 'طاكوس',
                price: 35,
                description: 'طاكوس شهي محشو باللحم المفروم والخضر الطازجة وصوص حار',
                ingredients: ['tortilla', 'لحم مفروم', 'خس', 'طماطم', 'صوص حار', 'جبن'],
                category: 'Main',
                imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=400&h=300'
            },
            {
                name: 'برجر',
                price: 30,
                description: 'برجر كلاسيكي بقطعة لحم بقري طازجة مع الجبن والخس والطماطم',
                ingredients: ['خبز برجر', 'لحم بقري', 'جبن', 'خس', 'طماطم', 'خيار', 'كاتشب'],
                category: 'Main',
                imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400&h=300'
            },
            {
                name: 'بيتزا',
                price: 45,
                description: 'بيتزا مارغريتا بعجينة طازجة وصوص طماطم وجبن موزاريلا',
                ingredients: ['عجينة', 'صوص طماطم', 'موزاريلا', 'ريحان'],
                category: 'Main',
                imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&q=80&w=400&h=300'
            },
            {
                name: 'بانيني',
                price: 25,
                description: 'بانيني مشوي محشو بالدجاج والجبن والخضر المشوية',
                ingredients: ['خبز بانيني', 'دجاج', 'جبن', 'فلفل', 'بصل', 'صوص'],
                category: 'Main',
                imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57fbe?auto=format&fit=crop&q=80&w=400&h=300'
            },
            {
                name: 'بطاطس مقلية',
                price: 15,
                description: 'بطاطس مقلية هشة ومقرمشة مع الملح والتوابل',
                ingredients: ['بطاطس', 'زيت', 'ملح', 'توابل'],
                category: 'Appetizers',
                imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400&h=300'
            },
            {
                name: 'مشروب غازي',
                price: 7,
                description: 'مشروب غازي مثلج منعش - كوكا كولا أو فانتا أو سبرايت',
                ingredients: ['مشروب غازي', 'ثلج'],
                category: 'Drinks',
                imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400&h=300'
            }
        ];

        for (const item of menuItems) {
            await pool.query(
                'INSERT INTO menu_items (name, price, description, ingredients, imageUrl, category, available) VALUES (?, ?, ?, ?, ?, ?, 1)',
                [item.name, item.price, item.description, JSON.stringify(item.ingredients), item.imageUrl, item.category]
            );
        }

        // Sample order with Moroccan prices
        const [ordersResult] = await pool.query(
            "INSERT INTO orders (tableNumber, guestCount, servingPreference, status, total) VALUES (?, ?, ?, ?, ?)",
            [3, 2, 'all_together', 'pending', 65]
        );
        const order1Id = ordersResult.insertId;

        await pool.query(
            'INSERT INTO order_items (order_id, name, quantity, price, category) VALUES ?',
            [[
                [order1Id, 'برجر', 1, 30, 'Main'],
                [order1Id, 'بطاطس مقلية', 1, 15, 'Appetizers'],
                [order1Id, 'مشروب غازي', 2, 7, 'Drinks']
            ]]
        );

        console.log('✅ Seeding completed with Moroccan Snack data!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
