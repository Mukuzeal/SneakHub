document.addEventListener("DOMContentLoaded", function() {
    // Fetch cart items from the backend
    fetch('/api/cart')
        .then(response => response.json())
        .then(cartData => {
            console.log('Cart Data:', cartData); // Debug log
            if (cartData.cart_items && cartData.cart_items.length > 0) {
                displayCartItems(cartData.cart_items);
            } else {
                displayEmptyCart();
            }
        })
        .catch(error => {
            console.error('Error fetching cart data:', error);
            displayEmptyCart();
        });

    // Add event listeners for quantity buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('qty-btn')) {
            const input = e.target.parentElement.querySelector('.qty-input');
            if (e.target.classList.contains('plus')) {
                input.value = parseInt(input.value) + 1;
            } else if (e.target.classList.contains('minus')) {
                if (parseInt(input.value) > 1) {
                    input.value = parseInt(input.value) - 1;
                }
            }
            updateItemTotal(input);
        }
    });

    // Add select all functionality
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.item-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateOrderSummary();
        });
    }

    // Add individual checkbox listeners
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('item-checkbox')) {
            updateOrderSummary();
            updateSelectAllCheckbox();
        }
    });
});

function displayCartItems(cartItems) {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) {
        console.error('Cart items container not found');
        return;
    }

    // Reverse the array to show newest items first
    const reversedItems = [...cartItems].reverse();

    cartItemsContainer.innerHTML = reversedItems.map(item => `
        <div class="cart-item">
            <div class="item-checkbox-wrapper">
                <input type="checkbox" class="cart-checkbox item-checkbox" data-price="${item.product_price}" data-quantity="${item.quantity}">
            </div>
            <div class="item-image">
                <img src="/static/Uploads/pics/${item.product_image}" alt="${item.product_name}">
            </div>
            <div class="item-details">
                <div class="item-info">
                    <div>
                        <h3 class="item-name">${item.product_name}</h3>
                        <p class="item-price">₱${item.product_price}</p>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="quantity-controls">
                        <button class="qty-btn minus">-</button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1">
                        <button class="qty-btn plus">+</button>
                    </div>
                    <button class="remove-btn" id="remove-${item.product_id}" data-item-id="${item.product_id}">
                        Remove
                    </button>
                    <p class="item-total">₱${(item.product_price * item.quantity).toFixed(2)}</p>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners after adding items to DOM
    addEventListeners();
    updateOrderSummary();
}

function displayEmptyCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <a href="/success" class="continue-shopping">Start Shopping</a>
            </div>
        `;
    }
}

function updateTotalPrice(cartItems) {
    const subtotal = cartItems.reduce((total, item) => 
        total + (item.product_price * item.quantity), 0);
    
    // Update subtotal
    const subtotalElement = document.querySelector('.summary-line:first-child span:last-child');
    if (subtotalElement) {
        subtotalElement.textContent = `₱${subtotal.toFixed(2)}`;
    }

    // Update total
    const totalElement = document.querySelector('.summary-total span:last-child');
    if (totalElement) {
        totalElement.textContent = `₱${subtotal.toFixed(2)}`;
    }
}
 // Check Out Button
document.getElementById('checkout-btn').addEventListener('click', function () {
    window.location.href = "/checkout";
});


function updateItemTotal(input) {
    const cartItem = input.closest('.cart-item');
    const price = parseFloat(cartItem.querySelector('.item-price').textContent.replace('₱', ''));
    const quantity = parseInt(input.value);
    const totalElement = cartItem.querySelector('.item-total');
    totalElement.textContent = `₱${(price * quantity).toFixed(2)}`;
    
    // Update cart total
    const cartItems = Array.from(document.querySelectorAll('.cart-item')).map(item => ({
        product_price: parseFloat(item.querySelector('.item-price').textContent.replace('₱', '')),
        quantity: parseInt(item.querySelector('.qty-input').value)
    }));
    updateTotalPrice(cartItems);
}

function removeCartItem(productId) {
    fetch(`/remove_cart_item/${productId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Refresh cart data
                fetch('/api/cart')
                    .then(response => response.json())
                    .then(cartData => {
                        if (cartData.cart_items && cartData.cart_items.length > 0) {
                            displayCartItems(cartData.cart_items);
                        } else {
                            displayEmptyCart();
                        }
                    });
            } else {
                alert('Error removing item from cart');
            }
        })
        .catch(error => console.error('Error removing item:', error));
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('select-all');
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    selectAllCheckbox.checked = allChecked;
}

function updateOrderSummary() {
    const checkedItems = document.querySelectorAll('.item-checkbox:checked');
    const selectedCount = checkedItems.length;
    let subtotal = 0;

    checkedItems.forEach(checkbox => {
        const cartItem = checkbox.closest('.cart-item');
        const price = parseFloat(cartItem.querySelector('.item-price').textContent.replace('₱', ''));
        const quantity = parseInt(cartItem.querySelector('.qty-input').value);
        subtotal += price * quantity;
    });

    // Update the summary
    document.getElementById('selected-items-count').textContent = selectedCount;
    document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `₱${subtotal.toFixed(2)}`;

    // Disable/enable checkout button based on selection
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.disabled = selectedCount === 0;
    checkoutBtn.style.opacity = selectedCount === 0 ? '0.5' : '1';
}

// Add this function to handle all event listeners
function addEventListeners() {
    // Add quantity button listeners
    document.querySelectorAll('.qty-btn').forEach(button => {
        // Remove any existing event listeners
        button.replaceWith(button.cloneNode(true));
    });

    // Add new event listeners
    document.querySelectorAll('.qty-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default behavior
            e.stopPropagation(); // Stop event bubbling
            
            const input = this.parentElement.querySelector('.qty-input');
            let currentValue = parseInt(input.value) || 1;
            
            if (this.classList.contains('plus')) {
                input.value = currentValue + 1;
            } else if (this.classList.contains('minus') && currentValue > 1) {
                input.value = currentValue - 1;
            }
            
            // Trigger update only once
            updateItemTotal(input);
            updateOrderSummary();
        }, { once: false }); // Ensure the event listener isn't automatically removed
    });

    // Add quantity input validation
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('input', function() {
            let value = parseInt(this.value) || 0;
            
            // If value is less than 1, set it to 1
            if (value < 1) {
                value = 1;
            }
            
            // Update the input value
            this.value = value;
            
            // Update totals
            updateItemTotal(this);
            updateOrderSummary();
        });

        // Prevent negative numbers and non-numeric input
        input.addEventListener('keypress', function(e) {
            if (e.key === '-' || e.key === 'e' || e.key === '.') {
                e.preventDefault();
            }
        });

        // Handle paste event
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            let pastedText = (e.clipboardData || window.clipboardData).getData('text');
            let value = parseInt(pastedText);
            
            if (!isNaN(value) && value >= 1) {
                this.value = value;
            } else {
                this.value = 1;
            }
            
            updateItemTotal(this);
            updateOrderSummary();
        });

        // When input loses focus, ensure value is at least 1
        input.addEventListener('blur', function() {
            let value = parseInt(this.value) || 0;
            if (value < 1) {
                this.value = 1;
                updateItemTotal(this);
                updateOrderSummary();
            }
        });
    });

    // Updated remove button listeners with unique IDs
    document.querySelectorAll('.remove-btn').forEach(button => {
        const productId = button.getAttribute('data-item-id');
        button.id = `remove-${productId}`; // Set unique ID
        button.addEventListener('click', function() {
            removeCartItem(productId);
        });
    });

    // Add checkbox listeners
    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateOrderSummary();
            updateSelectAllCheckbox();
        });
    });
}