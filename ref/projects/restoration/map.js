const geojsonLayers = [
  // {
  //   filename: './data/CK_CU_Boundary_Simple.geojson',
  //   fillColor: '#3388ff',
  //   name: 'CU Chinook'
  // },
  // {
  //   filename: './data/CO_CU_Boundary_Simple.geojson',
  //   fillColor: 'red',
  //   name: 'CU Coho'
  // }
];

function createMarkers(map, locationData) {
  const markerGroup = L.layerGroup();

  locationData.forEach(location => {
    const lat = location[dataNameAlias.Lat];
    const lng = location[dataNameAlias.Lng];

    // skip to draw markers for projects without lat & lng
    if (!isNaN(lat) && !isNaN(lng)) {
      const marker = L.circleMarker([lat, lng], {
        radius: 7,
        weight: 2,
        color: 'white',
        opacity: .7,
        fillColor: 'orange',
        fillOpacity: 1
      }).addTo(markerGroup);

      marker.on('click', () => {
        const clickedItemID = location['id'];
        const filteredData = locationData.filter(item => item['id'] == clickedItemID);
        createDataTable(filteredData);

        map.flyTo(marker.getLatLng());
      })

      const popupContent = `
        <div>
          Project Name: ${location[dataNameAlias.PrjName]}
          <br>
          Lat ${location[dataNameAlias.Lat]}, Long ${location[dataNameAlias.Lng]}
          <br>
          CU: ${location[dataNameAlias.CU_Name]}, (${location[dataNameAlias.CU_Index]})
        </div>
      `;

      marker.on('mouseover', () => {
        setTimeout(() => {
          marker.bindPopup(popupContent, { closeButton: false })
                .openPopup();
        }, 800);
      });
      
      marker.on('mouseout', () => {
        setTimeout(() => {
          marker.closePopup();
        }, 1200);
      });
    }
  });

  // markerGroup.addTo(map);
  markerGroup.addTo(map, {animate: false, duration: 5, noMoveStart: true})
  return markerGroup;
}

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

  map.flyToBounds(bounds, {animate: false});
}

function createLayerList(map) {
  const info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this._div.setAttribute('id', 'layer-list');
    return this._div;
  };

  info.addTo(map);

  allLayers = geojsonLayers.map(l => l.name);
  allLayers.unshift('Coordinates');
  allLayers.forEach(l => {
    let toggleState = 'fa-eye-slash';
    if (l === 'Coordinates') {
      toggleState = 'fa-eye';
    }
    const div = document.createElement('div');
    div.appendChild(
      createElement('span', {'class': 'layer-name'}, l)
    );
    div.appendChild(
      createElement('i', {'id': `toggle-icon-${l}`, 'class': `toggle-icon fa-regular ${toggleState}`})
    );

    info._div.appendChild(div);
  })
}

function toggleLayer(map, layer, layerName, markerGroup) {
  const toggleIcon = document.getElementById(`toggle-icon-${layerName}`);

  toggleIcon.addEventListener('click', () => {
    if (toggleIcon.classList.contains('fa-eye')) {
      layer.removeFrom(map);
      toggleIcon.classList.remove('fa-eye');
      toggleIcon.classList.add('fa-eye-slash');
    } else {
      layer.addTo(map);
      toggleIcon.classList.remove('fa-eye-slash');
      toggleIcon.classList.add('fa-eye');
    }

    if (!(layerName === 'Coordinates') && markerGroup) {
      markerGroup.removeFrom(map);
      markerGroup.addTo(map);
    }
  });  
}

function updateGeoJsonData(data, locationData) {
  const selectedProjectName = document.getElementById('projectNameSelector').value;
  const selectedCU = document.getElementById('cuSelector').value;

  if (selectedProjectName === 'All' && selectedCU === 'All') {
    geojsonData = data;
  } else {
    const cuids = [...new Set(locationData.map(item => item[dataNameAlias.CU_Index]))];
    // console.log('cuids', cuids);
    geojsonData = data.features.filter(item => {
      return cuids.includes(item.properties['FULL_CU_IN']);
    });
  }

  // console.log('geojsonData',geojsonData);
  return geojsonData;
}

function drawMap(locationData) {
  document.getElementById('mapContainer').innerHTML = "<div id='mapDiv'></div>";

  const map = L.map('mapDiv').setView([50.9267, -124.6476], 7); // to remove attribution {attributionControl: false}

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const markerGroup = createMarkers(map, locationData);
  // center = getMarkerGroupCenter(markerGroup);
  // if (center) {
  //   map.setView(center, map.getZoom());
  // }
  setMarkerGroupView(markerGroup, map);
  createLayerList(map);
  toggleLayer(map, markerGroup, 'Coordinates');

  const geojsonLayersList = [];

  geojsonLayers.forEach(geojsonLayer => {
    fetch(geojsonLayer.filename)
      .then(response => response.json())
      .then(data => {
        const geojsonData = updateGeoJsonData(data, locationData);

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
            opacity: 1,
            fillColor: '#3388ff',
            fillOpacity: .7
          });

          const popupContent = `
            <div>
              CU Name: ${layer.feature.properties['CU_Name']}
              <br>
              Type: ${layer.feature.properties['CU_Type']}
              <br>
              Species: ${layer.feature.properties['Species_Nm']}
            </div>
          `;

          layer.bindPopup(popupContent, { closeButton: false })
                .openPopup(latlng);
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
          fillColor: getRandomColor(),
          fillOpacity: .2
        });

        const geojson = L.geoJson(geojsonData, {
          style: geoStyle,
          onEachFeature: onEachFeature
        });
        geojson.bringToBack();

        geojsonLayersList.push(geojson);

        toggleLayer(map, geojson, geojsonLayer.name, markerGroup);
      })
    })
}