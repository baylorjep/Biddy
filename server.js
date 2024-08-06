const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const supabase = require('./supabaseClient');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;  // Define salt rounds for bcrypt

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
}));

// Serve static files
app.use(express.static('public'));

// Routes
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Log received email and password for debugging
    console.log('Login attempt:', { email, password });

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !user) {
        console.error('User not found or error:', error);
        return res.status(401).send('Invalid email or password');
    }

    // Log the retrieved user for debugging
    console.log('Retrieved user:', user);

    const match = await bcrypt.compare(password, user.password);

    // Log the result of the password comparison
    console.log('Password match:', match);

    if (match) {
        req.session.userId = user.userid;
        res.redirect('/IndividualLandingPage.html');
    } else {
        res.status(401).send('Invalid email or password');
    }
});

app.post('/createaccount', async (req, res) => {
    const { firstname, lastname, email, password, phone, category } = req.body;

    // Log incoming data for debugging
    console.log('Received data:', { firstname, lastname, email, password, phone, category });

    try {
        const hashedPassword = bcrypt.hashSync(password, saltRounds);  // Use synchronous hashing for simplicity

        const { data, error } = await supabase
            .from('users')
            .insert([
                { firstname, lastname, email, password: hashedPassword, phone, category }
            ]);

        if (error) {
            console.error('Error inserting user into database:', error);
            return res.status(500).send('Error creating account');
        }

        res.redirect('/');
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Server error');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.userId) {
        res.sendFile(__dirname + '/public/dashboard.html');
    } else {
        res.redirect('/');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
