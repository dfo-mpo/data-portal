const geojsonLayers = [
  {
    data: ck_cu_data,
    fillColor: '#bd175d',
    name: 'Chinook CUs'
  }
];

function createMarkers(map, locationData) {
  let popupByClick = false;
  let mouseOverTimeout;
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
      fillColor: 'rgba(255, 165, 0, .05',
    },
  };

  const createMarker = (location, markerStyles) => {
    const lat = location[dataNameAlias.Lat];
    const lng = location[dataNameAlias.Lng];

    // skip to draw markers for projects without lat & lng
    if (!isNaN(lat) && !isNaN(lng)) {

      const marker = L.circleMarker([lat, lng], markerStyles.base).addTo(markerGroup);

      const popupContent = `
        <div class="popup-content">
          <h3>${location[dataNameAlias.PrjName]}</h3>
          <div class="popup-info">
            <p><strong>Latitude:</strong> ${location[dataNameAlias.Lat]}</p>
            <p><strong>Longitude:</strong> ${location[dataNameAlias.Lng]}</p>
            <p><strong>CU Name:</strong> ${location[dataNameAlias.CU_Name]}</p>
            <p><strong>CU Index:</strong> ${location[dataNameAlias.CU_Index]}</p>
          </div>
        </div>
      `;

      marker.on({
        click: () => {
          popupByClick = true;

          const clickedItemID = location['id'];
          const filteredData = locationData.filter(item => item['id'] == clickedItemID);
          createDataTable(filteredData);

          markerGroup.eachLayer(marker => {
            marker.setStyle(markerStyles.unselected);
          })
          marker.setStyle({
            ...markerStyles.base,
            ...markerStyles.selected
          });
          map.flyTo(marker.getLatLng(), map.getZoom(), { animate: true, duration: .5 });
          makePopup(marker, popupContent, [0, -10]);
        },

        popupclose: () => {
          popupByClick = false;
          // reset data
          createDataTable(locationData);
          markerGroup.eachLayer(marker => {
            marker.setStyle(markerStyles.base);
          })
        },

        mouseover: () => {
          clearTimeout(mouseOverTimeout);
          mouseOverTimeout = setTimeout(() => {
            if (!popupByClick) {
              makePopup(marker, popupContent, [0, -10]);
            }
          }, 300);
        },
        
        mouseout: () => {
          clearTimeout(mouseOverTimeout);
          if (!popupByClick) {
            marker.closePopup();
          }
        },
      })
    }
  }

  locationData.forEach(location => {
    createMarker(location, markerStyles);
  });

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

function createLayerLegend(map) {
  const info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  info.update = function() {
    this._div.innerHTML = '<h4>Layers</h4>';
  }

  info.addTo(map);

  return info;
}

function addLayerToLegend(layerLegend, layerName, visibility = 'fa-eye-slash disabled') {
  const div = document.createElement('div');
  div.appendChild(
    createElement('span', {}, layerName)
  );
  div.appendChild(
    createElement('i', { 'id': `toggle-icon-${layerName}`, 'class': `toggle-icon fa-regular ${visibility}` })
  );

  layerLegend._div.appendChild(div);
}

function toggleLayerVisibility(map, layerName = '', geojson = '', markerGroup = '') {
  const toggleIcon = document.getElementById(`toggle-icon-${layerName}`);

  toggleIcon.addEventListener('click', () => {
    if (toggleIcon.classList.contains('fa-eye')) {
      geojson.removeFrom(map);
      toggleIcon.classList.remove('fa-eye');
      toggleIcon.classList.add('fa-eye-slash');
    } else {
      geojson.addTo(map);
      toggleIcon.classList.remove('fa-eye-slash');
      toggleIcon.classList.add('fa-eye');
    }

    // After toggle map, move markers to front
    if (!(layerName === 'Coordinates') && markerGroup) {
      markerGroup.removeFrom(map);
      markerGroup.addTo(map);
    }
    
  });
}

function updateGeoJsonData(data, cuids) {
  const geojsonData = data.filter(item => {
    return cuids.includes(item.properties['FULL_CU_IN']);
  });  
  return geojsonData;
}

function drawMap(locationData) {
  document.getElementById('mapContainer').innerHTML = "<div id='mapDiv'></div>";

  const map = L.map('mapDiv').setView([50.9267, -124.6476], 7); // to remove attribution {attributionControl: false}

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const geojsonLayersList = [];
  const cuids = [...new Set(locationData.map(item => item[dataNameAlias.CU_Index]))];

  const markerGroup = createMarkers(map, locationData);
  setMarkerGroupView(markerGroup, map);

  const layerLegend = createLayerLegend(map);
  addLayerToLegend(layerLegend, 'Coordinates', 'fa-eye');
  toggleLayerVisibility(map, 'Coordinates', markerGroup);

  geojsonLayers.forEach(geojsonLayer => {
    addLayerToLegend(layerLegend, geojsonLayer.name);
    const data = geojsonLayer.data;
    
    // fetch(geojsonLayer.filename)
    //   .then(response => {
    //     if (!response.ok) {
    //       throw new Error('Failed to fetch GeoJSON data');
    //     }
    //     return response.json();
    //   })
    //   .then(data => {
        let geojsonData = [];

        if (selectors.every(selector => document.getElementById(selector.id).value === 'All')) {
          geojsonData = data;
        } else {
          geojsonData = updateGeoJsonData(data, cuids);
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

            const popupContent = `
              <div class="popup-content">
                <h3><strong>CU:</strong> ${layer.feature.properties['CU_Name']}</h3>
                <div class="popup-info">
                  <p><strong>Species:</strong> ${layer.feature.properties['Species_Nm']}</p>
                  <p><strong>CU Type:</strong> ${layer.feature.properties['CU_Type']}</p>
                  <p><strong>CU Index:</strong> ${layer.feature.properties['FULL_CU_IN']}</p>
                </div>
              </div>
            `;
            
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
          
          geojsonLayersList.push(geojson);

          toggleLayerVisibility(map, geojsonLayer.name, geojson, markerGroup);
          const enableVisibility = document.getElementById(`toggle-icon-${geojsonLayer.name}`);
          enableVisibility.classList.remove('disabled');
        }
        
      // })
      // .catch(error => {
      //   console.error('Error fetching GeoJSON data:', error);
      // })
    })
}