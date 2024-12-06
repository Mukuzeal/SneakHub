document.addEventListener('DOMContentLoaded', function() {
    // Load cart items from localStorage or session
    loadCartItems();
    
    // Initialize event listeners
    document.getElementById('complete-order').addEventListener('click', handleCheckout);
    document.getElementById('apply-discount').addEventListener('click', applyDiscount);
    
    // Update totals initially
    updateTotals();
});

function loadCartItems() {
    const orderItems = document.getElementById('order-items');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    cart.forEach(item => {
        const itemElement = createOrderItemElement(item);
        orderItems.appendChild(itemElement);
    });
}

function createOrderItemElement(item) {
    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="item-details">
            <div>${item.name}</div>
            <div>Size: ${item.size}</div>
            <div>Quantity: ${item.quantity}</div>
        </div>
        <div class="item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
    `;
    return div;
}

function updateTotals() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `₱${subtotal.toFixed(2)}`;
}

function applyDiscount() {
    const discountCode = document.getElementById('discount-code').value;
    // Implement discount logic here
}

async function handleCheckout() {
    const formData = {
        email: document.getElementById('email').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        address: document.getElementById('address').value,
        apartment: document.getElementById('apartment').value,
        city: document.getElementById('city').value,
        region: document.getElementById('region').value,
        postal: document.getElementById('postal').value,
        phone: document.getElementById('phone').value,
        paymentMethod: document.querySelector('input[name="payment"]:checked').value
    };

    // Validate form data
    if (!validateForm(formData)) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                window.location.href = '/order-success';
            }
        } else {
            throw new Error('Checkout failed');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('There was an error processing your order. Please try again.');
    }
}

function validateForm(formData) {
    // Add validation logic here
    return true;
}
