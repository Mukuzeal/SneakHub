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
    const currentPage = window.location.pathname; // Get current page path

    linkColor.forEach(link => {
        // Match the href attribute or manually check the URL for each link
        if (currentPage.includes("itemList.html")) {
            if (link.textContent.trim() === "Item List") {
                link.classList.add('active');
            }
        } else if (currentPage.includes("add-product")) {
            if (link.textContent.trim() === "Add Item") {
                link.classList.add('active');
            }
        } else if (currentPage.includes("updateList.html")) {
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

    // JavaScript functions for navigation links
    function goToDashboard() {
        window.location.href = 'seller.html'; // Update to the correct dashboard path
    }

    function goToItemList() {
        window.location.href = 'itemList.html'; // Update to the correct item list path
    }

    function goToselleraddproduct() {
        window.location.href = 'selleraddproduct.html'; // Redirects to the Add Product page
    }

    function goToUpdates() {
        window.location.href = 'UpdateList.html'; // Update to the correct updates path
    }

    function goToAccountSettings() {
        window.location.href = 'AccountSettings.html'; // Update to the correct account settings path
    }

    function logout() {
        alert("Logging out");
        // Logic to log out the user, redirect or clear session as needed
    }

    // Handle form submission
    const form = document.querySelector("#addProductForm");

    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();  // Prevent the default form submission
            const formData = new FormData(form);

            // Send the form data via AJAX (fetch)
            fetch("/submit_product", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.message && data.image_url) {
                    // Display success notification using SweetAlert2
                    Swal.fire({
                        title: 'Product Added Successfully!',
                        text: data.message,
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        // Redirect to another page after success
                        addProductForm.reset();
                    });
                } else if (data.error) {
                    // Display error notification
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
    }
});
