const dataNameAlias = {
  'Year': 'Reporting Fiscal Year',
  'PrjName': 'Project Name',
  'PrjDesc': 'Project Description',
  'PrjLead': 'Project Lead Organization',
  'WName': 'Watershed Name',
  'Lat': 'Latitude in Decimal Degrees',
  'Lon': 'Longitude in Decimal Degrees',
  'EcoType': 'Ecosystem Type',
  'Species': 'Target Species',
  'CU_Name': 'CU_Name',
  'CU_Index': 'FULL_CU_Index',
  'SMU_Name': 'SMU_Name',
  'Location': 'Mapped Location'
}

const csvFile = document.body.getAttribute('data-csv-file');

async function initialize(csvfile) {
  try {
    const data = await fetchData(csvfile);
    populateSelectors(data);
    updateData(data);
    registerEventListeners(data);
  } catch (error) {
    console.error('Error initializing application:', error);
  }
}

initialize(csvFile);

function populateSelectors(data) {
  const uniqueProjectNames = [...new Set(data.map(item => item[dataNameAlias.PrjName]))].sort();
  const uniqueSpecies = [...new Set(data.map(item => item[dataNameAlias.Species]))].sort();
  const uniqueCUNames = [...new Set(data.map(item => item[dataNameAlias.CU_Name]))].sort();
  const uniqueSMUNames = [...new Set(data.map(item => item[dataNameAlias.SMU_Name]))].sort();

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

function updateData(data) {
  const projectName = document.getElementById('projectNameSelector').value;
  const species = document.getElementById('speciesSelector').value;
  const cuNames = document.getElementById('cuSelector').value;
  const smuNames = document.getElementById('smuSelector').value;

  const filteredData = data.filter(item => {
    return (projectName === 'All' || item[dataNameAlias.PrjName] === projectName) &&
      (species === 'All' || item[dataNameAlias.Species] === species) &&
      (cuNames === 'All' || item[dataNameAlias.CU_Name] === cuNames) &&
      (smuNames === 'All' || item[dataNameAlias.SMU_Name] === smuNames);
  });
  
  createDataTable(filteredData);
  drawLineChart(filteredData);
  drawMap(filteredData);
}

function registerEventListeners(data) {
  document.getElementById('projectNameSelector').addEventListener('change', () => {updateData(data)});
  document.getElementById('speciesSelector').addEventListener('change', () => {updateData(data)});
  document.getElementById('cuSelector').addEventListener('change', () => {updateData(data)});
  document.getElementById('smuSelector').addEventListener('change', () => {updateData(data)});

  // Reset button
  document.getElementById('resetButton').addEventListener('click', () => {
    projectNameSelector.value = 'All';
    speciesSelector.value = 'All';
    cuSelector.value = 'All';
    smuSelector.value = 'All';
    updateData(data);
  });
}