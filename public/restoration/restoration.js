function createSelectors(containerId, selectors) {
  const container = document.getElementById(containerId);
  selectors.forEach(selector => {
    const div = document.createElement('div');
    const label = document.createElement('label');
    label.setAttribute('for', selector.id);
    label.textContent = selector.name;
    const select = document.createElement('select');
    select.id = selector.id;
    select.classList.add('main-selector');
    div.appendChild(label);
    div.appendChild(select);
    container.appendChild(div);
  });
}

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
  createMap(filteredData.length !== 0 ? filteredData : data);
  createDataTable(filteredData.length !== 0 ? filteredData : data);
  createChart(filteredData.length !== 0 ? filteredData : data);
  
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
  const resetButton = document.getElementById('resetButton');
  if (resetButton) {
    document.getElementById('resetButton').addEventListener('click', () => {
      selectors.forEach(selector => {
        document.getElementById(selector.id).value = 'All';
      })
      updateElements(data);
    });
  }
}

function initialize() {
  fetchData(csvfile)
    .then(data => {
      const urlParams = readURLParams();
      createSelectors('selectorContainer', selectors);
      if (Object.keys(urlParams).length > 0) {
        updateElements(data, urlParams);
      } else {
        populateSelectors(data);
        createMap(data);
        createDataTable(data);
        createChart(data);
      }
      registerEventListeners(data);
    })
    .catch(error => {
      console.error('Error initializing application:', error);
    });
}

initialize();