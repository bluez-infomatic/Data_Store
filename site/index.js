  // Helper: Clean undefined or empty cell text
  function cleanCellText(text) {
    return (!text || text.toLowerCase() === "undefined") ? "" : text;
  }

  // Save table data to localStorage
 function saveTableData() {
  const tbody = document.querySelector("#clientTable tbody");
  const data = [...tbody.rows].map(row => ({
    client: row.cells[0].innerText.trim(),
    // Get value from input[type="date"], convert to DD-MM-YYYY
    date: (() => {
      const input = row.cells[1].querySelector("input[type='date']");
      if (input && input.value) {
        const [yyyy, mm, dd] = input.value.split("-");
        return `${dd}-${mm}-${yyyy}`;
      }
      return "";
    })(),
    amount: row.cells[2].innerText.trim()
  }));
  localStorage.setItem("clientTableData", JSON.stringify(data));
}

  // Load table data from localStorage
  function loadTableData() {
    const savedData = localStorage.getItem("clientTableData");
    const tbody = document.querySelector("#clientTable tbody");
    tbody.innerHTML = "";

    if (savedData) {
      const data = JSON.parse(savedData);
      data.forEach(item => insertRow(item));
    }

    updateTotal();
    filterTable();
  }

  // Insert a new row (used in loadTableData and addNewRow)
  function insertRow(item = { client: "", date: "", amount: "" }) {
  const tbody = document.querySelector("#clientTable tbody");
  const newRow = tbody.insertRow();

  // Client cell
  const clientCell = newRow.insertCell();
  clientCell.contentEditable = "true";
  clientCell.innerText = cleanCellText(item.client);

  // Date cell with input
  const dateCell = newRow.insertCell();
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  // Convert DD-MM-YYYY to YYYY-MM-DD for input value
  if (item.date) {
    const parts = item.date.split("-");
    if (parts.length === 3) {
      dateInput.value = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  dateCell.appendChild(dateInput);

  // Amount cell
  const amountCell = newRow.insertCell();
  amountCell.contentEditable = "true";
  amountCell.innerText = cleanCellText(item.amount);

  // Buttons
  const btnCell = newRow.insertCell();
  btnCell.innerHTML = `
    <button style="background-color: #0d6efd; color: white;" onclick="replaceAmount(this)">Replace</button>
    <button style="background-color:rgba(235, 29, 22, 0.88); margin-left: 5px;margin-top:8px;" onclick="deleteRow(this)">Delete</button>
  `;

  // Save on edit
  clientCell.addEventListener("input", () => { saveTableData(); filterTable(); });
  amountCell.addEventListener("input", () => { saveTableData(); updateTotal(); filterTable(); });
  dateInput.addEventListener("change", () => { saveTableData(); filterTable(); });
}
  // Add new row
  function addNewRow() {
    insertRow();
    saveTableData();
    updateTotal();
    filterTable();
  }

  // Replace amount with user input
  function replaceAmount(btn) {
    const row = btn.closest("tr");
    const amountCell = row.cells[2];
    const currentAmount = parseFloat(amountCell.innerText) || 0;
    const value = prompt("Enter amount to add (+) or subtract (-):\nExamples: +100 or -50");

    if (value && /^[-+]?\d+(\.\d+)?$/.test(value.trim())) {
      const delta = parseFloat(value);
      amountCell.innerText = (currentAmount + delta).toFixed(2);
      saveTableData();
      updateTotal();
      filterTable();
    } else {
      alert("Please enter a valid number (e.g., +100, -50).");
    }
  }

  // Export table to Excel
  function downloadExcel() {
  const table = document.getElementById("clientTable");
  const clonedTable = table.cloneNode(true); // Clone table to modify for export

  // Remove the "Replacement" column (assuming it's the 4th column, index 3)
  const removeColumnIndex = 3;
  for (const row of clonedTable.rows) {
    if (row.cells.length > removeColumnIndex) {
      row.deleteCell(removeColumnIndex);
    }
  }

  // Get today's date in DD-MM-YYYY format
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  // Create workbook and export
  const wb = XLSX.utils.table_to_book(clonedTable, { sheet: "ClientData" });
  XLSX.writeFile(wb, `ClientData_${formattedDate}.xlsx`);
}


  // Update total footer
  function updateTotal() {
    const tbody = document.querySelector("#clientTable tbody");
    let total = 0;

    [...tbody.rows].forEach(row => {
      if (row.style.display !== "none") {
        const val = parseFloat(row.cells[2].innerText);
        if (!isNaN(val)) total += val;
      }
    });

    document.getElementById("totalAmount").innerText = total.toFixed(2);
  }

  // Toggle filter panel visibility
  function toggleFilters() {
    document.getElementById("filterCard").classList.toggle("show");
  }

  // Parse date in DD-MM-YYYY format
  function parseDateDDMMYYYY(dateStr) {
    const parts = dateStr.trim().split("-");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  // Filter table by multiple criteria
  function filterTable() {
    const search = document.getElementById("globalSearch").value.toLowerCase().trim();
    const clientFilter = document.getElementById("clientFilter").value.toLowerCase().trim();
    const amountFilter = parseFloat(document.getElementById("amountFilter").value.trim());
    const fromDate = parseDateDDMMYYYY(document.getElementById("fromDate").value);
    const toDate = parseDateDDMMYYYY(document.getElementById("toDate").value);
    const rows = document.querySelectorAll("#clientTable tbody tr");

    rows.forEach(row => {
      const name = row.cells[0].innerText.toLowerCase().trim();
      const dateStr = row.cells[1].innerText.trim();
      const amount = parseFloat(row.cells[2].innerText.trim());
      const rowDate = parseDateDDMMYYYY(dateStr);

      const matchesName =
        (!search || name.includes(search)) &&
        (!clientFilter || name.includes(clientFilter));

      const matchesAmount = isNaN(amountFilter) || amount === amountFilter;

      const matchesFromDate = !fromDate || (rowDate && rowDate >= fromDate);
      const matchesToDate = !toDate || (rowDate && rowDate <= toDate);

      const shouldShow = matchesName && matchesAmount && matchesFromDate && matchesToDate;
      row.style.display = shouldShow ? "" : "none";
    });

    updateTotal();
  }

  // Initialize everything on window load
  window.onload = () => {
    loadTableData();

    // Input listeners for filtering
    document.getElementById("globalSearch").addEventListener("input", filterTable);
    document.getElementById("clientFilter").addEventListener("input", filterTable);
    document.getElementById("amountFilter").addEventListener("input", filterTable);
    document.getElementById("fromDate").addEventListener("change", filterTable);
    document.getElementById("toDate").addEventListener("change", filterTable);
  };
  
 function handleArchiveAction() {
  const action = document.getElementById("archiveActions").value;
  if (action === "clear") {
    softClearData();
  } else if (action === "restore") {
    restoreArchivedData();
  }

  // Reset selection to default after action
  document.getElementById("archiveActions").value = "";
}

function softClearData() {
  const currentData = localStorage.getItem("clientTableData");
  if (currentData) {
    localStorage.setItem("clientTableArchive", currentData);
    localStorage.removeItem("clientTableData");
    loadTableData();
    alert("Data cleared and archived. Use 'Restore Archive' to recover.");
  } else {
    alert("No data found to archive.");
  }
}

function restoreArchivedData() {
  const archive = localStorage.getItem("clientTableArchive");
  if (archive) {
    localStorage.setItem("clientTableData", archive);
    loadTableData();
    alert("Archived data restored successfully.");
  } else {
    alert("No archived data found.");
  }
}
function deleteRow(btn) {
  const row = btn.closest("tr");
  if (confirm("Are you sure you want to delete this row?")) {
    row.remove();
    saveTableData();
    updateTotal();
    filterTable();
  }
}


