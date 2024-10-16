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
                <span class="editable password" data-field="password">********</span>
                <input type="password" class="edit-input" data-field="password" value="${user.password}" style="display:none;">
            </td>
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
                } else if (field === "password") {
                    const input = row.querySelector('.edit-input[data-field="password"]');
                    input.style.display = "block"; // Show the password input
                    cell.style.display = "none"; // Hide the password span
                    input.focus(); // Optionally focus on the password input
                } else {
                    cell.innerHTML = `<input type="text" class="edit-input" data-field="${field}" value="${value}">`;
                }
            });
            e.target.textContent = 'Save';
        } else {
            // Save mode: Save changes and switch back to "Edit"
            const name = row.querySelector('.edit-input[data-field="name"]').value;
            const email = row.querySelector('.edit-input[data-field="email"]').value;
            const password = row.querySelector('.edit-input[data-field="password"]').value; // Capture the new password
            const user_type = row.querySelector('.edit-input[data-field="user_type"]').value;

            try {
                const response = await fetch(`/edit_user/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, user_type })
                });

                if (response.ok) {
                    // Reflect saved values and switch back to "Edit" mode
                    row.querySelectorAll('.editable').forEach(cell => {
                        const field = cell.dataset.field;
                        if (field === "user_type") {
                            const select = row.querySelector('.edit-input[data-field="user_type"]');
                            cell.textContent = select.value; // Set the selected value
                            select.style.display = "none"; // Hide the dropdown
                        } else if (field === "password") {
                            const input = row.querySelector('.edit-input[data-field="password"]');
                            cell.textContent = '********'; // Mask the password
                            input.style.display = "none"; // Hide the password input
                        } else {
                            const input = row.querySelector(`.edit-input[data-field="${field}"]`);
                            cell.textContent = input.value;
                        }
                    });
                    e.target.textContent = 'Edit';
                    alert('User updated successfully!');
                    
                    // Refresh the page to show the updated user list
                    location.reload(); // Reload the current page
                } else {
                    alert('Error updating user.');
                }
            } catch (error) {
                alert('Error: ' + error.message);
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
            alert('User added successfully!'); // Success message
        } else {
            alert('Error adding user.'); // Display error message
        }
    } catch (error) {
        alert('Error: ' + error.message); // Display network error
    }
});

// Handle Delete User
document.querySelector('#userTable').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) { // Ensure the class matches your button
        const userId = e.target.dataset.id;

        // Send a PUT request to update the 'archieve' column to 'yes'
        const response = await fetch(`/delete_user/${userId}`, { method: 'PUT' });

        if (response.ok) {
            // Remove the deleted user's row from the table
            const row = e.target.closest('tr'); // Get the closest row (tr) element
            if (row) {
                row.remove(); // Remove the row from the table
            }
        } else {
            alert('Error archiving user.');
        }
    }
});

// Handle Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = '/logout'; // Redirect to the root route (loads index.html)
});

// Handle 
document.getElementById('archBtn').addEventListener('click', () => {
window.location.href = '/archive'; // Redirect to the root route (loads index.html)
});

// Load users when the admin page loads
document.addEventListener('DOMContentLoaded', loadUsers);
