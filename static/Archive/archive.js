// Function to fetch archived users and populate the table
async function fetchArchivedUsers() {
    console.log('Fetching archived users...'); // Add this to debug
    try {
        const response = await fetch('/archived_users'); // Fetch archived users from the server
        const users = await response.json(); // Parse the JSON response
        console.log('Archived users fetched:', users); // Add this to debug

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


// Fetch the archived users when the page loads
document.addEventListener('DOMContentLoaded', fetchArchivedUsers);



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










