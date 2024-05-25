function createMarkers(map, locationData) {
  let popupByClick = false;
  let popupTimeout;
  const markerGroup = L.layerGroup();

  const markerStyles = {
    base: {
      radius: 8,
      weight: 1,
      color: 'white',
      opacity: .8,
      fillColor: 'rgba(255, 165, 0, 1)',
      fillOpacity: .7
    },
    selected: {
      color: '#3388ff',
      fillColor: '#3388ff',
    },
    unselected: {
      opacity: .025,
      fillColor: 'rgba(255, 165, 0, .2',
    },
  };

  const createMarker = (location, markerStyles) => {
    const lat = location[dataNameAlias.Lat];
    const lng = location[dataNameAlias.Lng];

    // skip to draw markers for projects without lat & lng
    if (!isNaN(lat) && !isNaN(lng)) {
      const coordinate = [lat, lng];
      let marker = L.circleMarker(coordinate, markerStyles.base).addTo(markerGroup);

      let keysToOmit = [
        'id',
        dataNameAlias.PrjName,
        // dataNameAlias.PrjLead,
        // dataNameAlias.PrjDesc,
        dataNameAlias.CU_Name,
        dataNameAlias.SMU_Name,
        dataNameAlias.Year,
        dataNameAlias.CU_Index,
        dataNameAlias.Species,
      ];
      let popupContent = `<div class="popup-content"><h3>${location[dataNameAlias.PrjName]}</h3><div class="popup-info">`;
      for (const key in location) {
        if (Object.hasOwnProperty.call(location, key) && !keysToOmit.includes(key)) {
          popupContent += `<p><strong>${key}:</strong> ${location[key]}</p>`;
        }
      }
      popupContent += '</div></div>';

      marker.on({
        click: () => {
          if (!popupByClick) {
            const clickedItemID = location['id'];
            const filteredData = locationData.filter(item => item['id'] == clickedItemID);
            createDataTable(filteredData);

            markerGroup.eachLayer(marker => {
              marker.setStyle(markerStyles.unselected);
            })
            marker.setStyle({
              // ...markerStyles.base,
              ...markerStyles.selected
            });

            makePopup(marker, popupContent, [0, -10]);
            map.flyTo(marker.getLatLng(), map.getZoom(), { animate: true, duration: .5 });

            popupByClick = true;
          }
        },

        mouseover: () => {
          if (!popupByClick) {
            popupTimeout = setTimeout(() => {
              makePopup(marker, popupContent, [0, -10]);
            }, 300);
          }
        },

        mouseout: () => {
          if (!popupByClick) {
            clearTimeout(popupTimeout);
            marker.closePopup();
          }
        },
      })

    }
  }

  locationData.forEach(location => {
    createMarker(location, markerStyles);
  });

  map.on({
    click: () => {
      if (popupByClick) {
        createDataTable(locationData);
        markerGroup.eachLayer(marker => {
          marker.setStyle(markerStyles.base);
        })
        popupByClick = false;
      }
    }
  })

  markerGroup.addTo(map, {animate: false, duration: 5, noMoveStart: true});
  
  return markerGroup;
}

const makePopup = (layer, content, offsetParam = [0, 0], latLng = '') => {
  layer.bindPopup(content, { closeButton: false, offset: offsetParam }).openPopup(latLng);
};

function getMarkerGroupCenter(markerGroup) {
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

function setMarkerGroupView(markerGroup, map) {
  const markers = markerGroup.getLayers();

  if (markers.length === 0) {
      return null;
  }

  let bounds = markers[0].getLatLng().toBounds(1);

  markers.forEach(marker => {
      bounds.extend(marker.getLatLng());
  });

  map.flyToBounds(bounds, { animate: false });
}

function createInfoControl(map, options = {}) {
  const { position = 'topleft', className = '', title = '', content = '' } = options;

  const control = L.control({ position });

  control.onAdd = function (map) {
    this._div = L.DomUtil.create('div', `info-control ${className}`);
    this.update(title, content);
    return this._div;
  };

  control.update = function(title, content) {
    this._div.innerHTML = ''

    if (title) {
      this._div.innerHTML += `<h4>${title}</h4>`;
    }

    if (content) {
      this._div.innerHTML += content;
    }
  }

  control.addTo(map);

  return control;
}

function addLayerToControl(control, layerName, visibility = 'fa-eye-slash disabled') {
  const div = document.createElement('div');
  div.appendChild(
    createElement('span', {}, layerName)
  );
  div.appendChild(
    createElement('i', { 'id': `toggle-icon-${layerName}`, 'class': `toggle-icon fa-regular ${visibility}` })
  );

  control._div.appendChild(div);
}

function addLayerDivider(control, dividerTitle = '') {
  if (dividerTitle) {
    const newTag = createElement('h4', { 'class' : 'divider' }); 
    newTag.textContent = dividerTitle;
    control._div.appendChild(newTag);
  } else { return; }
}

function addLayerVisibility(map, markerGroup, layerName = '', geojson = '') {
  const toggleIcon = document.getElementById(`toggle-icon-${layerName}`);
  if (!geojson && layerName === 'Coordinates') {
    geojson = markerGroup;
  }

  toggleIcon.addEventListener('click', () => {
    if (toggleIcon.classList.contains('fa-eye')) {
      geojson.removeFrom(map);
      toggleIcon.classList.remove('fa-eye');
      toggleIcon.classList.add('fa-eye-slash');
    } else {
      geojson.addTo(map);
      toggleIcon.classList.remove('fa-eye-slash');
      toggleIcon.classList.add('fa-eye');

      // force to add marker group in the front
      if (map.hasLayer(markerGroup) && geojson != markerGroup) {
        markerGroup.removeFrom(map);
        markerGroup.addTo(map);
      }
    }
  });
}

function updateGeoJsonData(data, mapping, key) {
  const geojsonData = data.features.filter(item => {
    return mapping.includes(item.properties[key.toUpperCase()]);
  });  
  return geojsonData;
}

function createGeoLayers(map, locationData, markerGroup, geojsonLayers, control, mappingType, loadedGeoJsonData) {
  let mapping;
  let mappingKey;

  // index mapping
  if (mappingType === 'CU') {
    mappingKey = dataNameAlias.CU_Index;
    mapping = [...new Set(locationData.map(item => item[mappingKey]))];
  } else if (mappingType === 'SMU') {
    mappingKey = dataNameAlias.SMU_Name;
    mapping = [...new Set(locationData.map(item => item[mappingKey]))];
  } else {
    throw new Error('Invalid mappingType specified');
  }

  geojsonLayers.forEach(geojsonLayer => {
    addLayerToControl(control, geojsonLayer.name);

    let loadedLayerData = loadedGeoJsonData[geojsonLayer.name];

    if (selectors.every(selector => document.getElementById(selector.id).value === 'All')) {
      geojsonData = loadedLayerData.features;
    } else {
      geojsonData = updateGeoJsonData(loadedLayerData, mapping, mappingKey);
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
        }, 800);
      }

      function clickFeature(e) {
        const layer = e.target;
        const latlng = L.latLng(e.latlng.lat + .1, e.latlng.lng);

        layer.setStyle({
          color: '#3388ff',
          fillColor: '#3388ff',
          fillOpacity: .5
        });

        const properties = layer.feature.properties;
        let keysToOmit = ['OBJECTID_1', 'OBJECTID'];
        let title = '';
        if (properties['CU']) {
          title = `<h3><strong>CU:</strong> ${properties['CU']}</h3>`;
          keysToOmit.push('CU');
        } else if (properties['SMU']) {
          title = `<h3><strong>SMU:</strong> ${properties['SMU']}</h3>`;
          keysToOmit.push('SMU');
        }

        let popupContent = '<div class="popup-content">';
        popupContent += title;
        popupContent += '<div class="popup-info">';
        for (const key in properties) {
          if (Object.hasOwnProperty.call(properties, key) && !keysToOmit.includes(key)) {
            popupContent += `<p><strong>${key}:</strong> ${properties[key]}</p>`;
          }
        }
        popupContent += '</div></div>';
        
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

      addLayerVisibility(map, markerGroup, geojsonLayer.name, geojson);
      const enableVisibility = document.getElementById(`toggle-icon-${geojsonLayer.name}`);
      enableVisibility.classList.remove('disabled');
    }
  })
}

function createMap(locationData) {
  document.getElementById('mapContainer').innerHTML = "<div id='mapDiv'></div>";

  const map = L.map('mapDiv', {
    center: [50.9267, -124.6476],
    zoom: 7,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.control.zoom({ position: 'bottomleft' }).addTo(map);

  // Create marker layer
  const markerGroup = createMarkers(map, locationData);
  setMarkerGroupView(markerGroup, map);
  
  // Create layer control
  const layerControlOptions = {
    className: 'layer-control',
    title : 'Layers',
  }
  const layerControl = createInfoControl(map, layerControlOptions);
  addLayerToControl(layerControl, 'Coordinates', 'fa-eye');
  addLayerVisibility(map, markerGroup, 'Coordinates');

  createGeoLayers(map, locationData, markerGroup, geojsonLayers, layerControl, 'CU', loadedCULayerData);
  
  addLayerDivider(layerControl, 'SMU Layers');
  createGeoLayers(map, locationData, markerGroup, geojsonSMULayers, layerControl, 'SMU', loadedSMULayerData);

}