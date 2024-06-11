import { dataset } from './global.js';
import { getUniqueRows } from "./utils.js";

const dataHeaders = [
  dataset.headers.project_name,
  dataset.headers.project_description,
  dataset.headers.year,
  dataset.headers.lat,
  dataset.headers.lng,
];

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

function createStaticTable(data) {
  // create data table
  const dataTableDiv = document.getElementById('data-table-div');
  const dataTable = document.createElement('table');
  dataTable.setAttribute('id', 'data-table');
  dataTable.setAttribute('class', 'display compact'); // 'hover compact row-border'
  dataTable.style.width = '100%';
  dataTableDiv.appendChild(dataTable);

  // create table head
  const dataHead = document.createElement('thead');
  dataTable.appendChild(dataHead);
  const dataHeadRow = document.createElement('tr');
  dataHead.appendChild(dataHeadRow);

  // add column headers
  // column header for collapsible button
  dataHeadRow.appendChild(document.createElement('th'));

  // exclude lat & lng columns
  const headersToDisplay = dataHeaders.filter(header => header !== dataset.headers.lat && header !== dataset.headers.lng);
  headersToDisplay.forEach(header => {
    const col = document.createElement('th');
    col.textContent = header;
    dataHeadRow.appendChild(col);
  });

  // add status column header
  const statusCol = document.createElement('th');
  statusCol.textContent = 'Status';
  dataHeadRow.appendChild(statusCol);

  // create table body
  const dataBody = document.createElement('tbody');
  dataBody.setAttribute('id', 'dataBody');
  dataTable.appendChild(dataBody);
  
  // populate table rows with data 
  data.forEach(row => {
    const dataRow = document.createElement('tr');

    // add collapsible button column 
    dataRow.innerHTML += '<td class="dt-control"></td>';

    headersToDisplay.forEach(header => {
      dataRow.innerHTML += `<td>${row[header]}</td>`;
    })

    // status column
    dataRow.innerHTML += `<td>${row['status']}</td>`;

    dataBody.appendChild(dataRow);
  });
}

function createDataTable(data) {
  const dataTableContainer = document.getElementById('data-table-container');
  if(!dataTableContainer) return;

  dataTableContainer.innerHTML = '<div id="data-table-div"></div>';

  // create subset by columns, and then get unique data rows
  const subset = getUniqueRows(extractColumns(data, dataHeaders));
  
  createStaticTable(
    // map each row with new column 'status', determine based on presence of lat and lng
    subset.map(row => {
      const status = isNaN(row[dataset.headers.lat]) || isNaN(row[dataset.headers.lng]) ? 'Unmapped' : 'Mapped';
      const { [dataset.headers.lat]: lat, [dataset.headers.lng]: lng, ...rest } = row;
      return { ...rest, status };
    })
  );

  let table = new DataTable('#data-table', {
    paging: false,
    scrollCollapse: true,
    // set scrolling area height, equation is (map-height - chart-height - padding - search-bar-height - header-row-height - bottom-info-height)
    scrollY: 'calc(var(--map-base-height) - var(--chart-base-height) - 40px - 37px - 27px - 28px)',
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
      { target: 3, title: 'Fiscal Year', width: '100px' },
      { target: 4, title: 'Status'}
    ],
    layout: {
      topStart: {
        search: { return: false, boundary: true }
      },
      topEnd: null,
      bottomStart: 'info',
      bottomEnd: null, // { paging: { type: 'simple_numbers', numbers: 5} },
    }
  });

  function format(data) {
    return (
      `
      <p style="padding-left: 20px; padding-right: 20px;">
        <b>Project Description:</b>
        <br>
        ${data[2]}
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

export { createDataTable };