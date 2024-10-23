// Function to fetch archived users and populate the table
async function fetchArchivedUsers() {
    try {
        const response = await fetch('/archived_users'); // Fetch archived users from the server
        const users = await response.json(); // Parse the JSON response

        const archivedUserTableBody = document.getElementById('archivedUserTableBody');

        // Clear any existing rows in the table body
        archivedUserTableBody.innerHTML = '';

        // Populate the table with archived users
        users.forEach(user => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.user_type}</td>
                <td><button class="restore-btn" data-id="${user.id}">Restore</button></td>
            `;

            archivedUserTableBody.appendChild(row);
        });

        // Add event listeners for the restore buttons
        addRestoreEventListeners();
    } catch (error) {
        console.error('Error fetching archived users:', error);
    }
}


// Function to add event listeners for restoring users
function addRestoreEventListeners() {
    document.querySelectorAll('.restore-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const userId = e.target.dataset.id;

            // Send a POST request to restore the user
            const response = await fetch(`/restore_user/${userId}`, { method: 'POST' });

            if (response.ok) {
                // Remove the restored user's row from the archived users table
                const row = e.target.closest('tr');
                if (row) {
                    row.remove(); // Remove the row from the archived users table
                }
            } else {
                alert('Error restoring user.');
            }
        });
    });
}
// Handle Add User form submission
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the form from submitting

    const formData = new FormData(e.target);

    // Show confirmation dialog before adding user
    const { isConfirmed } = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to add this user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, add it!',
        cancelButtonText: 'Cancel'
    });

    if (isConfirmed) {
        try {
            const response = await fetch('/add_user', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                await loadUsers(); // Reload users
                e.target.reset(); // Clear the form
                Swal.fire('Added!', 'User has been added successfully!', 'success'); // Success message
            } else {
                Swal.fire('Error!', 'There was an error adding the user.', 'error'); // Display error message
            }
        } catch (error) {
            Swal.fire('Error!', error.message, 'error'); // Display network error
        }
    }
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

            // Show confirmation dialog before saving
            const { isConfirmed } = await Swal.fire({
                title: 'Are you sure?',
                text: 'Do you want to save these changes?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, save it!',
                cancelButtonText: 'Cancel'
            });

            if (isConfirmed) {
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
                        Swal.fire('Saved!', 'User has been updated successfully!', 'success'); // Success message

                        // Optionally refresh the page to show the updated user list
                        // location.reload(); // Uncomment if you want to reload the page
                    } else {
                        Swal.fire('Error!', 'There was an error updating the user.', 'error'); // Display error message
                    }
                } catch (error) {
                    Swal.fire('Error!', error.message, 'error'); // Display network error
                }
            }
        }
    }

    // Handle Categories Button Click
    document.getElementById('categoriesBtn').addEventListener('click', () => {
        window.location.href = 'categories.html'; // Redirect to categories page
    });
});




// Fetch the archived users when the page loads
document.addEventListener('DOMContentLoaded', fetchArchivedUsers);
