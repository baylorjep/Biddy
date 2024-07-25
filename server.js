const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

// Set up Express app
const app = express();
const port = 3000;

// SQL Server client configuration for Google Cloud SQL
const config = {
  user: 'sqlserver',
  password: 'wawawa',
  server: '34.19.32.205', // You can use 'localhost\\instance' to connect to named instance
  database: 'bidi',
  options: {
    encrypt: true, // Use encryption
    enableArithAbort: true // Needed for Azure compatibility
  }
};

// Middleware to parse incoming form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

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
    VALUES (@customerName, @serviceTitle, @serviceCategory, @serviceDescription, @serviceDate, @priceRange, @additionalComments)
  `;

  try {
    let pool = await sql.connect(config);
    await pool.request()
      .input('customerName', sql.NVarChar, customerName)
      .input('serviceTitle', sql.NVarChar, serviceTitle)
      .input('serviceCategory', sql.NVarChar, serviceCategory)
      .input('serviceDescription', sql.NVarChar, serviceDescription)
      .input('serviceDate', sql.Date, serviceDate)
      .input('priceRange', sql.NVarChar, priceRange)
      .input('additionalComments', sql.NVarChar, additionalComments)
      .query(query);

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
    let pool = await sql.connect(config);
    let result = await pool.request().query(query);
    res.json(result.recordset); // Send the data as JSON
  } catch (err) {
    console.error('Database Error:', err.message);
    console.error(err.stack);
    res.status(500).send('Error fetching data from the database.');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
