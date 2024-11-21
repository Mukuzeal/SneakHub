document.addEventListener("DOMContentLoaded", function() {
  // Fetch email
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


function validatePhoneNumber(input) {
  // Remove non-digit characters
  input.value = input.value.replace(/\D/g, '');
  
  // Restrict to 11 characters
  if (input.value.length > 11) {
    input.value = input.value.slice(0, 11);
  }
}



// Ensure DOM is loaded before adding event listeners
document.addEventListener("DOMContentLoaded", function() {
  // Populate regions on page load
  const regionSelect = document.getElementById("region");
  for (let region in addressData) {
    let option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    regionSelect.appendChild(option);
  }

  // Event listeners
  regionSelect.addEventListener("change", handleRegionChange);
  document.getElementById("province").addEventListener("change", handleProvinceChange);
  document.getElementById("municipality").addEventListener("change", handleMunicipalityChange);
  document.getElementById("confirmAddress").addEventListener("click", confirmAddress);
});

// Address selection logic
const addressData = {
  "Region I – Ilocos Region": {
    "Ilocos Norte": {
      "Adams": ["Adams"], 
      "Bacarra": ["Barangay 3", "Barangay 4"], 
      "Badoc": ["Barangay 5", "Barangay 6"],
      "Bangui": ["Barangay 5", "Barangay 6"],
      "Banna": ["Barangay 5", "Barangay 6"],
      "Batac": ["Barangay 5", "Barangay 6"],
      "Burgos": ["Barangay 5", "Barangay 6"],
      "Carasi": ["Barangay 5", "Barangay 6"],
      "Currimao": ["Barangay 5", "Barangay 6"],
      "Dingras": ["Barangay 5", "Barangay 6"],
      "Dumalneg": ["Barangay 5", "Barangay 6"],
      "Laoag": ["Barangay 5", "Barangay 6"],
      "Marcos": ["Barangay 5", "Barangay 6"],
      "Nueva Era": ["Barangay 5", "Barangay 6"],
      "Pagudpud": ["Barangay 5", "Barangay 6"],
      "Paoay": ["Barangay 5", "Barangay 6"],
      "Pasuquin": ["Barangay 5", "Barangay 6"],
      "Piddig": ["Barangay 5", "Barangay 6"],
      "Pinili": ["Barangay 5", "Barangay 6"],
      "San Nicolas": ["Barangay 5", "Barangay 6"],
      "Sarrat": ["Barangay 5", "Barangay 6"],
      "Solsona": ["Barangay 5", "Barangay 6"],
      "Vintar": ["Barangay 5", "Barangay 6"],
    },
    "Ilocos Sur": ["Vigan City", "Candon City", "Santa"],
    "La Union": ["San Fernando", "Bauang", "Agoo"],
    "Pangasinan": ["Dagupan", "San Carlos", "Lingayen"]
  },
  "Region II – Cagayan Valley": {
    "Batanes": ["Basco", "Ivana", "Mahatao"],
    "Cagayan": ["Tuguegarao", "Aparri", "Baggao"],
    "Isabela": ["Ilagan", "Cauayan", "Santiago"],
    "Nueva Vizcaya": ["Bayombong", "Solano", "Kayapa"],
    "Quirino": ["Cabarroguis", "Diffun", "Saguday"]
  },
  "Region III – Central Luzon": {
    "Aurora": ["Baler", "Dilasag", "Maria Aurora"],
    "Bataan": ["Balanga", "Dinalupihan", "Orani"],
    "Bulacan": ["Malolos", "Meycauayan", "San Jose del Monte"],
    "Nueva Ecija": ["Cabanatuan", "San Jose", "Gapan"]
  }
};

// Handle region change
function handleRegionChange() {
  const provinceSelect = document.getElementById("province");
  const municipalitySelect = document.getElementById("municipality");
  
  provinceSelect.innerHTML = "<option value=''>Select Province</option>";
  municipalitySelect.innerHTML = "<option value=''>Select Municipality</option>";
  municipalitySelect.disabled = true;

  const selectedRegion = this.value;

  if (selectedRegion) {
    provinceSelect.disabled = false;
    for (let province in addressData[selectedRegion]) {
      let option = document.createElement("option");
      option.value = province;
      option.textContent = province;
      provinceSelect.appendChild(option);
    }
  } else {
    provinceSelect.disabled = true;
  }
}

// Handle province change
function handleProvinceChange() {
  const municipalitySelect = document.getElementById("municipality");
  const selectedRegion = document.getElementById("region").value;
  const selectedProvince = this.value;

  municipalitySelect.innerHTML = "<option value=''>Select Municipality</option>";
  municipalitySelect.disabled = true;

  if (selectedProvince) {
    municipalitySelect.disabled = false;
    const municipalities = addressData[selectedRegion][selectedProvince];
    
    if (Array.isArray(municipalities)) {
      municipalities.forEach(municipality => {
        let option = document.createElement("option");
        option.value = municipality;
        option.textContent = municipality;
        municipalitySelect.appendChild(option);
      });
    } else {
      for (let municipality in municipalities) {
        let option = document.createElement("option");
        option.value = municipality;
        option.textContent = municipality;
        municipalitySelect.appendChild(option);
      }
    }
  }
}

// Handle municipality change
function handleMunicipalityChange() {
  const barangaySelect = document.getElementById("barangay");
  const selectedRegion = document.getElementById("region").value;
  const selectedProvince = document.getElementById("province").value;
  const selectedMunicipality = this.value;

  barangaySelect.innerHTML = "<option value=''>Select Barangay</option>";
  barangaySelect.disabled = true;

  if (selectedMunicipality) {
    barangaySelect.disabled = false;
    const barangays = addressData[selectedRegion][selectedProvince][selectedMunicipality];
    barangays.forEach(barangay => {
      let option = document.createElement("option");
      option.value = barangay;
      option.textContent = barangay;
      barangaySelect.appendChild(option);
    });
  }
}

// Confirm address selection
function confirmAddress() {
  const region = document.getElementById("region").value;
  const province = document.getElementById("province").value;
  const municipality = document.getElementById("municipality").value;
  const barangay = document.getElementById("barangay").value;

  if (region && province && municipality && barangay) {
    const address = `${barangay}, ${municipality}, ${province}, ${region}`;
    document.getElementById("pickupAddress").value = address;
    closeModal(); // Assuming closeModal is defined elsewhere
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Incomplete Selection',
      text: 'Please select all required fields!',
    });
  }
}

// Modal open/close functions
function openModal() {
  document.getElementById("modalOverlay").style.display = "flex"; // Change to flex to show modal
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none"; // Hide modal
}

// Example button click to open modal
document.getElementById("pickupAddress").addEventListener("click", openModal);


document.getElementById("sellerForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the default form submission

  const form = this;
  const formData = new FormData(form);

  fetch(form.action, {
    method: form.method,
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        // Show SweetAlert for successful submission
        Swal.fire({
          title: "Success!",
          text: "Your seller request has been submitted successfully.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href = "/success"; // Redirect to success page after confirmation
        });
      } else {
        return response.text().then((err) => {
          throw new Error(err);
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);

      // Show SweetAlert for submission failure
      Swal.fire({
        title: "Error!",
        text: "There was an issue submitting your request. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    });
});