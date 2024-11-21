document.addEventListener("DOMContentLoaded", function () {
    // Fetch and populate seller requests
    fetch('/get_seller_requests')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('sellerRequestTableBody');
            tableBody.innerHTML = data.map(request => `
                <tr>
                    <td>${request.request_id}</td>
                    <td>${request.user_id}</td>
                    <td>${request.fullname}</td>
                    <td>
                        <strong>${request.ShopName}</strong><br>
                        Phone: ${request.PhoneNo}<br>
                        Address: ${request.PickUpAdd}, ${request.Street}<br>
                        Email: ${request.Email}
                    </td>
                    <td>${request.submitted_at}</td>
                    <td>${request.request_status}</td>
                    <td>
                        <button class="btn btn-primary" onclick="handleAction(${request.request_id}, 'Accepted')">Accept</button>
                        <button class="btn btn-danger" onclick="handleAction(${request.request_id}, 'Rejected')">Reject</button>
                    </td>
                </tr>
            `).join('');
        });

    
    

    // Handle Accept/Reject button clicks
    window.handleAction = (requestId, action) => {
        const commentsModal = new bootstrap.Modal(document.getElementById('commentsModal'));
        commentsModal.show();

        const saveButton = document.getElementById('saveCommentsButton');
        saveButton.onclick = () => {
            const comments = document.getElementById('commentsText').value;

            fetch(`/update_seller_request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_id: requestId, status: action, comments })
            })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        Swal.fire({
                            title: 'Success!',
                            text: `Request has been ${action.toLowerCase()} successfully.`,
                            icon: 'success',
                            confirmButtonText: 'OK'
                        }).then(() => location.reload());
                    } else {
                        Swal.fire({
                            title: 'Error!',
                            text: 'An error occurred. Please try again.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                });
        };
    };
});