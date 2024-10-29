$(document).ready(function() {
    $("#owl-carousel").owlCarousel({
      items: 1,                 // Show one item at a time
      loop: true,               // Enable infinite looping
      autoplay: true,           // Enable autoplay
      autoplayTimeout: 3000,    // Set time between transitions (3000 ms = 3 seconds)
      autoplayHoverPause: true, // Pause on hover
      dots: true,               // Show navigation dots
      responsiveRefreshRate: 200, // Refresh rate for responsiveness
      smartSpeed: 600           // Transition speed between images
    });
  });
  




// Get the modal and account icon elements
var modal = document.getElementById("account-modal");
var accountIcon = document.getElementById("account-button");

// Track the clicked state
var isClicked = false;

// Toggle modal on click
accountIcon.onclick = function () {
    isClicked = !isClicked;
    if (isClicked) {
        showModal();
    } else {
        hideModal();
    }
}

// Hide modal when clicking outside of it
window.onclick = function (event) {
    if (event.target !== accountIcon && !modal.contains(event.target)) {
        isClicked = false;
        hideModal();
    }
}

// Function to show the modal
function showModal() {
    const rect = accountIcon.getBoundingClientRect(); // Get button position in viewport
    modal.style.left = `${rect.left}px`; // Align with button horizontally
    modal.style.top = `${rect.bottom + 5}px`; // Position slightly below button
    modal.classList.add("show");
}

// Function to hide the modal
function hideModal() {
    modal.classList.remove("show");
}


  


// Fetch and display product data
function fetchProductData() {
    fetch('/item_listBUYER') // Endpoint to fetch all non-archived products
        .then(response => response.json())
        .then(data => {
            const productCardsContainer = document.getElementById('productCardsContainer');
            productCardsContainer.innerHTML = ''; // Clear previous data

            data.forEach(product => {
                // Create product card
                const card = document.createElement('div');
                card.className = 'col-md-3'; // Use Bootstrap's grid system
                card.setAttribute('data-id', product.id);

                // Use the product image path from the database
                const imagePath = `Uploads/pics/${product.product_image}`;

                card.innerHTML = `
                    <div class="product-card">
                        <img src="${imagePath}" class="product-image" alt="${product.product_name}"
                             onerror="this.onerror=null; this.src='Uploads/pics/default.jpg';" id="product-image-${product.id}">
                        <h5>${product.product_name}</h5>
                        <p>Price: $${product.product_price}</p>
                        <p>Description: ${product.product_description}</p>
                        <p>Quantity: ${product.product_quantity}</p>
                        <p>Brand: ${product.brand}</p>
                        <p>Category: ${product.product_category}</p>
                        <button onclick="changeImage(${product.id})">Change Image</button>
                        <input type="file" id="file-input-${product.id}" style="display: none;" accept="image/*" onchange="uploadImage(${product.id})">
                    </div>
                `;

                productCardsContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Call fetchProductData on page load to display the products
document.addEventListener('DOMContentLoaded', fetchProductData);





// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Assuming you have a function that fetches product data
function fetchProductData() {
    fetch('/item_listBUYER') // Adjust to your API endpoint
        .then(response => response.json())
        .then(data => {
            // Shuffle the product data array
            const shuffledData = shuffleArray(data);

            const productCardsContainer = document.getElementById('productCardsContainer');
            productCardsContainer.innerHTML = ''; // Clear previous data

            shuffledData.forEach(product => {
                // Create product card
                const card = document.createElement('div');
                card.className = 'col-md-3'; // Use bootstrap grid system
                card.setAttribute('data-id', product.id);

                // Use the product image path (direct from database)
                const imagePath = `Uploads/pics/${product.product_image}`;

                card.innerHTML = `
                    <div class="product-card">
                        <img src="${imagePath}" class="product-image" alt="${product.product_name}"
                            onerror="this.onerror=null; this.src='Uploads/pics/default.jpg';" id="product-image-${product.id}">
                        <h5>${product.product_name}</h5>
                        <p>Price: $${product.product_price}</p>
                    </div>
                `;

                productCardsContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}




  
  

  
  