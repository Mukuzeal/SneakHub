document.addEventListener('DOMContentLoaded', function() {
    // Size selector
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sizeBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Quantity controls
    const minusBtn = document.querySelector('.minus');
    const plusBtn = document.querySelector('.plus');
    const qtyInput = document.querySelector('.qty-input');

    // Set initial value
    qtyInput.value = 1;

    minusBtn.addEventListener('click', function() {
        let currentValue = parseInt(qtyInput.value);
        if (currentValue > 1) {
            qtyInput.value = currentValue - 1;
        }
    });

    plusBtn.addEventListener('click', function() {
        let currentValue = parseInt(qtyInput.value);
        qtyInput.value = currentValue + 1;
    });

    // Handle manual input
    qtyInput.addEventListener('input', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 1) {
            this.value = 1;
        }
    });

    // Back button functionality
    const backButton = document.querySelector('.back-button');
    backButton.addEventListener('click', function() {
        window.history.back();
    });

    // Add to cart button
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', async function() {
        // Get the product ID from the URL
        const pathArray = window.location.pathname.split('/');
        const productId = pathArray[pathArray.length - 1];
        const quantity = parseInt(qtyInput.value);

        try {
            const response = await fetch('/add-to-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
                })
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Product has been added to your cart',
                    icon: 'success',
                    confirmButtonColor: '#ff5722'
                });
            } else {
                // If the response is not ok, check if it's an authentication error
                if (response.status === 401) {
                    Swal.fire({
                        title: 'Please Log In',
                        text: 'You need to be logged in to add items to cart',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Log In',
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#ff5722'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '/sign-up'; // Redirect to login page
                        }
                    });
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to add item to cart');
                }
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Something went wrong',
                icon: 'error',
                confirmButtonColor: '#ff5722'
            });
        }
    });

    // Buy now button
    const buyNowBtn = document.querySelector('.buy-now-btn');
    buyNowBtn.addEventListener('click', function() {
        // Get current quantity
        const quantity = parseInt(qtyInput.value);
        
        // First add to cart
        const pathArray = window.location.pathname.split('/');
        const productId = pathArray[pathArray.length - 1];

        fetch('/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        })
        .then(response => {
            if (response.ok) {
                // If successfully added to cart, redirect to cart page
                window.location.href = '/Carts.html';
            } else if (response.status === 401) {
                // Handle unauthorized access
                Swal.fire({
                    title: 'Please Log In',
                    text: 'You need to be logged in to make a purchase',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Log In',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#ff5722'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/sign-up';
                    }
                });
            } else {
                throw new Error('Failed to add item to cart');
            }
        })
        .catch(error => {
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#ff5722'
            });
        });
    });
});
  