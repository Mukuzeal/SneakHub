document.addEventListener('DOMContentLoaded', function () {
    const settingsButton = document.getElementById('sellerRegistration');
    if (settingsButton) {
        settingsButton.addEventListener('click', function () {
            // Redirect to the Flask route
            window.location.href = '/buyer-account-settings';
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout');

    logoutButton.addEventListener('click', function () {
        // Show SweetAlert confirmation popup
        Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, log me out!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Redirect to the logout route if confirmed
                window.location.href = '/logout';
            }
        });
    });
});
