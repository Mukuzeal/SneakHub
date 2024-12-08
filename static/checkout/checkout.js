document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    setupPaymentListeners();
    document.getElementById('complete-order').addEventListener('click', handleCheckout);
});

async function loadCartItems() {
    try {
        const response = await fetch('/api/checkout/items');
        const data = await response.json();
        
        if (data.items) {
            const orderItems = document.getElementById('order-items');
            orderItems.innerHTML = ''; // Clear existing items
            
            data.items.forEach(item => {
                const itemElement = createOrderItemElement(item);
                orderItems.appendChild(itemElement);
            });
            
            updateTotals(data.subtotal);
        }
    } catch (error) {
        console.error('Error loading cart items:', error);
    }
}

function createOrderItemElement(item) {
    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `
        <img src="/static/Uploads/pics/${item.product_image}" alt="${item.product_name}">
        <div class="item-details">
            <div class="item-name">${item.product_name}</div>
            <div class="item-quantity">Quantity: ${item.quantity}</div>
        </div>
        <div class="item-price">₱${(item.product_price * item.quantity).toFixed(2)}</div>
    `;
    return div;
}

function setupPaymentListeners() {
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            updateShippingFee(this.value);
        });
    });
}

function updateShippingFee(paymentMethod) {
    const shippingElement = document.getElementById('shipping');
    const isProvinceCOD = paymentMethod === 'cod-province';
    
    const shippingFee = isProvinceCOD ? 50 : 0;
    shippingElement.textContent = shippingFee === 0 ? 'FREE' : `₱${shippingFee.toFixed(2)}`;
    
    updateTotalWithShipping();
}

function updateTotalWithShipping() {
    const subtotalText = document.getElementById('subtotal').textContent;
    const subtotal = parseFloat(subtotalText.replace('₱', ''));
    const shippingText = document.getElementById('shipping').textContent;
    const shipping = shippingText === 'FREE' ? 0 : parseFloat(shippingText.replace('₱', ''));
    
    const total = subtotal + shipping;
    document.getElementById('total').textContent = `₱${total.toFixed(2)}`;
}

function updateTotals(subtotal) {
    document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
    updateTotalWithShipping();
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
        paymentMethod: document.querySelector('input[name="payment"]:checked')?.value
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
    // Check if all required fields are filled
    for (const [key, value] of Object.entries(formData)) {
        if (!value && key !== 'apartment') {  // apartment is optional
            return false;
        }
    }
    
    // Check if a payment method is selected
    if (!formData.paymentMethod) {
        return false;
    }
    
    return true;
}

document.getElementById('region').addEventListener('change', function() {
    const shippingNotice = document.getElementById('shipping-notice');
    const selectedRegion = this.value;
    
    // Show notice for all provinces except Metro Manila regions
    if (selectedRegion && !['metro-manila'].includes(selectedRegion)) {
        shippingNotice.style.display = 'block';
    } else {
        shippingNotice.style.display = 'none';
    }
});