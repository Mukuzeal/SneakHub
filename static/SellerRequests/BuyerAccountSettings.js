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


// Store the field that is being edited
let currentField = "";

// Open the edit modal and set up the input for the correct field
function openEditModal(field) {
    currentField = field; // Store the current field being edited
    const fieldValue = document.getElementById(field).innerText;

    // Set the modal title and pre-fill the input field with the current value
    document.getElementById("modalTitle").innerText = `Edit ${capitalizeFirstLetter(field)}`;
    document.getElementById("editInput").value = fieldValue;

    // Show the modal
    document.getElementById("editModal").style.display = "block";
}

// General Close Modal Function
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    } else {
        console.error(`Modal with ID ${modalId} not found.`);
    }
}


// Save the changes when the user clicks "Save"
function saveChanges() {
    const newValue = document.getElementById("editInput").value;

    // Map the frontend field names to what the backend expects
    const fieldMap = {
        'username': 'username',
        'fullName': 'fullName',
        'bio': 'bio'
    };

    // Get the correct field name for the backend
    const fieldName = fieldMap[currentField];

    fetch('/update_profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            field: fieldName,
            value: newValue
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the UI
            document.getElementById(currentField).innerText = newValue;
            
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Updated Successfully',
                text: `Your ${currentField} has been updated.`,
                confirmButtonColor: '#4723D9'
            });

            // Close the modal
            closeModal('editModal');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: data.message || 'Failed to update profile',
                confirmButtonColor: '#4723D9'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred',
            confirmButtonColor: '#4723D9'
        });
    });
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
    
}

let isOtpVerified = false; // Tracks if OTP verification is successful

// Open the Change Email Modal
function openEmailModal() {
    document.getElementById("emailModal").style.display = "block";
    document.getElementById("sendOtpButton").style.display = "block";
    document.getElementById("otpSection").style.display = "none";
    document.getElementById("saveEmailButton").style.display = "none";
}





// Send OTP to the provided email
function sendOtp() {
    const email = document.getElementById("newEmailInput").value;

    if (!email) {
        Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: 'Please enter an email address.',
        });
        return;
    }

    // Send OTP request to the server
    fetch('/send_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to send OTP.');
                });
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'OTP Sent',
                text: 'An OTP has been sent to your email.',
            });

            // Show OTP input section
            document.getElementById("otpSection").style.display = "block";
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message,
            });
        });
}



// Verify OTP
function verifyOtp() {
    const otp = document.getElementById("otpInput").value;

    if (!otp) {
        Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: 'Please enter the OTP.',
        });
        return;
    }

    // Verify OTP request
    fetch('/verify_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'OTP Verified',
                    text: 'The OTP is correct.',
                });

                isOtpVerified = true;

                // Disable the email input field after OTP verification
                document.getElementById("newEmailInput").disabled = true;

                // Hide the "Send OTP" button and show the "Save" button
                document.getElementById("sendOtpButton").style.display = "none"; // Hide the Send OTP button
                document.getElementById("saveEmailButton").style.display = "block"; // Show the Save button
                document.getElementById("otpSection").style.display = "none"; // Optionally hide OTP section
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Invalid OTP. Please try again.',
                });
            }
        })
        .catch(error => {
            console.error('Error verifying OTP:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while verifying the OTP.',
            });
        });
}

// Save the new email
function saveEmail() {
    const email = document.getElementById("newEmailInput").value;

    if (!isOtpVerified) {
        Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: 'Please verify your email before saving.',
        });
        return;
    }

    // Save email request
    fetch('/update_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Email Updated',
                    text: 'Your email has been successfully updated.',
                });

                // Update the email on the profile page
                document.getElementById("email").innerText = email; // Update the email in the HTML

                // Close the email modal
                closeModal('emailModal');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update email.',
                });
            }
        })
        .catch(error => {
            console.error('Error updating email:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while updating the email.',
            });
        });
}

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
                
                Swal.fire({
                    title: 'Success!',
                    text: 'Profile image updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#4723D9'
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: data.error || 'Failed to upload image',
                    icon: 'error',
                    confirmButtonColor: '#4723D9'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error!',
                text: 'An unexpected error occurred',
                icon: 'error',
                confirmButtonColor: '#4723D9'
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const userId = document.querySelector('.profile-container').dataset.userId;
    if (userId) {
        // Try to load user's profile image if it exists
        const profileImage = document.getElementById('profileImage');
        const imagePathPng = `/static/Uploads/pics/${userId}-profile-image.png`;
        const imagePathJpg = `/static/Uploads/pics/${userId}-profile-image.jpg`;

        // Try PNG first
        fetch(imagePathPng)
            .then(response => {
                if (response.ok) {
                    profileImage.src = imagePathPng;
                } else {
                    // If PNG doesn't exist, try JPG
                    return fetch(imagePathJpg);
                }
            })
            .then(response => {
                if (response.ok) {
                    profileImage.src = imagePathJpg;
                }
            })
            .catch(() => {
                // If both fail, keep default image
                console.log("No custom profile image found");
            });
    }
});





