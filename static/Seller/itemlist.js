document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupFilters();
});

// Load and display products
function loadProducts() {
    fetch('/item_list')
        .then(response => response.json())
        .then(products => {
            displayProducts(products);
            updateCategoryFilter(products);
        })
        .catch(error => console.error('Error:', error));
}

// Setup filter and search functionality
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');

    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
    sortFilter.addEventListener('change', filterProducts);
}

// Filter products based on search and category
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortFilter').value;
    
    const products = document.querySelectorAll('.product-card');
    let visibleProducts = 0;

    products.forEach(product => {
        const title = product.querySelector('.product-title').textContent.toLowerCase();
        const category = product.dataset.category;
        let shouldShow = true;

        // Apply search filter
        if (searchTerm && !title.includes(searchTerm)) {
            shouldShow = false;
        }

        // Apply category filter
        if (selectedCategory && category !== selectedCategory) {
            shouldShow = false;
        }

        product.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) visibleProducts++;
    });

    // Show/hide no products message
    const noProductsMessage = document.getElementById('noProductsMessage');
    noProductsMessage.style.display = visibleProducts === 0 ? 'block' : 'none';

    // Apply sorting
    sortProducts(sortBy);
}

// Sort products
function sortProducts(sortBy) {
    const productsGrid = document.querySelector('.products-grid');
    const products = Array.from(productsGrid.children);

    products.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.product-price').textContent.replace('$', ''));
        const priceB = parseFloat(b.querySelector('.product-price').textContent.replace('$', ''));

        switch(sortBy) {
            case 'price-high':
                return priceB - priceA;
            case 'price-low':
                return priceA - priceB;
            // Add more sorting options as needed
        }
    });

    // Re-append sorted products
    products.forEach(product => productsGrid.appendChild(product));
}

// Update category filter options
function updateCategoryFilter(products) {
    const categories = new Set(products.map(p => p.category));
    const categoryFilter = document.getElementById('categoryFilter');
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Edit product function
function editProduct(productId) {
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
    
    // Fetch product details
    fetch(`/get_product/${productId}`)
        .then(response => response.json())
        .then(product => {
            // Populate modal fields
            document.getElementById('editProductId').value = product.id;
            document.getElementById('editProductName').value = product.product_name;
            document.getElementById('editProductPrice').value = product.product_price;
            document.getElementById('editProductQuantity').value = product.product_quantity;
            document.getElementById('editProductBrand').value = product.brand;
            document.getElementById('editProductCategory').value = product.product_category;
            document.getElementById('editProductDescription').value = product.product_description;

            // Display current image if it exists
            const currentImage = document.getElementById('currentProductImage');
            if (product.product_image) {
                currentImage.src = `/static/Uploads/pics/${product.product_image}`;
                currentImage.style.display = 'block';
            } else {
                currentImage.style.display = 'none';
            }

            modal.show();
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            alert('Error loading product details');
        });
}

// Save product changes
function saveProductChanges() {
    const form = document.getElementById('editProductForm');
    const formData = new FormData(form);
    const productId = document.getElementById('editProductId').value;

    fetch(`/update_product/${productId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
            modal.hide();
            
            // Show success message with SweetAlert2
            Swal.fire({
                title: 'Success!',
                text: 'Product updated successfully',
                icon: 'success',
                confirmButtonColor: '#28a745'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload();
                }
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: data.message || 'Error updating product',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Error updating product',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    });
}

// Preview image before upload
document.getElementById('editProductImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const currentImage = document.getElementById('currentProductImage');
            currentImage.src = e.target.result;
            currentImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Delete product with SweetAlert confirmation
function deleteProduct(productId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/archive_product/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Product has been deleted.',
                        icon: 'success',
                        confirmButtonColor: '#28a745'
                    }).then(() => {
                        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
                        if (productCard) {
                            productCard.remove();
                        }
                    });
                }
            })
            .catch(error => console.error('Error:', error));
        }
    });
}
