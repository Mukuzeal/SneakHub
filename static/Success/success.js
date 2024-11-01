$(document).ready(function() {
    $("#owl-carousel").owlCarousel({
      items: 1,                 // Show one item at a time
      loop: true,               // Enable infinite looping
      autoplay: true,           // Enable autoplay
      autoplayTimeout: 3000,    // Set time between transitions (3000 ms = 3 seconds)
      autoplayHoverPause: true, // Pause on hover
      dots: true,               // Show navigation dots
      responsiveRefreshRate: 200, // Refresh rate for responsiveness
      smartSpeed: 600           // Transition speed between images
    });
  });
  

 

// Get the modal and account icon elements
var modal = document.getElementById("account-modal");
var accountIcon = document.getElementById("account-button");

// Track the clicked state
var isClicked = false;

// Toggle modal on click
accountIcon.onclick = function () {
    isClicked = !isClicked;
    if (isClicked) {
        showModal();
    } else {
        hideModal();
    }
}

// Hide modal when clicking outside of it
window.onclick = function (event) {
    if (event.target !== accountIcon && !modal.contains(event.target)) {
        isClicked = false;
        hideModal();
    }
}

// Function to show the modal
function showModal() {
    const rect = accountIcon.getBoundingClientRect(); // Get button position in viewport
    modal.style.left = `${rect.left}px`; // Align with button horizontally
    modal.style.top = `${rect.bottom + 5}px`; // Position slightly below button
    modal.classList.add("show");
}

// Function to hide the modal
function hideModal() {
    modal.classList.remove("show");
}


  


// Fetch and display product data
function fetchProductData() {
    fetch('/item_listBUYER') // Endpoint to fetch all non-archived products
        .then(response => response.json())
        .then(data => {
            const productCardsContainer = document.getElementById('productCardsContainer');
            productCardsContainer.innerHTML = ''; // Clear previous data

            data.forEach(product => {
                // Create product card
                const card = document.createElement('div');
                card.className = 'col-md-3'; // Use Bootstrap's grid system
                card.setAttribute('data-id', product.id);

                // Use the product image path from the database
                const imagePath = `Uploads/pics/${product.product_image}`;

                card.innerHTML = `
                    <div class="product-card">
                        <img src="${imagePath}" class="product-image" alt="${product.product_name}"
                             onerror="this.onerror=null; this.src='Uploads/pics/default.jpg';" id="product-image-${product.id}">
                        <h5>${product.product_name}</h5>
                        <p>Price: $${product.product_price}</p>
                        <p>Description: ${product.product_description}</p>
                        <p>Quantity: ${product.product_quantity}</p>
                        <p>Brand: ${product.brand}</p>
                        <p>Category: ${product.product_category}</p>
                        <button onclick="changeImage(${product.id})">Change Image</button>
                        <input type="file" id="file-input-${product.id}" style="display: none;" accept="image/*" onchange="uploadImage(${product.id})">
                    </div>
                `;

                productCardsContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Call fetchProductData on page load to display the products
document.addEventListener('DOMContentLoaded', fetchProductData);





// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Assuming you have a function that fetches product data
function fetchProductData() {
    fetch('/item_listBUYER') // Adjust to your API endpoint
        .then(response => response.json())
        .then(data => {
            // Shuffle the product data array
            const shuffledData = shuffleArray(data);

            const productCardsContainer = document.getElementById('productCardsContainer');
            productCardsContainer.innerHTML = ''; // Clear previous data

            shuffledData.forEach(product => {
                // Create product card
                const card = document.createElement('div');
                card.className = 'col-md-3'; // Use bootstrap grid system
                card.setAttribute('data-id', product.id);

                // Use the product image path (direct from database)
                const imagePath = `Uploads/pics/${product.product_image}`;

                card.innerHTML = `
                    <div class="product-card">
                        <img src="${imagePath}" class="product-image" alt="${product.product_name}"
                            onerror="this.onerror=null; this.src='Uploads/pics/default.jpg';" id="product-image-${product.id}">
                        <h5>${product.product_name}</h5>
                        <p>Price: $${product.product_price}</p>
                    </div>
                `;

                productCardsContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}




  

function setSessionData() {
    // Any logic you need to perform before redirecting can go here
    // For example, setting values in session storage if needed

    // Redirect to the success page
    window.location.href = '/success';
}


document.getElementById("profile").addEventListener("click", function() {
    window.location.href = "/buyer-profile";  // Adjust this if the route is different
});

document.addEventListener("DOMContentLoaded", function () {
    const userId = document.querySelector('.profile-container').dataset.userId;
    if (userId) {
        // Construct the image paths based on the user_id
        const imagePathPng = `static/Uploads/pics/${userId}-profile-image.png`;
        const imagePathJpg = `static/Uploads/pics/${userId}-profile-image.jpg`;

        // Create an image element to check if the profile image exists
        const tempImage = new Image();

        // Check .png file
        tempImage.onload = function () {
            document.getElementById('profileImage').src = imagePathPng;
        };
        tempImage.onerror = function () {
            // If .png doesn't exist, check for .jpg
            tempImage.src = imagePathJpg;
            tempImage.onload = function () {
                document.getElementById('profileImage').src = imagePathJpg;
            };
            tempImage.onerror = function () {
                // If neither image exists, keep default
                console.log("No profile image found; using default.");
            };
        };
        
        // Start the check with the .png image path
        tempImage.src = imagePathPng;
    }
});

function uploadProfileImage() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (file) {
        const formData = new FormData();
        formData.append('profile_image', file);

        fetch('/upload-profile-image', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update the profile image preview
                document.getElementById('profileImage').src = `/static/Uploads/pics/${data.imageName}`;
                
                // Show SweetAlert for successful upload
                Swal.fire({
                    title: 'Success!',
                    text: 'Uploading is successful.',
                    icon: 'success',
                    confirmButtonText: 'Okay'
                });
            } else {
                // Show SweetAlert for error during upload
                Swal.fire({
                    title: 'Error!',
                    text: data.error || 'Failed to upload image.',
                    icon: 'error',
                    confirmButtonText: 'Okay'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Show SweetAlert for any unexpected errors
            Swal.fire({
                title: 'Error!',
                text: 'An unexpected error occurred.',
                icon: 'error',
                confirmButtonText: 'Okay'
            });
        });
    } else {
        // Show SweetAlert when no file is selected
        Swal.fire({
            title: 'No File Selected',
            text: 'Please select an image to upload.',
            icon: 'warning',
            confirmButtonText: 'Okay'
        });
    }
}




// Fetch user profile data from the server
document.addEventListener('DOMContentLoaded', () => {
    fetch('/profile/data')
        .then(response => response.json())
        .then(data => {
            if (!data.error) {
                document.getElementById('username').innerText = data.name || "Add name";
                document.getElementById('fullName').innerText = data.FullName || "Add name";
                document.getElementById('email').innerText = data.email || "email@example.com";
                document.getElementById('bio').innerText = data.bio || "No Bio";
                // Handle profile image similarly if needed
            } else {
                console.error(data.error);
            }
        })
        .catch(err => console.error('Error fetching profile data:', err));
});

function openEditModal() {
    document.getElementById("modal-profile").style.display = "block";
}

function closeEditModal() {
    document.getElementById("modal-profile").style.display = "none";
}

// Function to send OTP to the user's email
let isEmailVerified = false; // Variable to track email verification status

function sendOtp() {
    const email = document.getElementById("editEmail").value;

    // Check if the email field is empty
    if (!email) {
        Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: 'Please enter your email.'
        });
        return;
    }

    // Make an AJAX request to send the OTP
    fetch('/send_otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'OTP sent successfully!'
            });
            document.getElementById("modal-otp").style.display = "block"; // Show OTP modal
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message // Show error message if email is already in use
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while sending OTP.'
        });
    });
}

function verifyOtp() {
    const otp = document.getElementById("otpInput").value;

    // Check if the OTP field is empty
    if (!otp) {
        Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: 'Please enter the OTP.'
        });
        return;
    }

    console.log('Verifying OTP:', otp); // Debugging log

    // Make an AJAX request to verify the OTP
    fetch('/verify_otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp: otp })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Verified',
                text: 'OTP verified successfully!'
            });
            isEmailVerified = true; // Update verification status
            closeModal('modal-otp'); // Close OTP modal

            // Show the submit button after successful verification
            document.getElementById("submitButton").style.display = "block"; // Show the submit button
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message // Show error if OTP is invalid or expired
            });
        }
    })
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none"; // Hide the modal
    }
}

// Disable the submit button initially
document.getElementById("submitButton").style.display = "none"; // Ensure the submit button is hidden

// Add event listener for the form submission
document.getElementById("editProfileForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById("editEmail").value;
    const fullName = document.getElementById("editFullName").value;
    const bio = document.getElementById("editBio").value;
    const username = document.getElementById("editUsername").value;

    // Make an AJAX request to update the profile information
    fetch('/update_profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            fullName: fullName,
            bio: bio,
            username: username
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Log the full response for debugging

        if (data.success) {
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your profile information has been successfully updated.'
            }).then(() => {
                // Close the modal
                closeEditModal();
        
                // Reload the page after the modal is closed
                location.reload(); // This will refresh the page
            });
        } else {
            // Show error message from server
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message
            });
        }
    });
});



