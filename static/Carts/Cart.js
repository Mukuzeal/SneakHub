// Assuming you have an endpoint to fetch cart items, for example, /api/cart
document.addEventListener("DOMContentLoaded", function() {
    // Fetch cart items from the backend (Flask API route or pre-rendered data)
    fetch('/api/cart')
        .then(response => response.json())  // Assuming the server sends data in JSON format
        .then(cartData => {
            displayCartItems(cartData.cart_items, cartData.total_price);
        })
        .catch(error => console.error('Error fetching cart data:', error));
});

// Function to display cart items dynamically in the table
function displayCartItems(cartItems, totalPrice) {
    const cartTableBody = document.querySelector('.cart-table tbody');
    cartTableBody.innerHTML = '';  // Clear existing items in the table

    // Loop through the cart items and create table rows
    cartItems.forEach(item => {
        const row = document.createElement('tr');

        // Product image, name, price, and quantity
        row.innerHTML = `
            <td>
                <div class="cart-product">
                    <img src="/static/Uploads/pics/${item.product_image}" alt="Product Image">
                    <p>${item.product_name}</p>
                </div>
            </td>
            <td>₱${item.product_price}</td>
            <td>${item.quantity}</td>
            <td>₱${(item.product_price * item.quantity).toFixed(2)}</td>
            <td><button class="remove-item-btn" data-item-id="${item.product_id}">Remove</button></td>
        `;

        cartTableBody.appendChild(row);
    });

    // Update the total price
    const totalPriceElement = document.querySelector('.cart-total p');
    totalPriceElement.textContent = `Total: ₱${totalPrice.toFixed(2)}`;
    
    // Add event listeners for remove buttons
    const removeButtons = document.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = button.getAttribute('data-item-id');
            removeCartItem(productId);
        });
    });
}

// Function to remove a cart item
function removeCartItem(productId) {
    fetch(`/remove_cart_item/${productId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Item removed from cart');
                // Re-fetch the updated cart data or remove the item from the DOM
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


$(document).ready(function() {
    // Show cart when the cart icon is clicked
    $('#cart-button').click(function() {
      $('#cart-page').toggle(); // Toggle the cart visibility
    });
  
    // Handle removing items from the cart
    $('.remove-item-btn').click(function() {
      var productId = $(this).data('item-id');
      // Send a request to the server to remove the item from the cart (using AJAX)
      $.ajax({
        url: '/remove_item/' + productId,
        type: 'POST',
        success: function(response) {
          // Remove the item from the table
          location.reload(); // Reload the page to update the cart
        },
        error: function() {
          alert('Error removing item from the cart');
        }
      });
    });
  
    // Checkout button (if needed)
    $('#checkout-btn').click(function() {
      window.location.href = '/checkout'; // Redirect to checkout page
    });
  });
  