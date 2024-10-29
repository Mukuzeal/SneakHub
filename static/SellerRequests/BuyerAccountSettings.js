
    document.getElementById("sellerRegistration").addEventListener("click", function() {
        window.location.href = "{{ url_for('requests') }}"; // Ensure 'requests' matches the Flask route name
    });
 