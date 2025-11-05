const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Budget = require('../models/Budget');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Home page
router.get('/', (req, res) => {
    res.render('index');
});

// Register page
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });
        req.session.user = user;
        res.redirect('/dashboard');
    } catch (err) {
        res.render('register', { error: 'Registration failed' });
    }
});

// Login page
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await user.matchPassword(password))) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        req.session.user = user;
        res.redirect('/dashboard');
    } catch (err) {
        res.render('login', { error: 'Login failed' });
    }
});

// Dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const transactions = await Budget.find({ user: req.session.user._id }).sort({ date: -1 });
        res.render('dashboard', { user: req.session.user, transactions });
    } catch (err) {
        res.redirect('/');
    }
});

// Add transaction
router.post('/add-transaction', isAuthenticated, async (req, res) => {
    try {
        const { title, amount, type, category, description } = req.body;
        await Budget.create({
            user: req.session.user._id,
            title,
            amount,
            type,
            category,
            description
        });
        res.redirect('/dashboard');
    } catch (err) {
        res.redirect('/dashboard');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
