// const file = './data/restoration_projects_dataportal.csv';
// const file = './data/restoration_projects_dataportal1.csv';
// const file = './data/sample_data.csv';

// async function checkFileExistence(url) {
//   try {
//     const response = await fetch(url, { method: 'HEAD' });
//     return response.ok;
//   } catch (error) {
//     console.error('Error checking file existence:', error);
//     return false;
//   }
// }

async function fetchData() {
  try {
    // const fileExists = await checkFileExistence(file);
    // if (!fileExists) {
    //   throw new Error('File does not exist.');
    // }
    // const data = await csv2json(file);
    const data = dataset;
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

function populateSelectors(data) {
  const uniqueProjectNames = [...new Set(data.map(item => item['Project Name']))].sort();
  const uniqueSpecies = [...new Set(data.map(item => item['FullSpecies']))].sort();
  const uniqueCUNames = [...new Set(data.map(item => item['MAX_CU_Nam']))].sort();
  const uniqueSMUNames = [...new Set(data.map(item => item['SMU_Name']))].sort();

  const projectNameSelector = document.getElementById('projectNameSelector');
  const speciesSelector = document.getElementById('speciesSelector');
  const cuSelector = document.getElementById('cuSelector');
  const smuSelector = document.getElementById('smuSelector');

  populateOptions(projectNameSelector, uniqueProjectNames);
  populateOptions(speciesSelector, uniqueSpecies);
  populateOptions(cuSelector, uniqueCUNames);
  populateOptions(smuSelector, uniqueSMUNames);
}

function populateOptions(selector, options) {
  selector.innerHTML = '<option value="All">All</option>';
  for (let option of options) {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option;
    selector.appendChild(optionElement);
  }
}

function updateData() {
  const projectName = document.getElementById('projectNameSelector').value;
  const species = document.getElementById('speciesSelector').value;
  const cuNames = document.getElementById('cuSelector').value;
  const smuNames = document.getElementById('smuSelector').value;

  fetchData()
    .then(data => {
      const filteredData = data.filter(item => {
        return (projectName === 'All' || item['Project Name'] === projectName) &&
               (species === 'All' || item['FullSpecies'] === species) &&
               (cuNames === 'All' || item['MAX_CU_Nam'] === cuNames) &&
               (smuNames === 'All' || item['SMU_Name'] === smuNames);
      });

      const dataTableBody = document.getElementById('dataBody');
      dataTableBody.innerHTML = '';
      
      // Update data table 
      filteredData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item['Project Name']}</td>
          <td>${item['Project Lead Organization']}</td>
          <td>${item['Project Description']}</td>
        `;
        dataTableBody.appendChild(row);
      });

      // populateSelectors(filteredData);
      // console.log(filteredData);

      drawLineChart(filteredData);
      drawMap(filteredData);

      // console.log(filteredData);
    })
    .catch(error => {
      console.error('Error updating data table:', error);
    });
}

function registerEventListeners() {
  document.getElementById('projectNameSelector').addEventListener('change', updateData);
  document.getElementById('speciesSelector').addEventListener('change', updateData);
  document.getElementById('cuSelector').addEventListener('change', updateData);
  document.getElementById('smuSelector').addEventListener('change', updateData);
}

function initialize() {
  fetchData()
    .then(data => {
      populateSelectors(data);
      // drawLineChart(data)
      // drawMap(data);
      updateData();
      registerEventListeners();
    })
    .catch(error => {
      console.error('Error initializing application:', error);
    });
}

initialize();