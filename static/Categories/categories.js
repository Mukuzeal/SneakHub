let allCategories = []; // Array to hold all categories for display
let editingCategoryId = null; // Track the category being edited

async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        allCategories = await response.json(); // Store categories in the array
        displayCategories(allCategories); // Display all categories initially
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

function displayCategories(categories) {
    const categoriesTableBody = document.getElementById('categoriesTableBody');
    categoriesTableBody.innerHTML = ''; // Clear existing rows

    categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.category_name}</td>
            <td>${category.description}</td>
            <td>
                <button class="btn edit-btn" data-id="${category.id}">Edit</button>
                <button class="btn delete-btn" data-id="${category.id}">Delete</button>
            </td>
        `;
        categoriesTableBody.appendChild(row);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            const categoryId = button.getAttribute('data-id');
            editCategory(categoryId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const categoryId = button.getAttribute('data-id');
            deleteCategory(categoryId);
        });
    });
}

// Handle form submission for adding and editing categories
document.getElementById('addCategoryForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries()); // Convert form data to a plain object

    const button = e.target.querySelector('.submit-btn'); // Reference to the submit button

    if (editingCategoryId) {
        // If editing, update the category
        try {
            const response = await fetch(`/api/edit_category/${editingCategoryId}`, {
                method: 'PUT',
                body: new URLSearchParams(data) // Send form data
            });

            if (response.ok) {
                await loadCategories(); // Reload categories
                e.target.reset(); // Reset form
                editingCategoryId = null; // Clear editing category ID
                button.textContent = 'Add Category'; // Reset button text
                alert('Category updated successfully!');
            } else {
                alert('Error updating category.');
            }
        } catch (error) {
            console.error('Error updating category:', error);
        }
    } else {
        // If not editing, add a new category
        try {
            const response = await fetch('/api/add_category', {
                method: 'POST',
                body: new URLSearchParams(data) // Send form data
            });

            if (response.ok) {
                await loadCategories(); // Reload categories
                e.target.reset(); // Reset form
                alert('Category added successfully!');
            } else {
                alert('Error adding category.');
            }
        } catch (error) {
            console.error('Error adding category:', error);
        }
    }
});

// Function to set up editing of a category
function editCategory(categoryId) {
    const category = allCategories.find(cat => cat.id == categoryId);
    if (category) {
        document.querySelector('input[name="category_name"]').value = category.category_name;
        document.querySelector('textarea[name="description"]').value = category.description;
        editingCategoryId = categoryId; // Set the category ID for editing

        // Change button text to 'Save Category'
        const button = document.querySelector('#addCategoryForm .submit-btn');
        button.textContent = 'Save Category';
    }
}

// Function to delete a category
async function deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category?')) {
        try {
            const response = await fetch(`/api/delete_category/${categoryId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await loadCategories(); // Reload categories
                alert('Category deleted successfully!');
            } else {
                alert('Error deleting category.');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    }
}

// Load categories when the page loads
document.addEventListener('DOMContentLoaded', loadCategories);
