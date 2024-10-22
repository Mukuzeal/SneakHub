document.getElementById('forgotPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    
    // Show SweetAlert2 notification
    Swal.fire({
        title: 'Check Your Email',
        text: 'We will check if your email is in our database. If the email is found, we will send an email to change your password.',
        icon: 'info',
        confirmButtonText: 'OK'
    }).then((result) => {
        if (result.isConfirmed) {
            // If the user clicks "OK", submit the form
            this.submit();
        }
    });
});
