// Cart Management System
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    init() {
        this.updateCartBadge();
        if (window.location.pathname.includes('cart.html')) {
            this.renderCart();
            this.setupCheckout();
        }
    }

    loadCart() {
        const cart = localStorage.getItem('kirti4arts_cart');
        return cart ? JSON.parse(cart) : [];
    }

    saveCart() {
        localStorage.setItem('kirti4arts_cart', JSON.stringify(this.items));
        this.updateCartBadge();
    }

    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: item.id,
                title: item.title,
                medium: item.medium,
                price: item.price,
                image: item.image,
                quantity: 1
            });
        }

        this.saveCart();
        this.showNotification(`${item.title} added to cart!`);
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.renderCart();
        this.showNotification('Item removed from cart', 'warning');
    }

    updateQuantity(itemId, newQuantity) {
        if (newQuantity < 1) {
            this.removeItem(itemId);
            return;
        }

        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.renderCart();
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTax() {
        return this.getTotal() * 0.18; // 18% GST
    }

    getFinalTotal() {
        return this.getTotal() + this.getTax();
    }

    updateCartBadge() {
        const badge = document.getElementById('cart-count');
        if (badge) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    renderCart() {
        const container = document.getElementById('cart-items-container');
        const emptyMessage = document.getElementById('empty-cart-message');

        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = '';
            if (emptyMessage) emptyMessage.style.display = 'block';
            this.updateSummary();
            return;
        }

        if (emptyMessage) emptyMessage.style.display = 'none';

        container.innerHTML = this.items.map(item => `
            <div class="cart-item glass" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.title}</h3>
                    <p>${item.medium}</p>
                    <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item-btn" onclick="cart.removeItem('${item.id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');

        this.updateSummary();
    }

    updateSummary() {
        const subtotal = this.getTotal();
        const tax = this.getTax();
        const total = this.getFinalTotal();

        const subtotalEl = document.getElementById('cart-subtotal');
        const taxEl = document.getElementById('cart-tax');
        const totalEl = document.getElementById('cart-total');

        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        if (taxEl) taxEl.textContent = `₹${tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }

    setupCheckout() {
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length === 0) {
                    this.showNotification('Your cart is empty!', 'warning');
                    return;
                }

                // Show payment modal instead of directly opening WhatsApp
                this.openPaymentModal();
            });
        }

        // Setup Payment Modal Listeners
        this.setupPaymentModalListeners();
    }

    openPaymentModal() {
        const modal = document.getElementById('payment-modal');
        const totalEl = document.getElementById('payment-total');

        if (modal && totalEl) {
            totalEl.textContent = `₹${this.getFinalTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            modal.classList.add('active');
        }
    }

    closePaymentModal() {
        const modal = document.getElementById('payment-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    setupPaymentModalListeners() {
        const modal = document.getElementById('payment-modal');
        const closeBtn = document.getElementById('close-payment');
        const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
        const proceedBtn = document.getElementById('proceed-payment');
        const confirmCheckbox = document.getElementById('payment-confirm-checkbox');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePaymentModal());
        }

        // Close on clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closePaymentModal();
                }
            });
        }

        // Switch payment forms
        paymentOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                // Hide all forms
                document.querySelectorAll('.payment-form').forEach(form => form.classList.remove('active'));

                // Show selected form
                const method = e.target.value;
                const formId = `${method}-form`;
                const form = document.getElementById(formId);
                if (form) {
                    form.classList.add('active');
                }
            });
        });

        // Enable/Disable Proceed Button based on checkbox
        if (confirmCheckbox && proceedBtn) {
            confirmCheckbox.addEventListener('change', (e) => {
                proceedBtn.disabled = !e.target.checked;
            });
        }

        // Proceed Payment Button
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                if (!proceedBtn.disabled) {
                    this.processPayment();
                }
            });
        }
    }

    processPayment() {
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
        const confirmCheckbox = document.getElementById('payment-confirm-checkbox');

        if (!confirmCheckbox.checked) {
            this.showNotification('Please confirm that you have made the payment', 'warning');
            return;
        }

        let paymentDetails = `Method: ${selectedMethod.toUpperCase()} (Direct Transfer)\nUser Status: Payment Completed`;

        this.closePaymentModal();
        this.showNotification('Order placed! Redirecting to WhatsApp for proof...', 'success');

        // Create WhatsApp message with payment details
        const message = this.createWhatsAppMessage(paymentDetails);
        const whatsappUrl = `https://wa.me/918810426680?text=${encodeURIComponent(message)}`;

        // Small delay to show notification
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            // Reset checkbox
            if (confirmCheckbox) confirmCheckbox.checked = false;
            const proceedBtn = document.getElementById('proceed-payment');
            if (proceedBtn) proceedBtn.disabled = true;
        }, 1500);
    }

    createWhatsAppMessage(paymentDetails = '') {
        let message = "Hi Kirti! I'd like to purchase the following artworks:\n\n";

        this.items.forEach((item, index) => {
            message += `${index + 1}. ${item.title}\n`;
            message += `   Medium: ${item.medium}\n`;
            message += `   Price: ₹${item.price.toLocaleString('en-IN')}\n`;
            message += `   Quantity: ${item.quantity}\n\n`;
        });

        message += `Subtotal: ₹${this.getTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
        message += `Tax (18% GST): ₹${this.getTax().toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
        message += `Total: ₹${this.getFinalTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\n`;

        if (paymentDetails) {
            message += `Payment Details:\n${paymentDetails}\n\n`;
        }

        message += "Please let me know the next steps!";

        return message;
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Export for use in other scripts
window.cart = cart;
