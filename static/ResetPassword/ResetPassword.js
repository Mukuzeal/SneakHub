function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    button.innerHTML = type === 'password' ? '<i class="fa fa-eye"></i>' : '<i class="fa fa-eye-slash"></i>';
  }

  $('.password').on('keyup', function() {
    var p_c = $('#p-c');
    var p = $('#p');

    if (p.val().length > 0) {
      if (p.val() != p_c.val()) {
        $('#valid').html("Passwords Don't Match");
      } else {
        $('#valid').html('');
      }

      var s = 'weak';
      if (p.val().length > 5 && p.val().match(/\d+/g)) {
        s = 'medium';
      }
      if (p.val().length > 6 && p.val().match(/[^\w\s]/gi)) {
        s = 'strong';
      }
      $('#strong span').addClass(s).html(s);
    }
  });

  $('#myform-search').on('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const password = $('#p').val();
    const confirmPassword = $('#p-c').val();

    if (password !== confirmPassword) {
      Swal.fire({
        title: 'Error!',
        text: "Passwords Don't Match",
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    // If validation passes, show success notification
    Swal.fire({
      title: 'Success!',
      text: 'Your password has been changed successfully.',
      icon: 'success',
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.isConfirmed) {
        // You can perform the actual form submission here
        this.submit(); // Submit the form after the alert is confirmed
      }
    });
  });