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
      "Adams": ["Barangay 1", "Barangay 2"], 
      "Bacarra": ["Barangay 3", "Barangay 4"], 
      "Badoc": ["Barangay 5", "Barangay 6"]
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