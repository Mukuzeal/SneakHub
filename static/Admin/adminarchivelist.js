document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#userTable tbody");

    // Fetch user data
    fetch('/get_usersArchive')
        .then(response => response.json())
        .then(data => {
            // Clear any existing rows
            tableBody.innerHTML = "";

            // Add each user to the table
            data.forEach(user => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${user['User ID']}</td>
                    <td>${user['Username']}</td>
                    <td>${user['Full Name']}</td>
                    <td>${user['Email']}</td>
                    <td>${user['User Type']}</td>
                    <td>
                        <button class="archive-btn" data-user-id="${user['User ID']}">Restore</button>
                    </td>
                `;

                tableBody.appendChild(row);
            });

            // Attach event listeners to Archive buttons
            document.querySelectorAll('.archive-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const userId = e.target.getAttribute('data-user-id');
                    confirmArchive(userId);
                });
            });
        })
        .catch(error => console.error("Error fetching user data:", error));
});

// SweetAlert confirmation and database update
function confirmArchive(userId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "This user will be restore!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, restore it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Send POST request to archive the user
            fetch('/restore_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire(
                            'Restored!',
                            'The user has been restored.',
                            'success'
                        );

                        // Refresh the table (re-fetch data)
                        document.dispatchEvent(new Event("DOMContentLoaded"));
                    } else {
                        Swal.fire('Error!', data.message, 'error');
                    }
                })
                .catch(error => console.error("Error archiving user:", error));
        }
    });
}
