import { dataset } from './global.js';
import { getUniqueRows } from "./utils.js";

const subsetHeaders = [
  dataset.headers.project_name,
  dataset.headers.project_description,
  dataset.headers.year,
  dataset.headers.species_name,
  dataset.headers.lat,
  dataset.headers.lng,
];

let originalTableHTML = '';

function extractColumns(data, headers) {
  // extract all rows of the dataset with only selected headers
  return data.map(item => {
    const newDataset = {};
    headers.forEach(header => {
      newDataset[header] = item[header];
    });
    return newDataset;
  });
}

function createStaticTable(data, tableId) {
  const headers = Object.keys(data[0]);

  // create new table
  const dataTable = document.createElement('table');
  dataTable.setAttribute('id', tableId);
  dataTable.setAttribute('class', 'display compact'); // 'hover compact row-border'
  dataTable.style.width = '100%';

  // create table head
  const dataHead = document.createElement('thead');
  dataTable.appendChild(dataHead);
  const dataHeadRow = document.createElement('tr');
  dataHead.appendChild(dataHeadRow);

  // add column headers
  // column header for collapsible button
  dataHeadRow.appendChild(document.createElement('th'));

  headers.forEach(header => {
    const col = document.createElement('th');
    col.textContent = header;
    dataHeadRow.appendChild(col);
  });

  // create table body
  const dataBody = document.createElement('tbody');
  dataBody.setAttribute('id', 'dataBody');
  dataTable.appendChild(dataBody);
  
  // populate table rows with data
  const fragment = document.createDocumentFragment();
  data.forEach(row => {
    const dataRow = document.createElement('tr');

    // add collapsible button column 
    dataRow.innerHTML += '<td class="dt-control"></td>';

    headers.forEach(header => {
      dataRow.innerHTML += `<td>${row[header]}</td>`;
    })

    fragment.appendChild(dataRow);
  });
  dataBody.appendChild(fragment);

  return dataTable;
}

function processSubset(subset, dataset) {
  if (!subset || !dataset || !dataset.headers) {
    console.error("Invalid subset of dataset");
    return [];
  }

  return subset.map(row => {
    const latKey = dataset.headers.lat;
    const lngKey = dataset.headers.lng;
    const status = isNaN(row[latKey] || row[lngKey]) ? 'Unmapped' : 'Mapped';

    row['status'] = status;

    // const { [latKey]: lat, [lngKey]: lng, ...rest } = row;
    // return { ...rest, status };

    return row;
  })
}

function initializeDataTable(tableId) {
  return new DataTable(tableId, {
    paging: false,
    scrollCollapse: true,
    // map-height - chart-height - padding - search-bar-height - header-row-height - bottom-info-height
    scrollY: 'calc(var(--map-base-height) - var(--chart-base-height) - 40px - 37px - 28px - 28px)',
    order: [[1, 'asc']],
    columnDefs: [
      { 
        target: 0,
        className: 'dt-control',
        orderable: false,
        searchable: false,
        defaultContent: '',
        width: '24px'
      } ,
      { target: 1, title: 'Project Name' },
      { target: 2, title: 'Project Description', visible: false },
      { target: 3, title: 'Fiscal Year', width: '110px' },
      { target: 4, title: 'Species', visible: false },
      { target: 5, title: 'Site Latitude', visible: false },
      { target: 6, title: 'Site Longitude', visible: false },
      { target: 7, title: 'Status'},
    ],
    layout: {
      topStart: {
        search: { return: false, boundary: true }
      },
      topEnd: null,
      bottomStart: 'info',
      bottomEnd: null,
    }
  })
}

function addRowClickHandler(table) {
  function format(data) {
    return (
      `
      <p style="margin: 6px 22px 6px 22px;">
        <b>Project Description:</b>
        <br>
        ${data[2]}
        <br><br>
        <b>Species:</b> ${data[4]}
        <br>
        <b>Site Latitude:</b> ${data[5]}
        <br>
        <b>Site Longitude:</b> ${data[6]}
      </p>
      `
    );
  }

  table.on('click', 'td.dt-control', function (e) {
    let tr = e.target.closest('tr');
    let row = table.row(tr);
 
    if (row.child.isShown()) {
        row.child.hide();
    }
    else {
        row.child(format(row.data())).show();
    }
  });
}

function createDataTable(data) {
  const dataTableContainer = document.getElementById('data-table-container');
  if(!dataTableContainer) return;

  let dataTableDiv = document.getElementById('data-table-div');
  if (!dataTableDiv) {
    dataTableDiv = document.createElement('div');
    dataTableDiv.setAttribute('id', 'data-table-div');
    dataTableContainer.appendChild(dataTableDiv);
    dataTableDiv.innerHTML = '';
  }

  // create subset by columns, and then get unique data rows
  const subset = getUniqueRows(extractColumns(data, subsetHeaders));

  // get column of status by checking lat & lng
  const processedSubset = processSubset(subset, dataset);

  const table = createStaticTable(processedSubset, 'data-table');

  dataTableDiv.innerHTML = table.outerHTML;

  // create data table
  addRowClickHandler(initializeDataTable('#data-table'));
  
  // save original table HTML
  if (!originalTableHTML) {
    originalTableHTML = table.outerHTML;
  }
}

function updateDataTable(data, useOriginal = false) {  
  const dataTableDiv = document.getElementById('data-table-div');
  if(!dataTableDiv) return;

  if (useOriginal && originalTableHTML) {
    dataTableDiv.innerHTML = originalTableHTML;
  } else {
    const subset = getUniqueRows(extractColumns(data, subsetHeaders));
    const processedSubset = processSubset(subset, dataset);
    const table = createStaticTable(processedSubset, 'data-table');

    dataTableDiv.innerHTML = table.outerHTML;
  }

  addRowClickHandler(initializeDataTable('#data-table'));
}

export { createDataTable, updateDataTable };