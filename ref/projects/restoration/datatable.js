function createStaticTable(data) {
  const dataTableContainer = document.getElementById('dataTableContainer');
  dataTableContainer.innerHTML = '';

  const dataTable = document.createElement('table');
  dataTable.setAttribute('id', 'dataTable');
  dataTable.className = 'display';
  dataTableContainer.appendChild(dataTable);

  const dataHead = document.createElement('thead');
  dataTable.appendChild(dataHead);

  const dataHeadRow = document.createElement('tr');
  dataHead.appendChild(dataHeadRow);

  const dataHeaders = [
    'Project Name',
    'Project Lead',
    'Project Description',
    // 'CU_Name',
    // 'CU Index',
    // 'SMU_Name',
    // 'Species',
  ]

  dataHeaders.forEach(header => {
    const col = document.createElement('th');
    col.textContent = header;
    dataHeadRow.appendChild(col);
  });

  // Table body
  const dataBody = document.createElement('tbody');
  dataBody.setAttribute('id', 'dataBody');
  dataBody.innerHTML = '';
  dataTable.appendChild(dataBody);
  
  // Update data table 
  data.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item[dataNameAlias.PrjName]}</td>
      <td>${item[dataNameAlias.PrjLead]}</td>
      <td>${item[dataNameAlias.PrjDesc]}</td>
      <!--
      <td>${item[dataNameAlias.CU_Name]}</td>
      <td>${item[dataNameAlias.CU_Index]}</td>
      <td>${item[dataNameAlias.SMU_Name]}</td>
      <td>${item[dataNameAlias.Species]}</td>
      -->
    `;
    dataBody.appendChild(row);
  });
}

function createDataTable(data) {
  createStaticTable(data);

  let table = new DataTable('#dataTable', {
    // scrollY: 500,
    pageLength: 10
  });

  return table;
}