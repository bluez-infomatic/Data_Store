
document.getElementById('searchInput').addEventListener('input', function () {
  const filter = this.value.toLowerCase();
  document.querySelectorAll('#clientTable tbody tr').forEach(row => {
    const nameInput = row.querySelector('td:nth-child(3) input'); // Get input in Client Name column
    const name = nameInput?.value.toLowerCase() || '';
    row.style.display = name.includes(filter) ? '' : 'none';
  });
});



  dayjs.extend(dayjs_plugin_customParseFormat);

  const tbody = document.querySelector("#clientTable tbody");
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');

function formatToInputDate(dateStr) {
  if (!dateStr) return '';
  const d = dayjs(dateStr);
  return d.isValid() ? d.format('YYYY-MM-DD') : '';
}


function saveDataToLocalStorage() {
  const data = [];
  tbody.querySelectorAll("tr").forEach(row => {
    const inputs = row.querySelectorAll("input[type=text], input[type=date], input[type=number]");
    const client = {
      name: inputs[0].value.trim(),
      date: inputs[1].value,
      amount: parseFloat(inputs[2].value) || 0
    };
    data.push(client);
  });
  localStorage.setItem("clientData", JSON.stringify(data));
}


  function updateRowNumbers() {
    tbody.querySelectorAll("tr").forEach((row, index) => {
      row.querySelector(".row-number").textContent = index + 1;
    });
  }

 function updateTotal() {
  let total = 0;
  tbody.querySelectorAll("tr").forEach(row => {
    if (row.style.display === "none") return; // Skip hidden rows
    const amountInput = row.querySelector("td:nth-child(5) input");
    total += parseFloat(amountInput.value) || 0;
  });
  document.getElementById("totalAmount").textContent = total.toFixed(2);
  saveDataToLocalStorage();
}


  function createRow(data) {
    const amountValue = data.amount || '';
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border p-2 text-center"><input type="checkbox" class="w-5 h-5 cursor-pointer" /></td>
      <td class="border p-2 text-center row-number"></td>
      <td class="border p-2"><input type="text" value="${data.name || ''}" placeholder="Client Name" class="border-none outline-none w-full" /></td>
      <td class="border p-2"><input type="date" value="${formatToInputDate(data.date)}" class="border px-2 py-1 rounded w-full sm:w-40"/></td>
      <td class="border p-2"><input type="number" step="0.01" value="${amountValue}" placeholder="Amount" class="border-none outline-none w-full text-left" /></td>
      <td class="border p-2 text-center"><button type="button" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded replace-btn">Replace</button></td>
    `;
    return row;
  }

  function addRow(data = {}) {
    const row = createRow(data);
    tbody.appendChild(row);
    updateRowNumbers();
    updateTotal();
  }

function loadRows() {
  tbody.innerHTML = '';
  const clients = JSON.parse(localStorage.getItem('clientData')) || [];
  if (clients.length === 0) {
    addRow();  // if no data, add a blank row
  } else {
    clients.forEach(data => addRow(data));
  }
}

// Call on load
loadRows();


  // Event: Replace Amount
  tbody.addEventListener("click", e => {
    if (e.target.classList.contains("replace-btn")) {
      const row = e.target.closest("tr");
      const amountInput = row.querySelector("td:nth-child(5) input");
      const currentAmount = parseFloat(amountInput.value) || 0;

      Swal.fire({
        title: 'Adjust Amount',
        html: `<p>Current amount: <b>${currentAmount.toFixed(2)}</b></p><p>Enter a number to add or subtract (e.g., 100, -50):</p>`,
        input: 'text',
        showCancelButton: true,
        confirmButtonText: 'Apply',
        inputValidator: (value) => {
          const num = parseFloat(value);
          if (isNaN(num)) return 'Enter a valid number!';
          if (currentAmount + num < 0) return 'Resulting amount cannot be negative!';
          return null;
        }
      }).then(result => {
        if (result.isConfirmed) {
          const delta = parseFloat(result.value);
          const newAmount = currentAmount + delta;
          amountInput.value = newAmount.toFixed(2);
          updateTotal();
          Swal.fire({ icon: 'success', title: 'Amount Updated', timer: 1200, toast: true, position: 'top-end', showConfirmButton: false });
        }
      });
    }
  });

  // Select All Checkbox
  selectAllCheckbox.addEventListener('change', () => {
    const checked = selectAllCheckbox.checked;
    tbody.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = checked);
  });

  // Delete Selected Rows
  document.getElementById('deleteSelectedBtn').addEventListener('click', () => {
    const selected = [...tbody.querySelectorAll('input[type=checkbox]:checked')];
    if (selected.length === 0) return Swal.fire('No rows selected', '', 'info');
    Swal.fire({ title: `Delete ${selected.length} row(s)?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete' })
      .then(res => {
        if (res.isConfirmed) {
          selected.forEach(cb => cb.closest('tr').remove());
          updateRowNumbers();
          updateTotal();
          selectAllCheckbox.checked = false;
        }
      });
  });

  // Add Row
  document.getElementById('addRowBtn').addEventListener('click', () => addRow());

  // Input Changes
  tbody.addEventListener('input', e => {
  updateTotal();       // update total
  saveDataToLocalStorage();  // save changes
});


  // Download Excel
  document.getElementById('downloadBtn').addEventListener('click', () => {
    const wb = XLSX.utils.book_new();
    const data = [["S.no", "Client Name", "Date", "Amount"]];

    tbody.querySelectorAll('tr').forEach((row, index) => {
      if (row.style.display === "none") return;
      const inputs = row.querySelectorAll("input[type=text], input[type=date], input[type=number]");
      const formattedDate = dayjs(inputs[1].value).format("DD-MM-YYYY");
      data.push([
        index + 1,
        inputs[0].value,
        formattedDate,
        parseFloat(inputs[2].value) || 0
      ]);
    });

    data.push(["", "", "", ""]);
    const totalAmount = document.getElementById("totalAmount").textContent.trim();
    data.push(["", "", "Total", parseFloat(totalAmount)]);

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "ClientDatabase");

    const dateStr = dayjs().format('DD-MM-YYYY');
    XLSX.writeFile(wb, `client_database_${dateStr}.xlsx`);
  });

  // Filters
 document.getElementById("applyFilterBtn").addEventListener("click", () => {
  const nameFilter = document.getElementById("filterName").value.trim().toLowerCase();
  const startDate = document.getElementById("filterStartDate").value;
  const endDate = document.getElementById("filterEndDate").value;

  tbody.querySelectorAll("tr").forEach(row => {
    const name = row.querySelector("td:nth-child(3) input").value.trim().toLowerCase();
    const dateVal = row.querySelector("td:nth-child(4) input").value;
    const show =
      name.includes(nameFilter) &&
      (!startDate || dateVal >= startDate) &&
      (!endDate || dateVal <= endDate);
    row.style.display = show ? "" : "none";
  });

  updateTotal();  // Update total only for visible rows
});


document.getElementById("clearFilterBtn").addEventListener("click", () => {
  document.getElementById("filterName").value = '';
  document.getElementById("filterStartDate").value = '';
  document.getElementById("filterEndDate").value = '';
  tbody.querySelectorAll("tr").forEach(row => (row.style.display = ""));
  updateTotal();
});


 document.getElementById('filterBtn').addEventListener('click', () => {
  const panel = document.getElementById('filterPanel');
  const arrow = document.getElementById('arrow');
  const isCollapsed = panel.classList.contains('collapsed');
  console.log('Filter button clicked, panel collapsed:', isCollapsed);
  panel.classList.toggle('collapsed', !isCollapsed);
  panel.classList.toggle('expanded', isCollapsed);
  arrow.textContent = isCollapsed ? '▲' : '▼';
});


 

  // Initial Load

