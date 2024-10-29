let allUsers = []; // Array to hold all users for search

async function loadUsers() {
    try {
        const response = await fetch('/users');
        allUsers = await response.json(); // Store users in the array
        console.log(allUsers); // Check the structure of users
        displayUsers(allUsers); // Display all users initially
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function displayUsers(users) {
    const userTableBody = document.getElementById('userTableBody');
    userTableBody.innerHTML = ''; // Clear existing rows

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td><span class="editable" data-field="name">${user.name}</span></td>
            <td><span class="editable" data-field="email">${user.email}</span></td>
            <td>
                <span class="editable" data-field="user_type">${user.user_type}</span>
                <select class="edit-input" data-field="user_type" style="display:none;">
                    <option value="Buyer" ${user.user_type === 'Buyer' ? 'selected' : ''}>Buyer</option>
                    <option value="Seller" ${user.user_type === 'Seller' ? 'selected' : ''}>Seller</option>
                </select>
            </td>
            <td>
                <button class="btn edit-save-btn" data-id="${user.id}">Edit</button>
                <button class="btn delete-btn" data-id="${user.id}">Delete</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

// Handle Search
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filteredUsers = allUsers.filter(user => {
        return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.user_type.toLowerCase().includes(query)
        );
    });
    displayUsers(filteredUsers); // Display the filtered users
});

// Handle Edit and Save button toggle
document.querySelector('#userTable').addEventListener('click', async (e) => {
    if (e.target.classList.contains('edit-save-btn')) {
        const row = e.target.closest('tr');
        const userId = e.target.dataset.id;
        const isEditing = e.target.textContent === 'Edit';

        if (isEditing) {
            // Switch to "Save" mode: Make fields editable
            row.querySelectorAll('.editable').forEach(cell => {
                const value = cell.textContent;
                const field = cell.dataset.field;

                if (field === "user_type") {
                    const select = row.querySelector('.edit-input[data-field="user_type"]');
                    select.style.display = "block"; // Show the dropdown
                    cell.style.display = "none"; // Hide the text
                } else {
                    cell.innerHTML = `<input type="text" class="edit-input" data-field="${field}" value="${value}">`;
                }
            });
            e.target.textContent = 'Save';
        } else {
            // Save mode: Save changes and switch back to "Edit"
            const name = row.querySelector('.edit-input[data-field="name"]').value;
            const email = row.querySelector('.edit-input[data-field="email"]').value;
            const user_type = row.querySelector('.edit-input[data-field="user_type"]').value;

            // Confirmation dialog
            const result = await Swal.fire({
                title: 'Confirm Update',
                text: "Are you sure you want to update this user?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, update it!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/edit_user/${userId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, user_type })
                    });

                    if (response.ok) {
                        // Reflect saved values and switch back to "Edit" mode
                        row.querySelectorAll('.editable').forEach(cell => {
                            const field = cell.dataset.field;
                            if (field === "user_type") {
                                const select = row.querySelector('.edit-input[data-field="user_type"]');
                                cell.textContent = select.value; // Set the selected value
                                select.style.display = "none"; // Hide the dropdown
                            } else {
                                const input = row.querySelector(`.edit-input[data-field="${field}"]`);
                                cell.textContent = input.value;
                            }
                        });
                        e.target.textContent = 'Edit';
                        Swal.fire('Updated!', 'User updated successfully.', 'success');
                        
                        // Refresh the page to show the updated user list
                        location.reload(); // Reload the current page
                    } else {
                        Swal.fire('Error!', 'Error updating user.', 'error');
                    }
                } catch (error) {
                    Swal.fire('Error!', 'Error: ' + error.message, 'error');
                }
            }
        }
    }

    // Handle Categories Button Click
    document.getElementById('categoriesBtn').addEventListener('click', () => {
        window.location.href = 'categories.html'; // Redirect to categories page
    });
});


// Handle Add User form submission
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the form from submitting

    const formData = new FormData(e.target);

    try {
        const response = await fetch('/add_user', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            await loadUsers(); // Reload users
            e.target.reset(); // Clear the form
            Swal.fire('Success', 'User added successfully!', 'success'); // Success message
        } else {
            Swal.fire('Error', 'Error adding user.', 'error'); // Display error message
        }
    } catch (error) {
        Swal.fire('Error', 'Error: ' + error.message, 'error'); // Display network error
    }
});

// Handle Delete User
document.querySelector('#userTable').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) { // Ensure the class matches your button
        const userId = e.target.dataset.id;

        // Show confirmation before deleting
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this user!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            // Send a PUT request to update the 'archive' column to 'yes'
            const response = await fetch(`/delete_user/${userId}`, { method: 'PUT' });

            if (response.ok) {
                // Remove the deleted user's row from the table
                const row = e.target.closest('tr'); // Get the closest row (tr) element
                if (row) {
                    row.remove(); // Remove the row from the table
                    Swal.fire('Deleted!', 'User has been deleted.', 'success');
                }
            } else {
                Swal.fire('Error', 'Error archiving user.', 'error');
            }
        }
    }
});

// Handle Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = '/logout'; // Redirect to the root route (loads index.html)
});

// Handle Archive Button
document.getElementById('archBtn').addEventListener('click', () => {
    window.location.href = '/archive'; // Redirect to the archive page
});



// Load users when the admin page loads
document.addEventListener('DOMContentLoaded', loadUsers);
