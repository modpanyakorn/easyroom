// ตัวแปรเก็บข้อมูล
// let roomData = [];
// let allData = [];

// // ฟังก์ชันโหลดห้องจาก API
// function loadRoomOptions() {
//   fetch(`${window.CONFIG.API_URL}/executive/rooms`)
//     .then(response => response.json())
//     .then(rooms => {
//       const roomFilter = document.getElementById('roomFilter');
//       rooms.forEach(room => {
//         const option = document.createElement('option');
//         option.value = room.room_id;
//         option.textContent = `SC2-${room.room_id}`;
//         roomFilter.appendChild(option);
//       });
//     })
//     .catch(error => {
//       console.error("❌ Error loading rooms:", error);
//     });
// }

// // ฟังก์ชันกรองข้อมูลตามห้อง
// function filterDataByRoom() {
//   const roomId = document.getElementById("roomFilter").value;
  
//   // หากไม่เลือกห้อง ให้โหลดข้อมูลทั้งหมด
//   const filteredData = roomId ? allData.filter(item => item.room_id === roomId) : allData;

//   // แสดงกราฟใหม่
//   renderBarChart(filteredData);
// }

// // ฟังก์ชันการเรนเดอร์กราฟ
// function renderBarChart(data) {
//   const barCtx = document.getElementById('barChart').getContext('2d');
//   if (!barCtx) {
//     console.error("❌ Canvas element not found!");
//     return;
//   }

//   const labels = data.map(item => `SC2-${item.room_id}`);
//   const totalCount = data.map(item => item.total_count);
//   const csCount = data.map(item => item.cs_count);
//   const itCount = data.map(item => item.it_count);

//   new Chart(barCtx, {
//     type: 'bar',
//     data: {
//       labels: labels,
//       datasets: [
//         {
//           label: 'จำนวนนิสิตรวม',
//           data: totalCount,
//           backgroundColor: '#E5D2BA'
//         },
//         {
//           label: 'จำนวนนิสิต สาขา วิทยาการคอมฯ',
//           data: csCount,
//           backgroundColor: '#E54715'
//         },
//         {
//           label: 'จำนวนนิสิต สาขาเทคโนโลยีฯ',
//           data: itCount,
//           backgroundColor: '#622BBE',
//           padding: {
//             top: 10,
//             bottom: 30
//           }
//         }
//       ]
//     },
//     options: {
//       responsive: false,
//       plugins: {
//         legend: {
//           position: 'bottom',
//           labels: {
//             font: {
//               size: 16
//             }
//           }
//         },
//         title: {
//           display: true,
//           text: 'ข้อมูลจำนวนนิสิต',
//           font: {
//             size: 14
//           }
//         }
//       },
//       scales: {
//         x: {
//           ticks: {
//             font: {
//               size: 16
//             }
//           }
//         },
//         y: {
//           beginAtZero: true,
//           ticks: {
//             callback: function (value) {
//               return Math.floor(value);
//             },
//             font: {
//               size: 14
//             }
//           }
//         }
//       }
//     }
//   });
// }

// // โหลดข้อมูลจาก API และแสดงกราฟ
// fetch(`${window.CONFIG.API_URL}/executive/mostroomalldata`)
//   .then(response => response.json())
//   .then(data => {
//     allData = data;  // เก็บข้อมูลทั้งหมด
//     renderBarChart(data);  // แสดงกราฟทั้งหมด

//     // เรียกใช้งานฟังก์ชันโหลดห้อง
//     loadRoomOptions();
//   })
//   .catch(error => {
//     console.error('❌ Error fetching data:', error);
//   });

//doughnutChart
fetch(`${window.CONFIG.API_URL}/executive/borrowEquipment`)
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log("Fetched Data:", data); // 🛠 Debug: ดูข้อมูล API

  const doughnutCtx1 = document.getElementById('doughnutChart1');


  if (!doughnutCtx1) {
    console.error("Canvas element donut not found!");
    return;
  }

  new Chart(doughnutCtx1.getContext('2d'), {  // ✅ ใช้ .getContext('2d') ตรงนี้
    type: 'doughnut',
    data: {
      labels: data.map(item => item.name), // ✅ ใช้คีย์ที่ถูกต้อง
      datasets: [{
        data: data.map(item => item.total),
        backgroundColor: ['#E5D2BA', '#E54715', '#622BBE'], // ✅ กำหนดสี
      }]
    },
    options: {
      responsive: true,
      cutout: '50%',
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'จำนวนอุปกรณ์ที่ยืม' }
      }
    }
  });
})
.catch(error => {
  console.error("❌ Error fetching data:", error);
});
//doughtnut2
fetch(`${window.CONFIG.API_URL}/executive/brokendEquipment`)
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log("Fetched Data:", data); // 🛠 Debug: ดูข้อมูล API

  const doughnutCtx1 = document.getElementById('doughnutChart2');


  if (!doughnutCtx1) {
    console.error("Canvas element donut not found!");
    return;
  }

  new Chart(doughnutCtx1.getContext('2d'), {  // ✅ ใช้ .getContext('2d') ตรงนี้
    type: 'doughnut',
    data: {
      labels: data.map(item => item.name), // ✅ ใช้คีย์ที่ถูกต้อง
      datasets: [{
        data: data.map(item => item.total),
        backgroundColor: ['#E5D2BA', '#E54715', '#622BBE'], // ✅ กำหนดสี
      }]
    },
    options: {
      responsive: true,

      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'จำนวนอุปกรณ์ที่แจ้งซ่อม' }
      }

    }
  });
})
.catch(error => {
  console.error("❌ Error fetching data:", error);
});
function showDoughnutChart(chartNumber) {
document.getElementById('doughnutChart1').style.display = (chartNumber === 1) ? 'block' : 'none';
document.getElementById('doughnutChart2').style.display = (chartNumber === 2) ? 'block' : 'none';
}
//point line chart
let chartInstance = null; // เก็บ instance ของ Chart เพื่อล้างค่าก่อนสร้างใหม่

function showChart(timeframe) {
// ✅ เลือก URL ตามช่วงเวลาที่ต้องการ
const apiUrls = {
day: `${window.CONFIG.API_URL}/executive/daysroomday`,
week: `${window.CONFIG.API_URL}/executive/daysroomweek`,
month: `${window.CONFIG.API_URL}/executive/daysroommount`,
year: `${window.CONFIG.API_URL}/executive/daysroomyear`
};

const apiUrl = apiUrls[timeframe];

fetch(apiUrl)
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log("Fetched Data:", data); // Debug ดูข้อมูล API

  const labels = data.map(item => item.time); // ชื่อวัน
  const usageData = data.map(item => item.total_requests); // จำนวนครั้งการใช้ห้อง

  updateChart(labels, usageData, timeframe);
})
.catch(error => {
  console.error("❌ Error fetching data:", error);
});
}

function updateChart(labels, values, timeframe) {
const ctx = document.getElementById("pointLineChart").getContext("2d");

// ✅ ถ้ามี Chart เดิมอยู่ให้ลบก่อน
if (chartInstance) {
chartInstance.destroy();
}

// ✅ ชื่อ Title ตามช่วงเวลา
const titles = {
day: "จำนวนครั้งที่ใช้ห้องเรียนในแต่ละวัน",
week: "จำนวนครั้งที่ใช้ห้องเรียนในแต่ละสัปดาห์",
month: "จำนวนครั้งที่ใช้ห้องเรียนในแต่ละเดือน",
year: "จำนวนครั้งที่ใช้ห้องเรียนในแต่ละปี"
};

// ✅ สร้าง Line Chart ใหม่
chartInstance = new Chart(ctx, {
type: "line",
data: {
  labels: labels,
  datasets: [{
    label: titles[timeframe],
    data: values,
    borderColor: "#007BFF",  // 🔵 สีน้ำเงิน
    backgroundColor: "rgba(0, 123, 255, 0.2)",
    fill: false,  // 🔥 ไม่มีพื้นที่สีใต้เส้น
    pointStyle: "circle",
    pointRadius: 5, // จุดใหญ่ขึ้น
    pointBackgroundColor: "#007BFF",
  }]
},
options: {
  responsive: false,
  layout: {
    padding: {
      bottom: 0 // ✅ ลบระยะขอบล่าง
    }
  },
  plugins: {
    title: {
      display: true,
      text: titles[timeframe]
    },
    legend: {
      position: "bottom"
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "ช่วงเวลา"
      }
    },
    y: {
      beginAtZero: true,
      suggestedMin: 0,
      title: {
        display: true,
        text: "จำนวนครั้งที่ใช้ห้อง"
      }
    }
  }
}
});
}

// ✅ โหลดค่าเริ่มต้นเป็น "วัน"
showChart("day");

//mostuser

// ฟังก์ชันที่โหลดข้อมูลห้องและบทบาทจาก API
function loadRoomAndRoleData() {
    fetch(`${window.CONFIG.API_URL}/executive/getRoomsAndRoles`)  // ดึงข้อมูลห้องจาก API
        .then(response => response.json())
        .then(data => {
            // กรองห้องที่ซ้ำกัน
            const uniqueRooms = new Set();
            const rooms = data.rooms.filter(room => {
                if (uniqueRooms.has(room.room_id)) {
                    return false;  // ถ้าห้องนี้ซ้ำแล้ว, ไม่ใส่ในรายการ
                } else {
                    uniqueRooms.add(room.room_id);  // ถ้าไม่ซ้ำ, เพิ่มห้องลงใน Set
                    return true;
                }
            });

            // เติมห้องใน dropdown
            const roomSelect = document.getElementById("room");
            rooms.forEach(room => {
                const option = document.createElement("option");
                option.value = room.room_id;  // ใช้ room.room_id
                option.textContent = room.room_id;  // ใช้ room.label
                roomSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("เกิดข้อผิดพลาดในการโหลดห้อง:", error);
        });
}




// ฟังก์ชันที่ดึงข้อมูลผู้ใช้งานจาก API
function fetchUserData(room, role) {
    const url = new URL(`${window.CONFIG.API_URL}/executive/useralldata`);
    const params = new URLSearchParams();

    // เพิ่มฟิลเตอร์ที่เลือกไปใน query string
    if (room) {
        params.append('room', room);
    }
    if (role) {
        params.append('role', role);
    }

    url.search = params.toString();  // เพิ่มพารามิเตอร์ใน URL

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const userList = document.getElementById("userList");
            userList.innerHTML = "";  // ล้างข้อมูลเดิม

            // แสดงข้อมูลที่ดึงมา
            data.forEach(user => {
                const div = document.createElement("div");
                div.className = "split-container";
                div.innerHTML = `<p>${user.name}</p> <p>${user.stat} ครั้ง</p>`;
                userList.appendChild(div);
            });
        })
        .catch(error => {
            console.error("เกิดข้อผิดพลาด:", error);
            document.getElementById("userList").innerHTML = "ไม่สามารถโหลดข้อมูลได้";
        });
}

// ฟังก์ชันที่ถูกเรียกเมื่อผู้ใช้เลือกฟิลเตอร์แล้วคลิกกรอง
function applyFilters() {
    const room = document.getElementById("room").value;  // รับค่าห้องที่เลือก
    const role = document.getElementById("role").value;  // รับค่าบทบาทที่เลือก
    fetchUserData(room, role);  // เรียกฟังก์ชันที่ดึงข้อมูลจาก API ตามฟิลเตอร์
}

// เรียกใช้ฟังก์ชันเมื่อหน้าโหลดเพื่อให้ข้อมูลแสดง
document.addEventListener("DOMContentLoaded", function() {
    loadRoomAndRoleData();  // โหลดข้อมูลห้องและบทบาทเมื่อหน้าโหลด
    applyFilters();  // ดึงข้อมูลเริ่มต้นเมื่อโหลดหน้า
});

//most booking room card
fetch(`${window.CONFIG.API_URL}/executive/box1`)
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log("✅ ดึงข้อมูลสำเร็จ:", data);
  if (data.length > 0) {
    document.getElementById('room-name').textContent = `${data[0].name} (${data[0].percentage}%)`;
  } else {
    document.getElementById('room-name').textContent = "No data available";
  }
})
.catch(error => {
  console.error("❌ Error fetching data:", error);
  document.getElementById('room-name').textContent = "Error loading data";
});

//most brokend equipment card
fetch(`${window.CONFIG.API_URL}/executive/box2`)
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log("✅ ดึงข้อมูลสำเร็จ:", data);
  if (data.length > 0) {
    document.getElementById('equipment-name').textContent = `${data[0].name} (${data[0].percentage})%`;
  } else {
    document.getElementById('equipment-name').textContent = "No data available";
  }
})
.catch(error => {
  console.error("❌ Error fetching data:", error);
  document.getElementById('equipment-name').textContent = "Error loading data";
});
//most time
fetch(`${window.CONFIG.API_URL}/executive/box3`)
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log("✅ ดึงข้อมูลสำเร็จ:", data);
  if (data.length > 0) {
    document.getElementById('time').textContent = `${data[0].time}(${data[0].percentage})%`;
  } else {
    document.getElementById('time').textContent = "No data available";
  }
})
.catch(error => {
  console.error("❌ Error fetching data:", error);
  document.getElementById('time').textContent = "Error loading data";
});
//most department
fetch(`${window.CONFIG.API_URL}/executive/box4`)
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log("✅ ดึงข้อมูลสำเร็จ:", data);
  if (data.length > 0) {
    document.getElementById('department-name').textContent = `${data[0].name}(${data[0].percentage}%)`;
  } else {
    document.getElementById('department-name').textContent = "No data available";
  }
})
.catch(error => {
  console.error("❌ Error fetching data:", error);
  document.getElementById('department-name').textContent = "Error loading data";
});

//card chart1
fetch(`${window.CONFIG.API_URL}/executive/TableRoomBooked`)
.then(response => response.json())
.then(data => {
// ดึงชื่อห้องมาเป็น Labels
const labels = data.map(item => item.room_name);
// ดึงจำนวนอุปกรณ์ที่เสียมาเป็นค่าใน Chart
const values = data.map(item => item.total);

var ctx = document.getElementById('pointLineCardChart1').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [{
      data: values,
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // สีของแท่ง
      borderWidth: 0,
      barPercentage: 1,
      categoryPercentage: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // ซ่อน Legend
      tooltip: { enabled: false } // ซ่อน Tooltip
    },
    scales: {
      x: { display: false }, // ซ่อนแกน X
      y: { display: false } // ซ่อนแกน Y
    }
  }
});
})
.catch(error => console.error("❌ Error fetching data:", error));



//card chart 2
fetch(`${window.CONFIG.API_URL}/executive/TableBrokenEqipment`)
.then(response => response.json())
.then(data => {
// ดึงชื่ออุปกรณ์ที่เสียมาเป็น Labels
const labels = data.map(item => item.name);
// ดึงจำนวนอุปกรณ์ที่เสียมาเป็นค่าใน Chart
const values = data.map(item => item.totalbrokend);

var ctx = document.getElementById('pointLineCardChart2').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [{
      data: values,
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // สีของแท่ง
      borderWidth: 0,
      barPercentage: 1,
      categoryPercentage: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // ซ่อน Legend
      tooltip: { enabled: false } // ซ่อน Tooltip
    },
    scales: {
      x: { display: false }, // ซ่อนแกน X
      y: { display: false } // ซ่อนแกน Y
    }
  }
});
})
.catch(error => console.error("❌ Error fetching data:", error));

//card chart 3
fetch(`${window.CONFIG.API_URL}/executive/daysroomday`)
.then(response => response.json())
.then(data => {
// ดึงชื่ออุปกรณ์ที่เสียมาเป็น Labels
const labels = data.map(item => item.time);
// ดึงจำนวนอุปกรณ์ที่เสียมาเป็นค่าใน Chart
const values = data.map(item => item.total_requests);

var ctx = document.getElementById('pointLineCardChart3').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [{
      data: values,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // สีของแท่ง
      borderWidth: 0,
      barPercentage: 1,
      categoryPercentage: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // ซ่อน Legend
      tooltip: { enabled: false } // ซ่อน Tooltip
    },
    scales: {
      x: { display: false }, // ซ่อนแกน X
      y: { display: false } // ซ่อนแกน Y
    }
  }
});
})
.catch(error => console.error("❌ Error fetching data:", error));
