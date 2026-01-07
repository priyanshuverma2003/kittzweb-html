const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Product = require('./models/Product');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kittzweb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes

// GET /api/products - Fetch all artworks
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/products - Add new artwork (Admin)
app.post('/api/products', async (req, res) => {
    const product = new Product({
        id: req.body.id,
        title: req.body.title,
        medium: req.body.medium,
        price: req.body.price,
        image: req.body.image,
        description: req.body.description
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST /api/orders - Create new order
const Order = require('./models/Order');
app.post('/api/orders', async (req, res) => {
    const order = new Order(req.body);
    try {
        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html')); // Assuming profile.html is your main entry
});

// Fallback for other HTML pages
app.get('/:page', (req, res) => {
    const page = req.params.page;
    if (page.endsWith('.html')) {
        res.sendFile(path.join(__dirname, page));
    } else {
        res.sendFile(path.join(__dirname, `${page}.html`));
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
