const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [{
        productId: String,
        title: String,
        price: Number,
        quantity: Number
    }],
    totalAmount: Number,
    paymentMethod: String,
    status: { type: String, default: 'pending' },
    customer: {
        name: String,
        email: String,
        phone: String
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
