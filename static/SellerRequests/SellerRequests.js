document.addEventListener("DOMContentLoaded", function() {
    fetch('/get-email')
      .then(response => response.json())
      .then(data => {
        if (data.email) {
          document.getElementById("email").value = data.email;
        } else {
          console.error("Error fetching email:", data.error);
        }
      })
      .catch(error => {
        console.error("Fetch error:", error);
      });
  });


