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
    const currentPage = window.location.pathname;

    linkColor.forEach(link => {
        if (currentPage.includes("itemList.html")) {
            if (link.textContent.trim() === "Item List") {
                link.classList.add('active');
            }
        } else if (currentPage.includes("add-product")) {
            if (link.textContent.trim() === "Add Item") {
                link.classList.add('active');
            }
        } else if (currentPage.includes("updateList")) {
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

    // Check current page and load appropriate content
    const path = window.location.pathname;
    
    // Load archived products if on archive page
    if (path.includes('updateList') || 
        path.includes('UpdateList') || 
        path.includes('item_listArchive')) {
        const productsGrid = document.getElementById('archivedProductsGrid');
        if (productsGrid) {
            loadArchivedProducts();
        }
    }
});

// Navigation Functions
function goToDashboard() {
    window.location.href = 'seller.html';
}

function goToItemList() {
    window.location.href = '/item_list';
}

function goToselleraddproduct() {
    window.location.href = 'selleraddproduct.html';
}

function goToUpdates() {
    window.location.href = '/updateList';
}

function goToAccountSettings() {
    window.location.href = 'AccountSettings.html';
}

// Logout function with SweetAlert confirmation
document.addEventListener('DOMContentLoaded', function() {
    // Find the logout link
    const logoutLink = document.querySelector('a[href="/sellerlogout"]');
    
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            // Prevent the default link behavior
            e.preventDefault();
            
            Swal.fire({
                title: 'Are you sure?',
                text: "You will be logged out of your account",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#4723D9',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, logout'
            }).then((result) => {
                if (result.isConfirmed) {
                    // If confirmed, proceed with logout
                    window.location.href = '/sellerlogout';
                }
            });
        });
    }
});

// Product Management Functions
function editProduct(productId) {
    fetch(`/get_product/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('editProductId').value = product.id;
            document.getElementById('editProductName').value = product.name;
            document.getElementById('editProductPrice').value = product.price;
            document.getElementById('editProductQuantity').value = product.quantity;
            document.getElementById('editProductBrand').value = product.brand;
            document.getElementById('editProductCategory').value = product.category;
            document.getElementById('editProductDescription').value = product.description;

            const currentImage = document.getElementById('currentProductImage');
            if (product.image) {
                currentImage.src = `/static/Uploads/pics/${product.image}`;
                currentImage.style.display = 'block';
            }

            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
            modal.show();
        })
        .catch(error => console.error('Error:', error));
}

async function deleteProduct(productId) {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This item will be moved to the archive.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, archive it!'
        });

        if (result.isConfirmed) {
            const response = await fetch(`/archive_product/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire(
                    'Archived!',
                    'The product has been moved to archive.',
                    'success'
                ).then(() => {
                    // Remove the product card if we're on the item list page
                    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
                    if (productCard) {
                        productCard.remove();
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire(
            'Error!',
            'There was a problem archiving the product.',
            'error'
        );
    }
}

async function saveProductChanges() {
    const form = document.getElementById('editProductForm');
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/update_product', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Show success message
            Swal.fire({
                title: 'Success!',
                text: 'Product updated successfully',
                icon: 'success',
                confirmButtonColor: '#4723D9'
            }).then(() => {
                // Close the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
                modal.hide();
                
                // Refresh the product list
                location.reload();
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: result.error || 'Failed to update product',
                icon: 'error',
                confirmButtonColor: '#4723D9'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error!',
            text: 'An unexpected error occurred',
            icon: 'error',
            confirmButtonColor: '#4723D9'
        });
    }
}




// Category Management Functions
function openModal() {
    document.getElementById('categoryModal').style.display = 'block';
    fetchCategories();
}

function closeModal() {
    document.getElementById('categoryModal').style.display = 'none';
}

function fetchCategories() {
    fetch('/getcategories')
        .then(response => response.json())
        .then(data => {
            updateCategoryDropdown(data);
        })
        .catch(error => console.error('Error:', error));
}

// New function to update category dropdown
function updateCategoryDropdown(categories) {
    const categorySelect = document.getElementById('productCategory');
    if (categorySelect) {
        // Store the current selection if any
        const currentSelection = categorySelect.value;
        
        // Clear existing options
        categorySelect.innerHTML = '';
        
        // Add categories to select element
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.category_name;
            option.textContent = category.category_name;
            categorySelect.appendChild(option);
            
            // If this is the newly added category, select it
            if (category.category_name === currentSelection) {
                option.selected = true;
            }
        });
    }
}

// Add Category Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const categoryName = document.getElementById('newCategory').value;
            
            fetch('/addcategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `newCategory=${encodeURIComponent(categoryName)}`
            })
            .then(response => {
                if (response.status === 201) {
                    return { success: true };
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Category added successfully',
                        icon: 'success',
                        confirmButtonColor: '#4723D9'
                    }).then(() => {
                        // Clear the input
                        document.getElementById('newCategory').value = '';
                        
                        // Fetch updated categories and select the new one
                        fetch('/getcategories')
                            .then(response => response.json())
                            .then(categories => {
                                updateCategoryDropdown(categories);
                                
                                // Select the newly added category
                                const categorySelect = document.getElementById('productCategory');
                                if (categorySelect) {
                                    const options = categorySelect.options;
                                    for (let i = 0; i < options.length; i++) {
                                        if (options[i].value === categoryName) {
                                            categorySelect.selectedIndex = i;
                                            break;
                                        }
                                    }
                                }
                            });
                        
                        closeModal();
                    });
                } else {
                    throw new Error('Failed to add category');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (!error.message.includes('JSON')) {
                    Swal.fire({
                        title: 'Error!',
                        text: error.message || 'An unexpected error occurred',
                        icon: 'error',
                        confirmButtonColor: '#4723D9'
                    });
                }
            });
        });
    }

    // Fetch categories when page loads if we're on the add product page
    if (window.location.pathname.includes('add-product')) {
        fetchCategories();
    }
});

// Form Validation and Preview Functions
function validateSection(sectionIndex) {
    const currentSection = document.querySelectorAll('.form-section')[sectionIndex];
    const inputs = currentSection.querySelectorAll('input[required], select[required], textarea[required]');
    let valid = true;

    inputs.forEach(input => {
        if (!input.value) {
            valid = false;
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    });

    if (!valid) {
        Swal.fire({
            title: 'Error!',
            text: 'Please fill in all required fields',
            icon: 'error',
            confirmButtonColor: '#4723D9'
        });
    }

    return valid;
}

// Product Form Navigation
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('add-product')) {
        const sections = document.querySelectorAll('.form-section');
        const steps = document.querySelectorAll('.step');
        let currentSection = 0;

        function showSection(n) {
            sections.forEach(section => section.classList.remove('active'));
            steps.forEach(step => step.classList.remove('active'));
            
            sections[n].classList.add('active');
            for (let i = 0; i <= n; i++) {
                steps[i].classList.add('active');
            }

            document.getElementById('prevBtn').style.display = n === 0 ? 'none' : 'block';
            document.getElementById('nextBtn').style.display = n === sections.length - 1 ? 'none' : 'block';
            document.getElementById('submitBtn').style.display = n === sections.length - 1 ? 'block' : 'none';
        }

        document.getElementById('nextBtn').addEventListener('click', function() {
            if (validateSection(currentSection)) {
                currentSection++;
                if (currentSection >= sections.length) {
                    currentSection = sections.length - 1;
                }
                showSection(currentSection);
                updatePreview();
            }
        });

        document.getElementById('prevBtn').addEventListener('click', function() {
            currentSection--;
            if (currentSection < 0) {
                currentSection = 0;
            }
            showSection(currentSection);
        });

        // Add form submission handler with SweetAlert
        const addProductForm = document.querySelector('form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (validateSection(currentSection)) {
                    const formData = new FormData(this);
                    
                    fetch('/submit_product', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                title: 'Success!',
                                text: 'Product has been listed successfully',
                                icon: 'success',
                                confirmButtonColor: '#4723D9'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    window.location.href = '/itemList';
                                }
                            });
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text: data.error || 'Failed to list product',
                                icon: 'error',
                                confirmButtonColor: '#4723D9'
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire({
                            title: 'Error!',
                            text: 'An unexpected error occurred',
                            icon: 'error',
                            confirmButtonColor: '#4723D9'
                        });
                    });
                }
            });
        }

        // Initialize first section
        showSection(currentSection);
    }
});

function updatePreview() {
    document.getElementById('previewName').textContent = document.getElementById('productName').value;
    document.getElementById('previewBrand').textContent = document.getElementById('brandname').value;
    document.getElementById('previewCategory').textContent = document.getElementById('productCategory').value;
    document.getElementById('previewPrice').textContent = '₱' + document.getElementById('productPrice').value;
    document.getElementById('previewQuantity').textContent = document.getElementById('productQuantity').value;
    document.getElementById('previewDescription').textContent = document.getElementById('productDescription').value;

    const mainImage = document.getElementById('mainImage').files[0];
    if (mainImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '300px';
            img.style.maxHeight = '300px';
            img.style.objectFit = 'contain';
            const previewDiv = document.getElementById('finalImagePreview');
            previewDiv.innerHTML = '';
            previewDiv.appendChild(img);
        };
        reader.readAsDataURL(mainImage);
    }
}

// Image Upload Functions
function triggerFileInput(inputId) {
    document.getElementById(inputId).click();
}

function handleImagePreview(input, previewId) {
    const preview = document.getElementById(previewId);
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" 
                     alt="Preview" 
                     style="max-width: 200px; max-height: 200px; object-fit: contain;">`;
        };
        reader.readAsDataURL(file);
    }
}