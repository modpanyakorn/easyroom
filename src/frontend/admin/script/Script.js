const modal = document.getElementById("roomModal");
const closeModal = document.querySelector(".close");
const saveStatusButton = document.getElementById("saveStatus");
const statusSelect = document.getElementById("status");
const roomDetailTitle = document.getElementById("roomDetailTitle");
const equipmentDropdown = document.getElementById("equipmentDropdown");
const newEquipmentInput = document.getElementById("newEquipment");
const equipmentQuantityInput = document.getElementById("equipmentQuantity");
const addEquipmentButton = document.getElementById("addEquipment");
const removeEquipmentButton = document.getElementById("removeEquipment");
const categoryItems = document.querySelectorAll('.categories li');
const reports = document.querySelectorAll('.reports .report');

// Event listener for category list items
categoryItems.forEach(item => {
  item.addEventListener('click', function() {
    const category = item.getAttribute('data-category'); // Get category from the clicked list item
    filterReports(category);
  });
});

// Function to filter reports by category
function filterReports(category) {
  reports.forEach(report => {
    if (report.getAttribute('data-category') === category) {
      report.style.display = 'block';  // Show the report
    } else {
      report.style.display = 'none';   // Hide the report
    }
  });
}

// Optional: Implement search functionality within filtered reports
document.getElementById('searchInput').addEventListener('input', function(event) {
  const query = event.target.value.toLowerCase();
  reports.forEach(report => {
    const text = report.textContent.toLowerCase();
    if (text.includes(query)) {
      report.style.display = 'block';
    } else {
      report.style.display = 'none';
    }
  });
});

// Global variable to store the current room element being edited
let currentRoomElement = null;

// Open the modal and display the room details
function manageRoom(roomId) {
  currentRoomElement = document.getElementById(roomId);
  const roomName = currentRoomElement.innerText;

  // Set the title to show room details
  roomDetailTitle.innerText = `รายละเอียดห้อง : ${roomName}`;

  // Determine current status (Available/Not Available)
  const currentStatus = currentRoomElement.classList.contains('available') ? 'available' : 'not-available';
  statusSelect.value = currentStatus === 'available' ? 'available' : 'not-available';

  // Load equipment list from localStorage
  loadEquipmentList(roomId);

  // Show the modal
  modal.style.display = "block";
}

// Load the equipment list from localStorage
function loadEquipmentList(roomId) {
  const savedEquipment = JSON.parse(localStorage.getItem(roomId + '_equipment')) || [];
  equipmentDropdown.innerHTML = ''; // Clear existing dropdown options

  const defaultOption = document.createElement('option');
  defaultOption.value = "";
  defaultOption.textContent = "เลือกอุปกรณ์";
  equipmentDropdown.appendChild(defaultOption);

  // Count equipment occurrences
  const equipmentCount = {};
  savedEquipment.forEach(item => {
    equipmentCount[item] = (equipmentCount[item] || 0) + 1;
  });

  // Populate dropdown with equipment and counts
  Object.entries(equipmentCount).forEach(([item, count]) => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = `${item} (${count})`;
    equipmentDropdown.appendChild(option);
  });
}


// Add new equipment with quantity
addEquipmentButton.onclick = function () {
  const newEquipment = newEquipmentInput.value.trim();
  const quantity = parseInt(equipmentQuantityInput.value, 10);

  if (newEquipment && quantity > 0 && !isNaN(quantity)) {
    const savedEquipment = JSON.parse(localStorage.getItem(currentRoomElement.id + '_equipment')) || [];

    // Add the equipment multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      savedEquipment.push(newEquipment);
    }

    localStorage.setItem(currentRoomElement.id + '_equipment', JSON.stringify(savedEquipment));
    loadEquipmentList(currentRoomElement.id); // Reload the equipment list

    // Clear the inputs
    newEquipmentInput.value = '';
    equipmentQuantityInput.value = '';
  } else {
    alert("กรุณากรอกชื่ออุปกรณ์และจำนวนให้ถูกต้อง");
  }
}

// Remove selected equipment
removeEquipmentButton.onclick = function () {
  const selectedEquipment = equipmentDropdown.value;
  if (selectedEquipment) {
    let savedEquipment = JSON.parse(localStorage.getItem(currentRoomElement.id + '_equipment')) || [];
    savedEquipment = savedEquipment.filter(item => item !== selectedEquipment);
    localStorage.setItem(currentRoomElement.id + '_equipment', JSON.stringify(savedEquipment));
    loadEquipmentList(currentRoomElement.id); // Reload the equipment list
  }
}

// Save the room status and update the room element
saveStatusButton.onclick = function () {
  const selectedStatus = statusSelect.value;

  if (selectedStatus === "available") {
    currentRoomElement.classList.add('available');
    currentRoomElement.classList.remove('not-available');
  } else {
    currentRoomElement.classList.add('not-available');
    currentRoomElement.classList.remove('available');
  }

  // Save the room status in localStorage
  localStorage.setItem(currentRoomElement.id, selectedStatus);

  // Close the modal after saving
  modal.style.display = "none";
}

// Close the modal
closeModal.onclick = function () {
  modal.style.display = "none";
}

// Close the modal if clicked outside of it
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

// Load room status from localStorage when the page reloads
window.onload = function () {
  const rooms = document.querySelectorAll('.room');

  rooms.forEach(room => {
    const savedStatus = localStorage.getItem(room.id);

    if (savedStatus) {
      if (savedStatus === "available") {
        room.classList.add('available');
        room.classList.remove('not-available');
      } else {
        room.classList.add('not-available');
        room.classList.remove('available');
      }
    }
  });
}