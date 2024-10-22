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
