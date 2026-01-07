const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping string ID for compatibility with existing frontend
    title: { type: String, required: true },
    medium: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String }, // Optional detailed description
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
