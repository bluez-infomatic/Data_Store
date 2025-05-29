

  const filterBtn = document.getElementById('filterBtn');
  const filterPanel = document.getElementById('filterPanel');
  const fieldSelect = document.getElementById('fieldSelect');
  const valueInput = document.getElementById('valueInput');
  const dateRangeInput = document.getElementById('dateRangeInput');
  const rangePresets = document.getElementById('rangePresets');
  const rangeButtons = document.querySelectorAll('.range-btn');

  // Toggle the filter panel
  filterBtn.addEventListener('click', () => {
    filterPanel.classList.toggle('hidden');
  });

  // Change input based on selected field
  fieldSelect.addEventListener('change', () => {
    const selectedField = fieldSelect.value;
    if (selectedField === 'Date') {
      valueInput.classList.add('hidden');
      dateRangeInput.classList.remove('hidden');
      rangePresets.classList.remove('hidden');
    } else {
      valueInput.classList.remove('hidden');
      dateRangeInput.classList.add('hidden');
      rangePresets.classList.add('hidden');
    }
  });

  // Handle range preset buttons
  rangeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const rangeType = button.getAttribute('data-range');
      const today = new Date();
      let startDate, endDate;

      switch (rangeType) {
        case 'today':
          startDate = endDate = today;
          break;
        case 'last3':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 2);
          endDate = today;
          break;
        case 'last7':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 6);
          endDate = today;
          break;
        case 'last30':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 29);
          endDate = today;
          break;
        case 'thisYear':
          startDate = new Date(today.getFullYear(), 0, 1);
          endDate = today;
          break;
        case 'lastYear':
          startDate = new Date(today.getFullYear() - 1, 0, 1);
          endDate = new Date(today.getFullYear() - 1, 11, 31);
          break;
      }

      // Format YYYY-MM-DD
      const formatDate = (d) => d.toISOString().split('T')[0];
      dateRangeInput.value = `${formatDate(startDate)} to ${formatDate(endDate)}`;
    });
  });

  // Apply filter button (you can customize this logic)
  document.getElementById('applyFilterBtn').addEventListener('click', () => {
    const field = fieldSelect.value;
    const value = field === 'Date' ? dateRangeInput.value : valueInput.value;

    console.log('Apply filter for:', field, value);
    // TODO: Filter your data or table here
  });
