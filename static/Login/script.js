// Handling form switching between sign-in and sign-up
const signInBtn = document.getElementById("signIn");
const signUpBtn = document.getElementById("signUp");
const firstForm = document.getElementById("form1");
const secondForm = document.getElementById("form2");
const container = document.querySelector(".container");


signInBtn.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

signUpBtn.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

// Disable body scroll function
const disableBodyScroll = () => document.body.style.overflow = 'hidden';
// Enable body scroll function
const enableBodyScroll = () => document.body.style.overflow = '';

// Sign Up form submission
firstForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the form from submitting

    const formData = new FormData(firstForm);

    try {
        const response = await fetch('/submit_form', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            disableBodyScroll();
            Swal.fire({
                title: 'Success!',
                text: data.message,
                icon: 'success',
                scrollbarPadding: false,
                confirmButtonText: 'OK',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false
            }).then(() => {
                firstForm.reset(); // Clear form inputs
                container.classList.remove("right-panel-active"); // Switch back to sign-in form
                enableBodyScroll();
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'There was an error submitting the form.',
                icon: 'error',
                confirmButtonText: 'OK',
                scrollbarPadding: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false
            });
        }
    } catch (error) {
        Swal.fire({
            title: 'Error!',
            text: 'An error occurred: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK',
            scrollbarPadding: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false
        });
    }
});

// Sign In form submission
secondForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the form from submitting

    const formData = new FormData(secondForm);

    try {
        const response = await fetch('/login', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            disableBodyScroll();
            Swal.fire({
                title: 'Success!',
                text: 'Sign-In Successful!',
                icon: 'success',
                confirmButtonText: 'OK',
                scrollbarPadding: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false
            }).then(() => {
                enableBodyScroll();
                if (data.redirect === 'success') {
                    window.location.href = `/success?name=${encodeURIComponent(data.name)}`;
                } else if (data.redirect === 'admin') {
                    window.location.href = `/admin?name=${encodeURIComponent(data.name)}`;
                } else if (data.redirect === 'seller') { // Ensure you handle the seller redirect
                    window.location.href = `/seller?name=${encodeURIComponent(data.name)}`;
                }
            });
        } else {
            const data = await response.json();
            Swal.fire({
                title: 'Error!',
                text: data.error,
                icon: 'error',
                confirmButtonText: 'OK',
                scrollbarPadding: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false
            });
        }
    } catch (error) {
        Swal.fire({
            title: 'Error!',
            text: 'An error occurred: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK',
            scrollbarPadding: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false
        });
    }
});


document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function () {
        const passwordInput = this.previousElementSibling; // Get the input before the button
        const showIcon = this.querySelector('.toggle-icon'); // Get the icon inside the button
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            showIcon.src = 'static/images/hide.png'; // Set to hide icon
            showIcon.alt = 'Hide'; // Update alt text
        } else {
            passwordInput.type = 'password';
            showIcon.src = 'static/images/show.png'; // Set to show icon
            showIcon.alt = 'Show'; // Update alt text
        }
    });
});


document.getElementById('sendOtpButton').addEventListener('click', function () {
    const email = document.getElementById('email').value;

    if (!email.includes("@gmail.com")) {
        alert("Please enter a valid Gmail address.");
        return;
    }

    // Call server to send OTP
    fetch('/send_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('otpSection').style.display = 'block';
            alert("OTP has been sent to your email.");
        } else {
            alert("Error sending OTP.");
        }
    });
});

document.getElementById("verifyOtpButton").addEventListener("click", function () {
    const enteredOtp = document.getElementById("otp").value;

    // Send the entered OTP to the server for verification
    fetch('/verify_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: enteredOtp })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // OTP verified, show password fields
            alert("OTP verified successfully.");
            document.getElementById("passwordSection").style.display = "block";
            document.getElementById("submitButton").style.display = "block";
            document.getElementById("email").disabled = true;
            document.getElementById("otpSection").style.display = "none";
            document.getElementById("sendOtpButton").style.display = "none";
            document.getElementById("submitButton").disabled = false;
        } else {
            alert(result.message || "Incorrect OTP. Please try again.");
        }
    });
});

document.getElementById("submitButton").addEventListener("click", function() {
    document.getElementById("email").disabled = false; // Ensure it's enabled for submission
});


// Function to reset the sign-up form
function resetSignupForm() {
    // Hide the password section and reset the fields
    document.getElementById("otpSection").style.display = "none"; // Hide OTP section
    document.getElementById("passwordSection").style.display = "none"; // Hide password section
    document.getElementById("email").value = ""; // Clear the email field
    document.getElementById("otp").value = ""; // Clear the OTP field
    document.getElementById("password").value = ""; // Clear the password field
    document.getElementById("confpass").value = ""; // Clear the confirm password field
    document.getElementById("submitButton").disabled = true; // Disable the submit button
    document.getElementById("submitButton").style.display = "none"; // Hide the submit button
}

// Event listener for the Sign Up button
document.getElementById("signUp").addEventListener("click", function() {
    resetSignupForm(); // Reset the sign-up form before showing it
    // Show the sign-up form and hide the sign-in form
    document.getElementById("sendOtpButton").style.display = "block"; // Hide the submit button
    document.getElementById("email").disabled = false; // Clear the email field
});




