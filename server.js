// PostgreSQL client configuration
//const client = new Client({
  //user: 'postgres',
  //host: 'localhost',
  //database: 'biddy',
  //password: 'sidewinders',
  //port: 5432,
//});

const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');

// Set up Express app
const app = express();
const port = 3000;

// AWS RDS PostgreSQL client configuration
const client = new Client({
  user: 'postgres',
  host: 'bidi-instance.c7uki0448fx9.us-east-1.rds.amazonaws.com',
  database: 'bidi_db', // Ensure this is the correct database name
  password: 'Pampara1',
  port: 5432, // Default PostgreSQL port
  ssl: {
    rejectUnauthorized: false // Accept self-signed certificates
  }
});

client.connect((err) => {
  if (err) {
    console.error('Connection Error:', err.stack);
  } else {
    console.log('Connected to the AWS RDS database.');
  }
});

// Middleware to parse incoming form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Endpoint to handle form submissions
app.post('/submit_service_request', (req, res) => {
  console.log('Received request body:', req.body);
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
    INSERT INTO request (custname, title, category, description, date, price, comments)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  client.query(
    query,
    [
      customerName,
      serviceTitle,
      serviceCategory,
      serviceDescription,
      serviceDate,
      priceRange,
      additionalComments,
    ],
    (err, result) => {
      if (err) {
        console.error('Database Error:', err.message);
        console.error(err.stack);
        res.status(500).send('Error saving data to the database.');
      } else {
        console.log('Database Insert Result:', result);
        res.status(200).send('Service request submitted successfully.');
      }
    }
  );
});

// Endpoint for fetching request data
app.get('/fetch_service_requests', (req, res) => {
  console.log('Fetching service requests...');
  const query = 'SELECT * FROM request';

  client.query(query, (err, result) => {
    if (err) {
      console.error('Database Error:', err.message);
      console.error(err.stack);
      res.status(500).send('Error fetching data from the database.');
    } else {
      console.log('Fetch Result:', result.rows);
      res.json(result.rows); // Send the data as JSON
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
