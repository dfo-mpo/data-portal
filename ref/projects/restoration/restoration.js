// const csvfile = './data/dataset_sample_final.csv';

const dataNameAlias = {
  'PrjName': 'Project Name',
  'PrjLead': 'Project Lead Organization',
  'PrjDesc': 'Project Description',
  'Lat': 'Latitude in Decimal Degrees',
  'Lng': 'Longitude in Decimal Degrees',
  'CU_Name': 'MAX_CU_Nam',
  'SMU_Name': 'SMU_Name',
  'Year': 'Reporting Fiscal Year',
  'CU_Index': 'FULL_CU_IN',
  'Species': 'FullSpecies',
  'WatershedName': 'Watershed Name',
  'EcosystemType': 'Ecosystem Type',
}

const selectors = [
  { id: 'projectNameSelector', key: dataNameAlias.PrjName },
  { id: 'speciesSelector', key: dataNameAlias.Species },
  { id: 'cuSelector', key: dataNameAlias.CU_Name },
  { id: 'smuSelector', key: dataNameAlias.SMU_Name }
];

function populateSelectors(data, urlParams = '') {
  selectors.forEach(item => {
    const selector = document.getElementById(item.id);
    const selectedValue = urlParams[item.key] ? urlParams[item.key] : selector.value ;
    const uniqueOptions = getUniqueOptions(data, item.key);
    populateOptions(selector, uniqueOptions, selectedValue);
  });
}

function getUniqueOptions(data, key) {
  return [...new Set(data.map(item => item[key]))].sort();
}

function populateOptions(selector, options, selectedValue = '') {
  selector.innerHTML = '<option value="All">All</option>';
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option;
    if (option === selectedValue) {
      optionElement.selected = true;
    }
    selector.appendChild(optionElement);
  });
}

function updateData(data, urlParams = '') {
  const updatedUrlSearchParams = new URLSearchParams();
  const filterValues = {};

  selectors.forEach(selector => {
    const selectedValue = urlParams[selector.key] ? urlParams[selector.key] : document.getElementById(selector.id).value;

    filterValues[selector.key] = selectedValue;
    if (selectedValue !== 'All') {
      updatedUrlSearchParams.append(selector.key, selectedValue);
    }
  });

  const filteredData = data.filter(item => {
    return selectors.every(selector => {
      const value = filterValues[selector.key];
      return value === '' || value === 'All' || item[selector.key] === value;
    });
  });

  return { filteredData, updatedUrlSearchParams };
}

function updateElements(data, urlParams = '') {
  let url = `${window.location.origin}${window.location.pathname}`;
  const { filteredData, updatedUrlSearchParams } = updateData(data, urlParams);
  
  if (filteredData.length !== 0) {
    // update url params
    const queryString = updatedUrlSearchParams.toString();
    url += queryString ? '?' + queryString : '';
  }

  populateSelectors(filteredData.length !== 0 ? filteredData : data, urlParams);
  createDataTable(filteredData.length !== 0 ? filteredData : data);
  drawLineChart(filteredData.length !== 0 ? filteredData : data);
  drawMap(filteredData.length !== 0 ? filteredData : data);
  
  window.history.replaceState({}, '', url);
}

function registerEventListeners(data) {
  // add event listeners for selectors
  selectors.forEach(selector => {
    document.getElementById(selector.id).addEventListener('change', () => {
      updateElements(data)
    });
  })
  
  // Reset button
  document.getElementById('resetButton').addEventListener('click', () => {
    selectors.forEach(selector => {
      document.getElementById(selector.id).value = 'All';
    })
    updateElements(data);
  });
}

function initialize() {
  fetchData()
    .then(data => {
      const urlParams = readURLParams();
      if (Object.keys(urlParams).length > 0) {
        // console.log('initialize with url params');
        updateElements(data, urlParams);
      } else {
        // console.log('initialize with all data');
        // console.log('data length:', data.length);
        populateSelectors(data);
        createDataTable(data);
        drawLineChart(data);
        drawMap(data);
      }
      
      registerEventListeners(data);
    })
    .catch(error => {
      console.error('Error initializing application:', error);
    });
}

initialize();