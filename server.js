const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Use promise-based MySQL

// Set up Express app
const app = express();
const port = 3000;

// MySQL configuration for Google Cloud SQL
const config = {
  host: '34.19.32.205', // Your Cloud SQL IP address
  user: 'sqlserver',
  password: 'wawawa',
  database: 'bidi'
};

// Middleware to parse incoming form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

// CORS configuration
const cors = require('cors');
app.use(cors());

// Endpoint to handle form submissions
app.post('/submit_service_request', async (req, res) => {
  const {
    customerName,
    serviceTitle,
    serviceCategory,
    serviceDescription,
    serviceDate,
    priceRange,
    additionalComments,
  } = req.body;

  const query = `
    INSERT INTO request (custid, title, category, description, date, price, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const connection = await mysql.createConnection(config);
    await connection.execute(query, [
      customerName,
      serviceTitle,
      serviceCategory,
      serviceDescription,
      serviceDate,
      priceRange,
      additionalComments
    ]);
    await connection.end();
    res.status(200).send('Service request submitted successfully.');
  } catch (err) {
    console.error('Database Error:', err.message);
    console.error(err.stack);
    res.status(500).send('Error saving data to the database.');
  }
});

// Endpoint for fetching request data
app.get('/fetch_service_requests', async (req, res) => {
  const query = 'SELECT * FROM request';

  try {
    const connection = await mysql.createConnection(config);
    const [rows] = await connection.execute(query);
    await connection.end();
    res.json(rows); // Send the data as JSON
  } catch (err) {
    console.error('Database Error:', err.message);
    console.error(err.stack);
    res.status(500).send('Error fetching data from the database.');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
