document.addEventListener('DOMContentLoaded', function() {
    loadArchivedProducts();
    setupFilters();
});

// Load and display archived products
function loadArchivedProducts() {
    const productsGrid = document.getElementById('archivedProductsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = '<div class="loading">Loading archived products...</div>';

        fetch('/get_archived_products')
            .then(response => response.json())
            .then(products => {
                if (!products || products.length === 0) {
                    productsGrid.style.display = 'none';
                    document.getElementById('noProductsMessage').style.display = 'block';
                    document.getElementById('archivedCount').textContent = '0';
                    return;
                }

                productsGrid.style.display = 'grid';
                document.getElementById('noProductsMessage').style.display = 'none';
                document.getElementById('archivedCount').textContent = products.length;

                productsGrid.innerHTML = products.map(product => `
                    <div class="product-container">
                        <div class="archive-card" data-product-id="${product.id}" data-category="${product.category}">
                            <div class="archive-badge">
                                <span>Archived</span>
                            </div>
                            
                            <div class="product-image-container">
                                <img src="/static/Uploads/pics/${product.image}" 
                                     alt="${product.name}" 
                                     class="product-image"
                                     onerror="this.src='/static/Uploads/pics/default.jpg'">
                            </div>

                            <div class="product-details">
                                <h5 class="product-title">${product.name}</h5>
                                <div class="product-info">
                                    <span class="product-price">₱${product.price}</span>
                                    <span class="product-stock">Stock: ${product.quantity}</span>
                                </div>
                                <div class="product-meta">
                                    <span class="product-category">${product.category}</span>
                                    <span class="product-brand">${product.brand || 'No Brand'}</span>
                                </div>
                                <p class="product-description">${product.description ? product.description.substring(0, 100) : ''}...</p>
                                
                                <div class="product-actions">
                                    <button onclick="restoreProduct(${product.id})" class="restore-btn">
                                        <i class='bx bx-reset'></i> Restore
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');

                // Setup filters after loading products
                setupFilters();
            })
            .catch(error => {
                console.error('Error loading archived products:', error);
                productsGrid.innerHTML = '<div class="error">Error loading archived products</div>';
            });
    }
}

// Setup filter and search functionality
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (searchInput && categoryFilter && sortFilter) {
        searchInput.addEventListener('input', filterProducts);
        categoryFilter.addEventListener('change', filterProducts);
        sortFilter.addEventListener('change', filterProducts);
    }
}

// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortFilter').value;
    
    const products = document.querySelectorAll('.archive-card');
    let visibleProducts = 0;

    products.forEach(product => {
        const title = product.querySelector('.product-title').textContent.toLowerCase();
        const category = product.dataset.category;
        let shouldShow = true;

        if (searchTerm && !title.includes(searchTerm)) {
            shouldShow = false;
        }

        if (selectedCategory && category !== selectedCategory) {
            shouldShow = false;
        }

        product.parentElement.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) visibleProducts++;
    });

    // Show/hide no products message
    const noProductsMessage = document.getElementById('noProductsMessage');
    if (noProductsMessage) {
        noProductsMessage.style.display = visibleProducts === 0 ? 'block' : 'none';
    }

    // Update count
    document.getElementById('archivedCount').textContent = visibleProducts;
}

// Restore product function
function restoreProduct(productId) {
    Swal.fire({
        title: 'Restore Product?',
        text: "This product will be visible in the main product list again.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4723D9',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, restore it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/restore_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product_id: productId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Restored!',
                        text: 'Product has been restored successfully.',
                        icon: 'success',
                        confirmButtonColor: '#4723D9'
                    }).then(() => {
                        loadArchivedProducts(); // Reload the products
                    });
                }
            })
            .catch(error => console.error('Error:', error));
        }
    });
}
