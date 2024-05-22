function extractColumns(data, headers) {
  return data.map(item => {
    const newDataset = {};
    headers.forEach(header => {
      newDataset[header] = item[header];
    });
    return newDataset;
  });
}

function getUniqueRows(data) {
  const uniqueRows = [];
  const seen = new Set();

  data.forEach(row => {
    const rowString = JSON.stringify(row);
    if (!seen.has(rowString)) {
      uniqueRows.push(row);
      seen.add(rowString);
    }
  });

  return uniqueRows;
}

function createStaticTable(data) {
  // create subset by columns, and then get unique data rows
  const dataHeaders = [
    dataNameAlias.PrjName,
    dataNameAlias.PrjLead,
    dataNameAlias.PrjDesc,
    // dataNameAlias.Lat,
    // dataNameAlias.Lng,
    // dataNameAlias.Species
  ];

  const subset = getUniqueRows(extractColumns(data, dataHeaders));

  // create data table
  const dataTableContainer = document.getElementById('dataTableContainer');
  if(!dataTableContainer) {
    return;
  }
  dataTableContainer.innerHTML = '';

  const dataTable = document.createElement('table');
  dataTable.setAttribute('id', 'dataTable');
  dataTable.setAttribute('class', 'hover compact row-border');
  dataTable.style.width = '100%';
  dataTableContainer.appendChild(dataTable);

  const dataHead = document.createElement('thead');
  dataTable.appendChild(dataHead);

  const dataHeadRow = document.createElement('tr');
  dataHead.appendChild(dataHeadRow);

  dataHeaders.forEach(header => {
    const col = document.createElement('th');
    col.textContent = header;
    dataHeadRow.appendChild(col);
  });

  // Table body
  const dataBody = document.createElement('tbody');
  dataBody.setAttribute('id', 'dataBody');
  dataTable.appendChild(dataBody);
  
  // Update data table 
  subset.forEach(item => {
    const row = document.createElement('tr');
    dataHeaders.forEach(header => {
      row.innerHTML += `<td>${item[header]}</td>`;
    })
    dataBody.appendChild(row);
  });

  return dataHeaders;
}

function createDataTable(data) {
  const dataHeaders = createStaticTable(data);

  if(!dataHeaders) {
    return;
  }

  let table = new DataTable('#dataTable', {
    scrollCollapse: true,
    // scrollY: 'calc(var(--map-base-height) - var(--chart-min-height) - var(--map-dt-height-difference))',
    scrollY: 800,
    pageLength: 50,
    layout: {
      topStart: {
        search: { return: false, boundary: true }
      },
      topEnd: null,
      bottomStart: 'info',
      bottomEnd: {
        paging: { type: 'simple_numbers', numbers: 5}
      },
    }
  });

  return table;
}