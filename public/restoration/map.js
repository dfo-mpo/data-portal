import { dataset, selectors, geojsonLayers, geojsonSMULayers } from './global.js';
import { updateDataTable, filterTableById } from './datatable.js';

let map;
let markerGroup = L.layerGroup();
let addedGeojsonLayers = [];            // array with all geojson layers added to map
const speciesLookup = {};               // species look up table by smu id

const loadedCULayerData = { layers: '' };
const loadedSMULayerData = { layers: '' };

// MARKERS

function createMarkers(locationData) {
  let popupByClick = false;
  let popupTimeout;

  const markerStyles = {
    base: {
      radius: 8,
      weight: 1,
      color: 'white',
      opacity: .8,
      fillColor: 'rgba(255, 180, 60, 1)',
      fillOpacity: .7
    },
    selected: {
      radius: 10,
      color: '#3388ff',
      fillColor: '#3388ff',
    },
    unselected: {
      opacity: .025,
      fillColor: 'rgba(255, 180, 60, .2)',
    },
  };

  const markerPopupContent = {
    title: dataset.headers.project_name,
    fields: [
      { key: dataset.headers.year, label: 'Fiscal Year' },
      { key: dataset.headers.ecosystem_type, label: 'Ecosystem Type'},
      { key: dataset.headers.species_name, label: 'Species'},
      { key: dataset.headers.CU_Name, label: 'CU Name'},
      { key: dataset.headers.CU_ID, label: 'CU ID'},
      { key: dataset.headers.SMU_Name, label: 'SMU Name'},
      { key: dataset.headers.SMU_ID, label: 'SMU ID'},
    ]
  }

  const createPopupContent = (location, markerPopupContent) => {
    const title = markerPopupContent.title;
    const fields = markerPopupContent.fields;

    return `
      <div class="popup-content"><h3>${location[title]}</h3>
        <div class="popup-info">
          ${generatePopupContent(location, fields)}
        </div>
      </div>
    `;
  };

  const handleClick = (marker, coordinate, location, markerStyles) => {
    if (!popupByClick) {
      filterTableById(location['id']);

      markerGroup.eachLayer(marker => {
        marker.setStyle(markerStyles.unselected);
      });
      marker.setStyle(markerStyles.selected);

      const adjustedCoordinate = getAdjustedCoordinate(coordinate, true);

      makePopup(marker, createPopupContent(location, markerPopupContent), [0, -10]);            
      map.flyTo(adjustedCoordinate, map.getZoom(), { animate: true, duration: .5 });

      popupByClick = true;
    }
  };

  const handleMouseOver = (marker, location) => {
    if (!popupByClick) {
      popupTimeout = setTimeout(() => {
        makePopup(marker, createPopupContent(location, markerPopupContent), [0, -10]);
      }, 100);
    }
  };

  const handleMouseOut = (marker) => {
    if (!popupByClick) {
      clearTimeout(popupTimeout);
      marker.closePopup();
    }
  }

  const handlePopupClose = () => {
    if (popupByClick) {
      updateDataTable(locationData, true);
      markerGroup.eachLayer(marker => marker.setStyle(markerStyles.base));
      popupByClick = false;
    }
  }

  const createMarker = (location, markerStyles) => {
    const lat = location[dataset.headers.lat];
    const lng = location[dataset.headers.lng];

    // skip to draw markers for projects without lat & lng
    if (!isNaN(lat) && !isNaN(lng)) {
      const coordinate = L.latLng(lat, lng);
      const marker = L.circleMarker(coordinate, markerStyles.base).addTo(markerGroup);

      marker.on({
        click: () => handleClick(marker, coordinate, location, markerStyles),
        mouseover: () => handleMouseOver(marker, location),
        mouseout: () => handleMouseOut(marker),
        popupclose: () => handlePopupClose(),
      });
    }
  }

  locationData.forEach(location => {
    createMarker(location, markerStyles);
  });

  markerGroup.addTo(map, {animate: false, duration: 5, noMoveStart: true});
}

function generatePopupContent(properties, fields) {
  return fields.map(field => {
    const value = properties[field.key];
    return `<p><strong>${field.label}:</strong> ${value === '(Blank)' || !value ? 'N/A' : value}</p>`;
  }).join('');
}

const makePopup = (layer, content, offsetParam = [0, 0], latLng) => {
  layer.bindPopup(content, { closeButton: false, offset: offsetParam, autoPan: false }).openPopup(latLng);
};

// SET MAP CENTER POINT

function getAdjustedCoordinate(coordinate, shiftYAxis = false) {
  // used to get the new center lat & lng based on the status of the collapsible element on the map
  // adjusted size = map width - collasible element width - layer list info control width
  // adjusted center point = map center point + collasible element width / 2 - layer list info control width / 2
  const sideControlElement = document.getElementById('side-control');
  if (!sideControlElement) return coordinate;
  const isShow = sideControlElement.classList.contains('show');
  const layerControlElement = document.getElementById('layer-control');

  // default center point shifting x y axis in pixels
  const offsetX = isShow ? (sideControlElement.offsetWidth - layerControlElement.offsetWidth) / 2 : 0 ;
  const offsetY = shiftYAxis ? -50 : 0 ;

  const offsetPoint = L.point(offsetX, offsetY);
  const containerPoint = map.latLngToContainerPoint(coordinate);
  const adjustedContainerPoint = containerPoint.add(offsetPoint); // add x: shift left; subtract x: shift right  

  return map.containerPointToLatLng(adjustedContainerPoint);
}

function getMarkerGroupCenter() {
  const markers = markerGroup.getLayers();

  if (markers.length === 0) {
    return null;
  }
  
  let totalLat = 0;
  let totalLng = 0;

  markers.forEach(marker => {
    const latlng = marker.getLatLng();
    totalLat += latlng.lat;
    totalLng += latlng.lng;
  })

  const avgLat = totalLat / markers.length;
  const avgLng = totalLng / markers.length;

  return L.latLng(avgLat, avgLng);
}

function setMarkerGroupView() {
  const markers = markerGroup.getLayers();

  if (markers.length === 0) {
      return null;
  }

  let bounds = markers[0].getLatLng().toBounds(1);

  markers.forEach(marker => {
      bounds.extend(marker.getLatLng());
  });

  // get adjusted coordinate
  const adjustedCoordinate = getAdjustedCoordinate(bounds.getCenter());
  map.setView(adjustedCoordinate, map.getZoom(), { animate: false });
}

// CONTROL ELEMENTS FLOATING ON MAP

function createInfoControl(options) {
  const { position = 'topleft', id, className, title, content } = options;

  const control = L.control({ position });

  control.onAdd = function () {
    this._div = L.DomUtil.create('div', `info-control ${className}`);
    if (id) this._div.setAttribute('id', id);
    this.update(title, content);
    return this._div;
  };

  control.update = function(title, content) {
    this._div.innerHTML = '';

    if (title) {
      this._div.innerHTML += `<h4>${title}</h4>`;
    }

    if (content) {
      this._div.innerHTML += content;
    }
  }

  return control;
}

// LAYERS LIST CONTROL

function addLayerToControl(control, layerName, visibility = 'fa-eye-slash') {
  const div = document.createElement('div');

  const span = document.createElement('span');
  span.textContent = layerName;

  const i = document.createElement('i');
  i.setAttribute('id', `toggle-icon-${layerName}`);
  i.classList.add('toggle-icon', 'fa-regular', visibility);

  div.appendChild(span);
  div.appendChild(i);

  control.appendChild(div);
}

function updateIconState(icon, isVisible) {
  if (isVisible) {
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  } else {
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  }
}

function setLayerVisibility(icon, geojson, markerGroup) {
  icon.addEventListener('click', () => {
    const isLayerVisible = map.hasLayer(geojson);
    if (isLayerVisible) {
      geojson.removeFrom(map);
      updateIconState(icon, false);
    } else {
      geojson.addTo(map);
      updateIconState(icon, true);

      // force to add marker group in the front
      if (map.hasLayer(markerGroup)) {
        markerGroup.removeFrom(map);
        markerGroup.addTo(map);
      }
    }
  });
}

function initializeLayerVisibility(layerName, geojson) {
  // this function adds feature of click to toggle the map layer on and off

  const toggleIcon = document.getElementById(`toggle-icon-${layerName}`);
  // ensure remove any old event listeners by cloning the element
  const newToggleIcon = toggleIcon.cloneNode(true);
  toggleIcon.parentNode.replaceChild(newToggleIcon, toggleIcon);

  if (!geojson && layerName === 'Coordinates') {
    geojson = markerGroup;
  }

  if (!geojson) {
    updateIconState(newToggleIcon, false);
    newToggleIcon.classList.add('disabled');
    newToggleIcon.style.pointerEvents = 'none';
    return;
  } else {
    updateIconState(newToggleIcon, true);
    newToggleIcon.classList.remove('disabled');
    newToggleIcon.style.pointerEvents = 'auto';
  }

  setLayerVisibility(newToggleIcon, geojson, markerGroup);

  // reset icon state
  const isVisible = map.hasLayer(geojson);
  updateIconState(newToggleIcon, isVisible);
}

// COLLAPSIBLE BUTTON CONTROL
function createCollapsibleControl (options) {
  const { parentElementID, buttonContainerID, buttonID, iconClassShow, iconClassHide } = options;

  const parentElement = document.getElementById(parentElementID);

  // create collapsible button container
  const buttonContainer = document.createElement('div');
  buttonContainer.setAttribute('id', buttonContainerID);

  // create the button
  const button = document.createElement('button');
  button.setAttribute('id', buttonID);
  buttonContainer.appendChild(button);
  
  parentElement.appendChild(buttonContainer);

  // retrieve the button from the DOM and add the event listener
  const butotonDOM = document.getElementById(buttonID);
  if (butotonDOM) {
    butotonDOM.addEventListener('click', () => {
      parentElement.classList.toggle('show');
      updateButtonIcon();
    });

    // set the initial state of the button
    updateButtonIcon();

    function updateButtonIcon() {
      const isShow = parentElement.classList.contains('show');
      const iconClass = isShow ? iconClassShow : iconClassHide;
      // const buttonText = isShow ? 'Close' : 'Open';
      butotonDOM.innerHTML = `<i class="${iconClass}"></i>`;
    }
  }
}

function rearrangePageElements(containerIds, minScreenWidth = 640) {
  // this function removes the element containers from the sideControl container in the map
  // and then move then to dashboard-container container under the map, action determined by screen size
  const dashboardContainer = document.getElementById('dashboard-container');
  const sideControlElement = document.getElementById('side-control');
  const containers = containerIds.map(id => document.getElementById(id));

  const checkWidth = () => {
    const screenWidth = window.innerWidth;

    if (screenWidth <= minScreenWidth) {
      if (sideControlElement) sideControlElement.style.display = 'none';
      containers.forEach(container => {
        dashboardContainer.appendChild(container);
      });
    } else {
      if (sideControlElement) {
        sideControlElement.style.display = '';
        containers.forEach(container => {
          sideControlElement.appendChild(container);
        });
      }
    }
  };

  window.addEventListener('resize', checkWidth);
  checkWidth();
}

// GEOJSON LAYERS

function updateGeoJsonData(data, mapping, key) {
  const geojsonData = data.features.filter(item => {
    return mapping.includes(item.properties[key]);
  });  
  return geojsonData;
}

function removeAllGeoJsonLayers() {
  addedGeojsonLayers.forEach(layer => {
    map.removeLayer(layer);
  });
  addedGeojsonLayers = [];
}

function createGeoLayers(locationData, geojsonLayers, layerType, loadedGeoJsonData) {
  const mappingKeys = {
    CU: {
      source: dataset.headers.CU_ID,        // header from dataset to match CU geojson property
      target: 'FULL_CU_IN'                  // property from CU geojson
    },
    SMU: {
      source: dataset.headers.SMU_ID,       // header from dataset to match SMU geojson property
      target: 'SMU_ID'                      // property from SMU geojson
    }
  };

  const mappingKey = mappingKeys[layerType];

  if (!mappingKey) {
    console.warn('Invalid layerType specified. No proper mappingKey found.');
    return;
  }

  // map all unique mappingKey.source from dataset to an array
  const mapping = [...new Set(locationData.map(item => item[mappingKey.source]))];

  // define layer content. key: properties from geojson. label: display name
  const layerPopupContent = {
    'CU': {
      title: { key: 'CU', label: 'CU'},
      id: { key: 'FULL_CU_IN', label: 'CU Index' },
      fields: [
        { key: 'CU_Type', label: 'CU Type' },
        { key: 'Area', label: 'DFO Area' },
        { key: 'SMU_Name', label: 'SMU Name' },
        { key: 'Species', label: 'Species' },
      ]
    },
    'SMU': {
      title: { key: 'SMU_Name', label: 'SMU'},
      id: { key: 'SMU_ID', label: 'SMU ID' },
      fields: [
        { key: 'Area', label: 'DFO Area' },
      ]
    }
  }

  geojsonLayers.forEach(geojsonLayer => {
    let loadedLayerData = loadedGeoJsonData[geojsonLayer.name];
    let geojsonData;

    if (selectors.every(selector => document.getElementById(selector.id).value === 'All')) {
      geojsonData = loadedLayerData.features;
    } else {     
      geojsonData = updateGeoJsonData(loadedLayerData, mapping, mappingKey.target);
    }
    
    if (geojsonData.length !== 0) {
      function mouseoverFeature(e) {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: 'yellow',
        });
      }

      function mouseoutFeature(e) {
        const layer = e.target;
        geojson.resetStyle(layer);

        setTimeout(() => {
          layer.closePopup();
        }, 300);
      }

      function clickFeature(e) {
        const layer = e.target;
        const latlng = L.latLng(e.latlng.lat + .1, e.latlng.lng);

        layer.setStyle({
          color: '#3388ff',
          fillColor: '#3388ff',
          fillOpacity: .5
        });

        // create content popup
        const properties = layer.feature.properties;
        let popupContent = '';
        
        if (layerPopupContent[layerType]) {
          const title = layerPopupContent[layerType].title;
          const id = layerPopupContent[layerType].id;
          const field = layerPopupContent[layerType].fields;
          
          popupContent += `
            <div class="popup-content">
              <h3><strong>${title.label}: ${properties[title.key]}</strong></h3>
              <div class="popup-info">
                <p><strong>${id.label}:</strong> ${properties[id.key] || 'N/A'}</p>
                ${generatePopupContent(properties, field)}
                ${(layerType === 'SMU' ? `<p><strong>Species:</strong> ${speciesLookup[properties[id.key]] || 'N/A'}</p>` : '')}
              </div>
            </div>
          `;
        }

        makePopup(layer, popupContent, [0, 0], latlng);
      }

      function onEachFeature(feature, layer) {
        layer.on({
          mouseover: mouseoverFeature,
          mouseout: mouseoutFeature,
          click: clickFeature
        });
      }

      const geoStyle = () => ({
        weight: 1,
        color: '#555555',
        fillColor: geojsonLayer.fillColor,
        fillOpacity: .2
      });

      const geojson = L.geoJson(geojsonData, {
        style: geoStyle,
        onEachFeature: onEachFeature
      });

      addedGeojsonLayers.push(geojson);

      initializeLayerVisibility(geojsonLayer.name, geojson);
      const enableVisibility = document.getElementById(`toggle-icon-${geojsonLayer.name}`);
      enableVisibility.classList.remove('disabled');
    } else {
      initializeLayerVisibility(geojsonLayer.name, null);
    }
  })
}

// HANDLE MOUSE EVENTS
// function to add an event listener to an element
function addEventListener(element, eventType, handler) {
  if (element && typeof handler === 'function') {
    element.addEventListener(eventType, handler);
  }
}

// function to stop event propagation
// used for preventing clicks to close popup content
function stopPropagationHandler(e) {
  e.stopPropagation();
}

// function to disable controls when mouse entering to certain area
function disableMouseEvents(isDisabled) {
  if (isDisabled) {
    map.doubleClickZoom.disable();
    map.dragging.disable();
    map.keyboard.disable();
    map.scrollWheelZoom.disable();
  } else {
    map.doubleClickZoom.enable();
    map.dragging.enable();
    map.keyboard.enable();
    map.scrollWheelZoom.enable(); 
  }
}

// INITIALIZE BASE MAP

function updateMap(locationData) {
  locationData.forEach(item => {
    speciesLookup[item[dataset.headers.SMU_ID]] = item[dataset.headers.species_name];
  });
  
  // clear existing markers
  markerGroup.clearLayers();

  // remove existing geoJSON layers
  removeAllGeoJsonLayers();

  // create new markers
  createMarkers(locationData);
  initializeLayerVisibility('Coordinates', null);

  // create new layers to map
  if (Object.keys(loadedCULayerData.layers).length > 0) {
    createGeoLayers(locationData, geojsonLayers, 'CU', loadedCULayerData.layers);
  } else {
    console.warn('No CU Layer data provided or data is empty');
  }

  if (Object.keys(loadedSMULayerData.layers).length > 0) {
    createGeoLayers(locationData, geojsonSMULayers, 'SMU', loadedSMULayerData.layers);
  } else {
    console.warn('No SMU Layer data provided or data is empty');
  }

  setMarkerGroupView();
}

function createMap() {
  if (!map) {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    mapContainer.innerHTML = '<div id="map"></div>';

    map = L.map('map', {
      center: [50.9267, -124.6476],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
      maxZoom: 14
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // initialize marker group layer
    markerGroup = L.layerGroup();

    // create layer info control
    const layerControlOptions = {
      id: 'layer-control',
      className: 'layer-control coll up show',
      content: '<div id="layer-list-container"></div>'
    }
    const layerControl = createInfoControl(layerControlOptions);
    layerControl.addTo(map);

    // create data table info control
    const sideControlOptions = {
      position: 'topright',
      id: 'side-control',
      className: 'side-control coll right show',
      content: '<div id="data-table-container"></div><div id="chart-container"></div>'
    }
    const sideControl = createInfoControl(sideControlOptions);
    sideControl.addTo(map);

    // prevent from map interactions when mouse entering the control area
    const infoControls = ['layer-control', 'side-control'];
    infoControls.forEach(control => {
      const element = document.getElementById(control);
      if (element) {
        element.addEventListener('mouseenter', () => { disableMouseEvents(true) });
        element.addEventListener('mouseleave', () => { disableMouseEvents(false) });
      }
    });

    // add elements to layer list control
    const layerListContainer = document.getElementById('layer-list-container');

    // add maker layer to list control
    addLayerToControl(layerListContainer, 'Coordinates', 'fa-eye');

    // add geojson layers to list control
    if (geojsonLayers && geojsonLayers.some(item => Object.keys(item).length)) {
      const cuTitle = document.createElement('h4');
      cuTitle.className = 'divider';
      cuTitle.textContent = 'CU Layers';
      layerListContainer.appendChild(cuTitle);

      geojsonLayers.forEach(geojsonLayer => {
        addLayerToControl(layerListContainer, geojsonLayer.name);
      })
    }

    if (geojsonSMULayers && geojsonSMULayers.some(item => Object.keys(item).length)) {
      // add smu layer title
      const smuTitle = document.createElement('h4');
      smuTitle.className = 'divider';
      smuTitle.textContent = 'SMU Layers';
      layerListContainer.appendChild(smuTitle);

      geojsonSMULayers.forEach(geojsonLayer => {
        addLayerToControl(layerListContainer, geojsonLayer.name);
      })
    }

    // create collapsible button to toggle info control
    createCollapsibleControl({
      parentElementID: 'side-control',
      buttonContainerID: 'toggle-btn-container',
      buttonID: 'toggle-btn',
      iconClassShow: 'fa-solid fa-angles-right',
      iconClassHide: 'fa-solid fa-angles-left'
    });

    createCollapsibleControl({
      parentElementID: 'layer-control',
      buttonContainerID: 'layer-toggle-btn-container',
      buttonID: 'layer-toggle-btn',
      iconClassShow: 'fa-solid fa-chevron-up',
      iconClassHide: 'fa-solid fa-chevron-down'
    });

    rearrangePageElements(['data-table-container', 'chart-container']);


    addEventListener(document.getElementById('side-control'), 'click', stopPropagationHandler);
    addEventListener(document.getElementById('layer-control'), 'click', stopPropagationHandler);
  }
}

export { 
  loadedCULayerData, 
  loadedSMULayerData, 
  createMap, 
  updateMap
};