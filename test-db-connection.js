const mysql = require('mysql2/promise');

const config = {
  host: '34.19.32.205', // Public IP address of your Google Cloud SQL instance
  user: 'sqlserver',
  password: 'wawawa',
  database: 'bidi'
};

async function testConnection() {
  try {
    const connection = await mysql.createConnection(config);
    console.log('Connected to database');
    await connection.end();
  } catch (err) {
    console.error('Database Error:', err.message);
    console.error(err.stack);
  }
}

testConnection();
