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
    function colorLink() {
        if (linkColor) {
            linkColor.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        }
    }
    linkColor.forEach(l => l.addEventListener('click', colorLink));

    // JavaScript functions for navigation links
    function goToDashboard() {
        window.location.href = 'dashboard.html'; // Update to the correct dashboard path
    }

    function goToItemList() {
        window.location.href = 'item_list.html'; // Update to the correct item list path
    }

    function goToselleraddproduct() {
        window.location.href = 'selleraddproduct.html'; // Redirects to the Add Product page
    }

    function goToUpdates() {
        window.location.href = 'updates.html'; // Update to the correct updates path
    }

    function goToTutorial() {
        window.location.href = 'tutorial.html'; // Update to the correct tutorial path
    }

    function goToAccountSettings() {
        window.location.href = 'account_settings.html'; // Update to the correct account settings path
    }

    function logout() {
        alert("Logging out");
        // Logic to log out the user, redirect or clear session as needed
    }

    // Handle form submission
    const form = document.querySelector("form");
    form.addEventListener("submit", function(e) {
        e.preventDefault(); // Prevent default form submission
        const formData = new FormData(form);

        fetch("{{ url_for('submit_product') }}", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.message && data.image_url) {
                // Show SweetAlert2 with a success message including the product info and image
                Swal.fire({
                    title: 'Product Added Successfully!',
                    text: data.message,
                    icon: 'success',
                    imageUrl: data.image_url, // Show the uploaded product image
                    imageWidth: 400,
                    imageAlt: 'Product Image',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Redirect to the item list or another page after the notification
                    window.location.href = '/item_list'; // Change to your desired redirection path
                });
            } else if (data.error) {
                // Show SweetAlert2 error message if there's any error
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: data.error
                });
            }
        })
        .catch(error => {
            // Handle any unexpected errors
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'An unexpected error occurred. Please try again.'
            });
        });
    });
});
