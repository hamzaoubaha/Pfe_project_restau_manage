const mysql = require('mysql2/promise');

// -------------------------------------------------------
// MySQL Connection Pool
// Change host/user/password/database if your setup differs
// -------------------------------------------------------
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',          // Change if you have a password set
    database: 'restaurant',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
