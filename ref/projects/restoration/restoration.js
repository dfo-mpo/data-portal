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

function updateData(data, urlParams = '', updatedUrlSearchParams = '') {
  const filterValues = {};

  selectors.forEach(selector => {
    const selectedValue = urlParams[selector.key] ? urlParams[selector.key] : document.getElementById(selector.id).value;

    filterValues[selector.key] = selectedValue;
    if (filterValues[selector.key] !== 'All') {
      updatedUrlSearchParams.append(selector.key, filterValues[selector.key]);
    }
  });

  const filteredData = data.filter(item => {
    return selectors.every(selector => {
      const value = filterValues[selector.key];
      return value === '' || value === 'All' || item[selector.key] === value;
    });
  });

  return filteredData;
}

function updateElements(data, urlParams = '') {
  const updatedUrlSearchParams = new URLSearchParams();
  const filteredData = updateData(data, urlParams, updatedUrlSearchParams);

  let url = `${window.location.origin}${window.location.pathname}`;
  
  if (filteredData.length !== 0) {
    // update url params
    const nonEmptyParams = Array.from(updatedUrlSearchParams).filter(([key, value]) => value !== '');
    const queryString = new URLSearchParams(nonEmptyParams).toString();  

    url += queryString ? '?' + queryString : '';

    populateSelectors(filteredData, urlParams);
    createDataTable(filteredData);
    drawLineChart(filteredData);
    drawMap(filteredData);
  } else {
    populateSelectors(data);
    createDataTable(data);
    drawLineChart(data);
    drawMap(data);
  }
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
        updateElements(data, urlParams);
      } else {
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