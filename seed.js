const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const artworks = [
    {
        id: 'moonlit-dreams',
        title: 'Moonlit Dreams',
        medium: 'Gouache on Canvas',
        price: 4500,
        image: 'art1.png',
        description: 'A serene night scene captured in gouache.'
    },
    {
        id: 'silent-gaze',
        title: 'Silent Gaze',
        medium: 'Charcoal Sketch',
        price: 2500,
        image: 'Screenshot 2026-01-06 031341.png',
        description: 'An expressive charcoal portrait.'
    },
    {
        id: 'ethereal',
        title: 'Ethereal',
        medium: 'Mixed Media',
        price: 5500,
        image: 'WhatsApp Image 2024-02-06 at 16.23.25_75bbb31d.jpg',
        description: 'Abstract mixed media composition.'
    },
    {
        id: 'cosmic-dream',
        title: 'Cosmic Dream',
        medium: 'Oil on Canvas',
        price: 6000,
        image: 'Screenshot 2026-01-06 031606.png',
        description: 'Vibrant oil painting of the cosmos.'
    },
    {
        id: 'moon-boy',
        title: 'Moon Boy',
        medium: 'Original Print',
        price: 1500,
        image: 'Screenshot 2026-01-06 030828.png',
        description: 'Limited edition print.'
    },
    {
        id: 'golden-forest',
        title: 'Golden Forest',
        medium: 'Oil on Canvas',
        price: 7000,
        image: 'Screenshot 2026-01-06 032057.png',
        description: 'Autumn forest landscape.'
    }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kittzweb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert new products
        await Product.insertMany(artworks);
        console.log('Seeded database with artworks');

        process.exit(0);
    })
    .catch(err => {
        console.error('Error seeding database:', err);
        process.exit(1);
    });
