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
    const trimmedEmail = email.trim().toLowerCase();

    console.log('Login attempt:', { email: trimmedEmail, password });

    try {
        const { data: user, error } = await supabase
            .rpc('verify_user', { _email: trimmedEmail, _password: password })
            .single();

        console.log('Supabase function result:', { user, error });

        if (error || !user) {
            console.error('Error retrieving user:', error);
            return res.status(401).send('Invalid email or password');
        }

        const match = await bcrypt.compare(password, user.password);

        console.log('Password match:', match);

        if (match) {
            req.session.userId = user.userid;
            res.redirect('/Individual/IndividualLandingPage.html');
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).send('Server error');
    }
});

app.post('/createaccount', async (req, res) => {
    const { firstname, lastname, email, password, phone, category } = req.body;

    console.log('Received data:', { firstname, lastname, email, password, phone, category });

    try {
        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        const { data: userId, error } = await supabase
            .rpc('create_user', {
                _firstname: firstname,
                _lastname: lastname,
                _email: email,
                _password: hashedPassword,
                _phone: phone,
                _category: category
            });

        if (error) {
            console.error('Error inserting user into database:', error);
            return res.status(500).send('Error creating account');
        }

        console.log('Inserted user ID:', userId);

        res.redirect('/');
    } catch (err) {
        console.error('Error creating user:', err);
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
