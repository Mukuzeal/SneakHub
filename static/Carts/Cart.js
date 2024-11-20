document.addEventListener("DOMContentLoaded", function() {
    // Fetch cart items from the backend
    fetch('/api/cart')
        .then(response => response.json())
        .then(cartData => {
            displayCartItems(cartData.cart_items, cartData.total_price);
        })
        .catch(error => console.error('Error fetching cart data:', error));
});

// Function to display cart items dynamically
function displayCartItems(cartItems, totalPrice) {
    const cartItemsContainer = document.querySelector('.cart-items-container');
    cartItemsContainer.innerHTML = '';  // Clear existing items

    cartItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';

        itemDiv.innerHTML = `
            <div class="cart-product">
                <img src="/static/Uploads/pics/${item.product_image}" alt="Product Image">
                <p>${item.product_name}</p>
            </div>
            <div class="cart-item-details">
                <p>Price: ₱${item.product_price}</p>
                <p>Quantity: ${item.quantity}</p>
                <p>Total: ₱${(item.product_price * item.quantity).toFixed(2)}</p>
                <input type="checkbox" class="item-checkbox" data-item-id="${item.product_id}">
                <button class="remove-item-btn" data-item-id="${item.product_id}">Remove</button>
            </div>
        `;

        cartItemsContainer.appendChild(itemDiv);
    });

    // Update the total price
    updateTotalPrice();

    // Add event listeners for remove buttons
    const removeButtons = document.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = button.getAttribute('data-item-id');
            removeCartItem(productId);
        });
    });

    // Add event listeners for checkboxes
    const checkboxes = document.querySelectorAll('.item-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateTotalPrice);
    });
}

// Function to update the total price based on selected items
function updateTotalPrice() {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    let selectedTotal = 0;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const itemPrice = parseFloat(checkbox.closest('.cart-item-details').querySelector('p:nth-child(1)').textContent.replace('Price: ₱', ''));
            const itemQuantity = parseInt(checkbox.closest('.cart-item-details').querySelector('p:nth-child(2)').textContent.replace('Quantity: ', ''));
            selectedTotal += itemPrice * itemQuantity;
        }
    });

    const totalPriceElement = document.querySelector('#total-price');
    totalPriceElement.textContent = `${selectedTotal.toFixed(2)}`;
}

// Function to remove a cart item
function removeCartItem(productId) {
    fetch(`/remove_cart_item/${productId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Item removed from cart');
                // Re-fetch the updated cart data
                fetch('/api/cart')
                    .then(response => response.json())
                    .then(cartData => {
                        displayCartItems(cartData.cart_items, cartData.total_price);
                    });
            } else {
                alert('Error removing item from cart');
            }
        })
        .catch(error => console.error('Error removing item:', error));
}