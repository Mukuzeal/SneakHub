document.addEventListener("DOMContentLoaded", function(event) {
    // Function to show/hide the navbar
    const showNavbar = (toggleId, navId, bodyId, headerId) => {
        const toggle = document.getElementById(toggleId),
              nav = document.getElementById(navId),
              bodypd = document.getElementById(bodyId),
              headerpd = document.getElementById(headerId);

        if (toggle && nav && bodypd && headerpd) {
            toggle.addEventListener('click', () => {
                nav.classList.toggle('show');
                toggle.classList.toggle('bx-x');
                bodypd.classList.toggle('body-pd');
                headerpd.classList.toggle('body-pd');
            });
        }
    };

    showNavbar('header-toggle', 'nav-bar', 'body-pd', 'header');

    const linkColor = document.querySelectorAll('.nav_link');

    // Automatically add the active class based on the current page URL
    const currentPage = window.location.pathname; // Get current page path

    linkColor.forEach(link => {
        // Match the href attribute or manually check the URL for each link
        if (currentPage.includes("itemList.html")) {
            if (link.textContent.trim() === "Item List") {
                link.classList.add('active');
            }
        } else if (currentPage.includes("add-product")) {
            if (link.textContent.trim() === "Add Item") {
                link.classList.add('active');
            }
        } else if (currentPage.includes("updateList.html")) {
            if (link.textContent.trim() === "Updates") {
                link.classList.add('active');
            }
        } else if (currentPage.includes("AccountSettings.html")) {
            if (link.textContent.trim() === "Account Setting") {
                link.classList.add('active');
            }
        } else if (currentPage.includes("seller.html")) {
            if (link.textContent.trim() === "Dashboard") {
                link.classList.add('active');
            }
        }
    });

    // Handle navigation link clicks
    linkColor.forEach(l => l.addEventListener('click', function() {
        linkColor.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    }));

    // JavaScript functions for navigation links
    function goToDashboard() {
        window.location.href = 'seller.html'; // Update to the correct dashboard path
    }

    function goToItemList() {
        window.location.href = '/item_list'; // This should match your Flask route
    }
    
    function goToselleraddproduct() {
        window.location.href = 'selleraddproduct.html'; // Redirects to the Add Product page
    }

    function goToUpdates() {
        window.location.href = 'UpdateList.html'; // Update to the correct updates path
    }

    function goToAccountSettings() {
        window.location.href = 'AccountSettings.html'; // Update to the correct account settings path
    }

    function logout() {
        alert("Logging out");
        // Logic to log out the user, redirect or clear session as needed
    }

    // Handle form submission
    const form = document.querySelector("#addProductForm");

    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();  // Prevent the default form submission
            const formData = new FormData(form);

            // Send the form data via AJAX (fetch)
            fetch("/submit_product", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.message && data.image_url) {
                    // Display success notification using SweetAlert2
                    Swal.fire({
                        title: 'Product Added Successfully!',
                        text: data.message,
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        // Redirect to another page after success
                        addProductForm.reset();
                    });
                } else if (data.error) {
                    // Display error notification
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: data.error
                    });
                }
            })
            .catch(error => {
                // Handle any unexpected errors
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An unexpected error occurred. Please try again.'
                });
            });
        });
    }
});

async function fetchProducts() {
    console.log('Fetching products...'); // Debugging log
    try {
        const response = await fetch('/item_list'); // Fetch product data from the server
        const products = await response.json(); // Parse the JSON response
        console.log('Products fetched:', products); // Debugging log

        const productTableBody = document.getElementById('productTableBody'); // Get the table body

        // Clear any existing rows in the table body
        productTableBody.innerHTML = '';

        // Populate the table with products
        products.forEach(product => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${product.id}</td>  <!-- Display product ID -->
                <td>${product.product_name}</td>  <!-- Display product name -->
                <td>${product.product_price}</td>  <!-- Display product price -->
                <td>${product.product_description}</td>  <!-- Display product description -->
                <td>${product.product_quantity}</td>  <!-- Display product quantity -->
                <td>${product.brand}</td>  <!-- Display product brand -->
                <td>${product.product_category}</td>  <!-- Display product category -->
                <td>${product.product_image}</td>  <!-- Display the image filename as text -->

                <td>
                <div class="button-container">
                    <button class="btn btn-custom" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn btn-custom" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
                </td>
            `;

            productTableBody.appendChild(row); // Add the new row to the table
        });
    } catch (error) {
        console.error('Error fetching products:', error); // Log any errors
    }
}

// Fetch the products when the page loads
document.addEventListener('DOMContentLoaded', fetchProducts);





// Assuming you have a function that fetches product data
function fetchProductData() {
    fetch('/item_list') // Adjust to your API endpoint
        .then(response => response.json())
        .then(data => {
            const productCardsContainer = document.getElementById('productCardsContainer');
            productCardsContainer.innerHTML = ''; // Clear previous data

            data.forEach(product => {
                // Create product card
                const card = document.createElement('div');
                card.className = 'col-md-3'; // Use bootstrap grid system
                card.setAttribute('data-id', product.id);
                
                // Use the product image path (direct from database)
                const imagePath = `Uploads/pics/${product.product_image}`;

                card.innerHTML = `
                    <div class="product-card">
                        <img src="${imagePath}" class="product-image" alt="${product.product_name}"
                             onerror="this.onerror=null; this.src='Uploads/pics/default.jpg';">
                        <h5>${product.product_name}</h5>
                        <p>Price: $${product.product_price}</p>
                        <p>Description: ${product.product_description}</p>
                        <p>Quantity: ${product.product_quantity}</p>
                        <p>Brand: ${product.brand}</p>
                        <p>Category: ${product.product_category}</p>
                    </div>
                `;

                productCardsContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Call the function to fetch product data when the page loads
window.onload = fetchProductData;



// Function to open the modal for editing
function editProduct(productId) {
    fetch(`/get_product/${productId}`)
        .then(response => response.json())
        .then(product => {
            // Populate modal fields with product data
            document.getElementById('productId').value = product.id; // Assuming this field exists
            document.getElementById('productName').value = product.product_name;
            document.getElementById('productPrice').value = product.product_price;
            document.getElementById('productDescription').value = product.product_description;
            document.getElementById('productQuantity').value = product.product_quantity;
            document.getElementById('brand').value = product.brand;
            document.getElementById('productCategory').value = product.product_category;
            document.getElementById('editModal').style.display = 'flex'; // Show the modal
        })
        .catch(error => console.error('Error fetching product data:', error));
}

// Function to close the modal
function closeModal() {
    document.getElementById('editModal').style.display = 'none'; // Hide the modal
}

// Optional: Close modal when clicking outside the modal content
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeModal();
    }
};

async function saveProductChanges() {
    const formData = new FormData(document.getElementById('editProductForm'));
    
    // Convert FormData to an object
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/update_product', {
            method: 'POST',
            body: new URLSearchParams(data) // Use URLSearchParams for form-like data
        });

        const result = await response.json();

        if (result.success) {
            // Show confirmation message
            alert(result.message); // You can replace this with a nicer notification UI

            // Update the product table row with the new data
            await fetchProducts();
            
            // Close the modal
            closeModal();
        } else {
            alert(result.error); // Handle the error message
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the product.');
    }
}

async function deleteProduct(productId) {
    try {
        const response = await fetch(`/archive_product/${productId}`, { method: 'POST' });
        
        if (response.ok) {
            console.log(`Product ${productId} archived successfully`);

            // Remove the specific product card from the DOM
            const productCard = document.querySelector(`[data-id='${productId}']`);
            if (productCard) {
                productCard.remove();
            }

            // Also refresh the product table if needed
            fetchProducts();
        } else {
            const errorData = await response.json();
            console.error('Error archiving product:', errorData.error);
        }
    } catch (error) {
        console.error('Error archiving product:', error);
    }
}













    

