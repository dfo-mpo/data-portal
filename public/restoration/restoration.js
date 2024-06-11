import { dataset, selectors, geojsonLayers, geojsonSMULayers } from './global.js';
import { fetchData } from './getdata.js';
import { getFromIndexedDB, saveToIndexedDB } from './indexedDB.js';
import { readURLParams } from './utils.js';
import { createDataTable } from './datatable.js';
import { createChart } from './chart.js';
import { loadedCULayerData, loadedSMULayerData, createMap, updateMap } from './map.js';

const speciesOptions = ['Chinook', 'Chum', 'Coho', 'Pink', 'Sockeye', 'Steelhead', 'Kokanee']; // customize selector options
const cuIdLookup = {};        // cu id lookup table by cu name
const smuIdLookup = {};       // smu id lookup table by smu name

function createSelectors(containerId, selectors) {
  const container = document.getElementById(containerId);
  const fragment = document.createDocumentFragment();
  selectors.forEach(selector => {
    const div = document.createElement('div');
    div.classList = 'grid-item';
    
    const label = document.createElement('label');
    label.setAttribute('for', selector.id);
    label.textContent = selector.name;

    const select = document.createElement('select');
    select.id = selector.id;
    select.classList.add('main-selector');
    
    div.appendChild(label);
    div.appendChild(select);
    fragment.appendChild(div);
  });
  container.appendChild(fragment);
}

function getUniqueOptions(data, key) {
  return [...new Set(data.map(item => item[key]))].sort();
}

function populateOptions(selector, options, selectedValue) {
  selector.innerHTML = '<option value="All">All</option>';
  options.forEach(option => {
    if (!option.text.includes('(Blank)')) {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      if (option.value === selectedValue) {
        optionElement.selected = true;
      }
      selector.appendChild(optionElement);
    }
  });
}

function populateSelectors(data, urlParams) {
  selectors.forEach(selector => {
    const selectorElement = document.getElementById(selector.id);
    const selectedValue = urlParams?.[selector.key] ?? selectorElement.value;
    let uniqueOptions;

    // for speciesSelector: populate salmon species only
    // for cuSelector/smuSelector : populate 'CU/SMU Index : CU/SMU Name'

    switch (selector.id) {
      case 'speciesSelector':
        uniqueOptions = getUniqueOptions(data, selector.key)
                        .map(option => ({ value: option, text: option}))
                        .filter(option => speciesOptions.includes(option.value));
        break;
      case 'cuSelector':
        uniqueOptions = getUniqueOptions(data, selector.key)
                        .map(option => ({
                          value: option,
                          text: `${cuIdLookup[option]} : ${option}`
                        }))
                        .sort((a, b) => a.text.localeCompare(b.text));
        break;
      case 'smuSelector':
        uniqueOptions = getUniqueOptions(data, selector.key)
                        .map(option => ({
                          value: option,
                          text: `${smuIdLookup[option]} : ${option}`
                        }))
                        .sort((a, b) => a.text.localeCompare(b.text));
        break;
      default:
        uniqueOptions = getUniqueOptions(data, selector.key).map(option => ({ value: option, text: option}));
    }

    populateOptions(selectorElement, uniqueOptions, selectedValue);
  });
}

function getUrlSearchParams(urlParams) {
  const updatedUrlSearchParams = new URLSearchParams();

  // get the values selected from dropdown
  selectors.forEach(selector => {
    const selectedValue = urlParams?.[selector.key] ?? document.getElementById(selector.id).value;
    if (selectedValue !== '' && selectedValue !== 'All') {
      // update url query string
      updatedUrlSearchParams.append(selector.key, selectedValue);
    }
  });

  return updatedUrlSearchParams;
}

function updateData(data, urlParams) {
  const updatedUrlSearchParams = getUrlSearchParams(urlParams);

  const filteredData = data.filter(item => {
    return selectors.every(selector => {
      const value = updatedUrlSearchParams.get(selector.key);
      const isMatch = (value === null || value === '' || value === 'All' || item[selector.key] === value);

      // determine if selected is salmon species returns 'all salmon', otherwise not include 'all salmon in the result'
      // const isSpeciesSelector = (selector.id === 'speciesSelector');
      // const isSpecialSpecies = (['Kokanee', 'Steelhead'].includes(value));
      
      // if (!(isSpeciesSelector && isSpecialSpecies)) {
      //   return isMatch || item[selector.key] === 'all salmon';
      // }
      return isMatch;
    });
  });

  return { filteredData, updatedUrlSearchParams };
}

function updateElements(data, urlParams) {
  let url = `${window.location.origin}${window.location.pathname}`;
  const { filteredData, updatedUrlSearchParams } = updateData(data, urlParams);
  
  if (filteredData.length !== 0) {
    // update url params
    const queryString = updatedUrlSearchParams.toString();
    url += queryString ? '?' + queryString : '' ;
  }

  const outputData = filteredData.length !== 0 ? filteredData : data;

  populateSelectors(outputData, urlParams);
  updateMap(outputData);
  createDataTable(outputData);
  createChart(outputData);
  
  window.history.replaceState(null, '', url);
}

function registerEventListeners(data) {
  // add event listeners for selectors
  selectors.forEach(selector => {
    document.getElementById(selector.id).addEventListener('change', () => {
      updateElements(data)
    });
  })
  
  // Reset button
  const resetButton = document.getElementById('reset-btn');
  if (resetButton) {
    document.getElementById('reset-btn').addEventListener('click', () => {
      selectors.forEach(selector => {
        document.getElementById(selector.id).value = 'All';
      })
      updateElements(data);
    });
  }
}

async function loadGeoJSONFiles(geojsonLayers) {
  let loadedLayerData = {};

  if (!(geojsonLayers.some(item => Object.keys(item).length > 0))) {
    return '';
  }

  // const geojsonPromises = geojsonLayers.map(layer => fetch(layer.filename).then(res => res.json()));

  // check for cached data
  const geojsonPromises = geojsonLayers.map(async layer => {
    const cachedData = await getFromIndexedDB('geojsonLayers', layer.name);
    if (cachedData) {
      console.log('Reload cached data...');
      return cachedData;
    } else {
      console.log('Fetch new data...');
      const response = await fetch(layer.filename);
      const data = await response.json();
      await saveToIndexedDB('geojsonLayers', layer.name, data);
      return data;
    }
  });

  const geojsonResults = await Promise.all(geojsonPromises);
  geojsonLayers.forEach((layer, index) => {
    loadedLayerData[layer.name] = geojsonResults[index];
  });

  return loadedLayerData;
}

function showLoadingIndicator(show = false) {
  const loadingIndicator = document.getElementById('loading-indicator');
  const selectorContainer = document.getElementById('selector-container');
  const mapContainer = document.getElementById('map-container');
  const resetButtonContainer = document.getElementById('reset-btn-container');

  if (show) {
    selectorContainer.style.display = 'none';
    mapContainer.style.visibility = 'hidden';
    resetButtonContainer.style.display = 'none';
  } else {
    loadingIndicator.style.display = 'none';
    selectorContainer.removeAttribute('style');
    mapContainer.removeAttribute('style');
    resetButtonContainer.removeAttribute('style');
  }
}

async function initialize() {
  showLoadingIndicator(true);

  try {
    const data = await fetchData(dataset.path);
    if(geojsonLayers) loadedCULayerData.layers = await loadGeoJSONFiles(geojsonLayers);
    if(geojsonSMULayers) loadedSMULayerData.layers = await loadGeoJSONFiles(geojsonSMULayers);    
    createSelectors('selector-container', selectors);
    createMap();
    const urlParams = readURLParams();

    data.forEach(item => {
      cuIdLookup[item[dataset.headers.CU_Name]] = item[dataset.headers.CU_ID];
      smuIdLookup[item[dataset.headers.SMU_Name]] = item[dataset.headers.SMU_ID];
    });
    
    if (Object.keys(urlParams).length > 0) {
      updateElements(data, urlParams);
    } else {
      populateSelectors(data);
      updateMap(data);
      createDataTable(data);
      createChart(data);
    }
    
    registerEventListeners(data);
    showLoadingIndicator(false);
  } catch (error) {
    console.error('Error initializing application:', error);
    document.getElementById('loading-indicator').innerText = 'Failed to load data. Please try again later.';
  }
}

initialize();