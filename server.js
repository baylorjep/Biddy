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
const bcrypt = require('bcrypt');
const session = require('express-session');

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

// Use sessions to manage user login state
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Endpoint to handle user registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Hash the password before saving it to the database
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO user_login (username, password)
    VALUES ($1, $2)
    RETURNING id
  `;

  try {
    const result = await client.query(query, [username, hashedPassword]);
    res.status(200).send('User registered successfully.');
  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).send('Error registering user.');
  }
});

// Endpoint to handle user login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM user_login WHERE username = $1';

  try {
    const result = await client.query(query, [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.userId = user.id;
        res.status(200).send('Login successful.');
      } else {
        res.status(400).send('Invalid username or password.');
      }
    } else {
      res.status(400).send('Invalid username or password.');
    }
  } catch (err) {
    console.error('Database Error:', err.message);
    res.status(500).send('Error logging in.');
  }
});

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
