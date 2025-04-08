const currentDate = new Date();
function toggleCalendar() {
  const calendar = document.getElementById("dropdown-calendar");
  if (calendar.style.display === "none" || calendar.style.display === "") {
    calendar.style.display = "block";
    initializeCalendar();
  } else {
    calendar.style.display = "none";
  }
}
document.addEventListener("click", function (event) {
  const calendar = document.getElementById("dropdown-calendar");
  const icon = document.querySelector("i.bi-caret-down-fill");
  if (!calendar.contains(event.target) && event.target !== icon) {
    calendar.style.display = "none";
  }
});
function initializeCalendar() {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");
  monthSelect.innerHTML = "";
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  monthNames.forEach((m, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.text = m;
    if (i === currentDate.getMonth()) option.selected = true;
    monthSelect.appendChild(option);
  });
  yearSelect.innerHTML = "";
  const startYear = currentDate.getFullYear() - 10;
  const endYear = currentDate.getFullYear() + 50;
  for (let y = startYear; y <= endYear; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.text = y;
    if (y === currentDate.getFullYear()) option.selected = true;
    yearSelect.appendChild(option);
  }
  renderCustomCalendar();
}
function renderCustomCalendar() {
  const calendarDiv = document.getElementById("custom-calendar");
  calendarDiv.innerHTML = "";
  const month = parseInt(document.getElementById("month-select").value);
  const year = parseInt(document.getElementById("year-select").value);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  const headerRow = document.createElement("tr");
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
    const th = document.createElement("th");
    th.style.textAlign = "center";
    th.innerText = day;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);
  let date = 1;
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");
      cell.style.textAlign = "center";
      cell.style.padding = "5px";
      cell.style.border = "1px solid #ddd";
      if (i === 0 && j < firstDay) {
        cell.innerText = "";
      } else if (date > daysInMonth) {
        break;
      } else {
        cell.innerText = date;
        cell.style.cursor = "pointer";
        cell.onclick = function () {
          document.getElementById("dropdown-calendar").style.display = "none";
        };
        date++;
      }
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  calendarDiv.appendChild(table);
}

function getRowText(row) {
  return (
    row.room_request_id + // เพิ่มบรรทัดนี้
    " " +
    new Date(row.submitted_time).toLocaleDateString("th") +
    " " +
    row.full_name +
    " " +
    row.role +
    " " +
    row.room_id +
    " " +
    row.participantCount +
    " " +
    new Date(row.used_date).toLocaleDateString("th") +
    " " +
    row.start_time +
    " " +
    row.end_time +
    " " +
    row.request_type
  ).toLowerCase();
}

function getDayOfWeek(dateString) {
  const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  return days[new Date(dateString).getDay()];
}
async function fetchData() {
  try {
    const [roomsRes, studentsRes, teacherRes, partRes] = await Promise.all([
      fetch(`${API_URL}/executive/room_request`),
      fetch(`${API_URL}/executive/student`),
      fetch(`${API_URL}/executive/teacher`),
      fetch(`${API_URL}/executive/room_request_participant`),
    ]);
    const roomsData = await roomsRes.json();
    const studentsData = await studentsRes.json();
    const teacherData = await teacherRes.json();
    const partData = await partRes.json();
    let data = roomsData
      .filter(
        (r) =>
          r.request_status === "คำขอหมดอายุ" && r.request_type === "นอกเวลา"
      )
      .map((r) => {
        const stu =
          studentsData.find((s) => s.student_id === r.student_id) || {};
        const tea =
          teacherData.find((t) => t.teacher_id === r.teacher_id) || {};
        return {
          ...r,
          full_name: stu.full_name || tea.full_name,
          role: stu.role || tea.role,
          participantCount: partData.filter(
            (p) => p.room_request_id === r.room_request_id
          ).length,
        };
      });
    const search = document.getElementById("searchBox").value.toLowerCase();
    if (search) {
      data = data.filter((r) => getRowText(r).includes(search));
    }
    const sortVal = document.getElementById("sorttime").value;
    if (sortVal === "submission_desc" || sortVal === "submission_asc") {
      data.sort((a, b) => {
        const aTime = new Date(a.submitted_time);
        const bTime = new Date(b.submitted_time);
        return sortVal === "submission_desc" ? bTime - aTime : aTime - bTime;
      });
    } else if (sortVal === "overlap_asc" || sortVal === "overlap_desc") {
      const groups = {};
      data.forEach((r) => {
        const key = r.room_id + "_" + r.used_date;
        if (!groups[key]) groups[key] = [];
        groups[key].push(r);
      });
      const groupKeys = Object.keys(groups).sort((a, b) => {
        const [roomA, dateA] = a.split("_");
        const [roomB, dateB] = b.split("_");
        if (roomA !== roomB) {
          if (!isNaN(roomA) && !isNaN(roomB)) {
            return sortVal === "overlap_asc" ? roomA - roomB : roomB - roomA;
          } else {
            return sortVal === "overlap_asc"
              ? roomA.localeCompare(roomB)
              : roomB.localeCompare(roomA);
          }
        } else {
          return sortVal === "overlap_asc"
            ? new Date(dateA) - new Date(dateB)
            : new Date(dateB) - new Date(dateA);
        }
      });
      let sorted = [];
      groupKeys.forEach((key) => {
        const group = groups[key].sort((a, b) => {
          const aT = a.start_time
            .split(":")
            .reduce((acc, cur) => acc * 60 + Number(cur), 0);
          const bT = b.start_time
            .split(":")
            .reduce((acc, cur) => acc * 60 + Number(cur), 0);
          return sortVal === "overlap_asc" ? aT - bT : bT - aT;
        });
        sorted.push({
          header: true,
          room_id: group[0].room_id,
          used_date: group[0].used_date,
        });
        sorted = sorted.concat(group);
      });
      data = sorted;
    }
    const tbody = document.getElementById("reservation-table");
    tbody.innerHTML = "";
    if (data.length === 0) {
      tbody.innerHTML = "<tr><td colspan='7'>No data found</td></tr>";
    }
    data.forEach((r) => {
      if (r.header) {
        const headerTr = document.createElement("tr");
        headerTr.innerHTML = `<td colspan="7" style="background: #f0f0f0; text-align: left; padding: 10px; font-weight: bold;">ห้อง: ${
          r.room_id
        }, วันที่: ${new Date(r.used_date).toLocaleDateString("th-TH")}</td>`;
        tbody.appendChild(headerTr);
      } else {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="text-center">${r.room_request_id}</td>
            <td class="text-center">${new Date(
              r.submitted_time
            ).toLocaleDateString("th")}</td>
            <td class="text-center">${r.full_name}</td>
            <td class="text-center">${r.role}</td>
            <td class="text-center">${r.room_id}</td>
            <td class="text-center">${r.participantCount}</td>
            <td class="text-center">
              ${
                getDayOfWeek(r.used_date) +
                " " +
                new Date(r.used_date).toLocaleDateString("th")
              }<br>
              ${r.start_time.slice(0, 5) + " - " + r.end_time.slice(0, 5)}<br>
              ${"(" + r.request_type + ")"}
            </td>
            <td class="text-center" style="color: #929292">คำขอหมดอายุ (Expired)</td>
          `;
        tbody.appendChild(tr);
      }
    });
  } catch (e) {
    console.error("❌ Error fetching data:", e);
  }
}
document.getElementById("sorttime").addEventListener("change", fetchData);
document.getElementById("searchBox").addEventListener("input", fetchData);
document.addEventListener("DOMContentLoaded", fetchData);
