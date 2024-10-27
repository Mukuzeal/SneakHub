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
      var rect = accountIcon.getBoundingClientRect();
      modal.style.left = rect.left + "px";
      modal.style.top = rect.bottom + window.scrollY + "px";
      modal.classList.add("show");
  }
  
  // Function to hide the modal
  function hideModal() {
      modal.classList.remove("show");
  }
  
  

  
  