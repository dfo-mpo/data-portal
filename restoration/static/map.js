const geojsonLayers = [
  //{
  //  filename: document.body.getAttribute('data-geojson-ck'),
  //  fillColor: '#3388ff',
  //  name: 'CU Chinook'
  //},
  {
     filename: document.body.getAttribute('data-geojson-co'),
     fillColor: 'red',
     name: 'CU Coho'
  }
];

function createMarkers(map, locationData) {
  const markerGroup = L.layerGroup();

  locationData.forEach(location => {
    const lat = location[dataNameAlias.Lat];
    const lon = location[dataNameAlias.Lon];

    // skip to draw markers for projects without lat & lon
    if (!isNaN(lat) && !isNaN(lon)) {
      const marker = L.circleMarker([lat, lon], {
        radius: 6,
        weight: 2,
        color: 'white',
        opacity: .2,
        fillColor: 'orange',
        fillOpacity: 1
      }).addTo(markerGroup);

      marker.on('click', () => {
        const clickedItemID = location['id'];
        const filteredData = locationData.filter(item => item['id'] == clickedItemID);
        createDataTable(filteredData);

        // update selectors
        projectNameSelector.value = filteredData[0][dataNameAlias.PrjName];
        speciesSelector.value = filteredData[0][dataNameAlias.Species];
        cuSelector.value = filteredData[0][dataNameAlias.CU_Name];
        smuSelector.value = filteredData[0][dataNameAlias.SMU_Name];

        map.flyTo(marker.getLatLng());
      })

      const popupContent = `
        <div>
          Project Name: ${location[dataNameAlias.PrjName]}
          <br>
          Lat ${location[dataNameAlias.Lat]}, Long ${location[dataNameAlias.Lon]}
          <br>
          CU: ${location[dataNameAlias.CU_Name]}
          <br>
          CU Index: ${location[dataNameAlias.CU_Index]}
          <br>
          SMU: ${location[dataNameAlias.SMU_Name]}
          <br>
          Target Species: ${location[dataNameAlias.Species]}
          <br>
          Reporting Fiscal Year: ${location[dataNameAlias.Year]}
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
        }, 1000);
      });
    }
  });

  markerGroup.addTo(map);
  return markerGroup;
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
    const div = document.createElement('div');
    div.appendChild(
      createElement('span', {'class': 'layer-name'}, l)
    );
    div.appendChild(
      createElement('i', {'id': `toggle-icon-${l}`, 'class': 'toggle-icon fa-regular fa-eye'})
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
    geojsonData = data.features.filter(item => {
      return cuids.includes(item.properties['FULL_CU_IN']);
    });
  }

  return geojsonData;
}

function drawMap(locationData) {
  document.getElementById('mapContainer').innerHTML = "<div id='mapDiv'></div>";

  const map = L.map('mapDiv').setView([50.9267, -124.6476], 7)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const markerGroup = createMarkers(map, locationData);
  createLayerList(map);
  toggleLayer(map, markerGroup, 'Coordinates');

  const geojsonLayersList = [];

  geojsonLayers.forEach(geojsonLayer => {
    fetch(geojsonLayer.filename)
      .then(response => response.json())
      .then(data => {
        const geojsonData = updateGeoJsonData(data, locationData);

        console.log(geojsonData);

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

          // setTimeout(() => {
          //   layer.closePopup();
          // }, 400);
        }

        function clickFeature(e) {
          const layer = e.target;
          const latlng = L.latLng(e.latlng.lat + .1, e.latlng.lng);

          // map.fitBounds(layer.getBounds());
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
              CU Index: ${layer.feature.properties['FULL_CU_IN']}
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
        }).addTo(map);
        geojson.bringToBack();

        geojsonLayersList.push(geojson);

        toggleLayer(map, geojson, geojsonLayer.name, markerGroup);
      })
    })   
}