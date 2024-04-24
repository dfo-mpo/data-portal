// Define a function to draw the Leaflet map with markers based on location data
function drawMap(locationData) {
  // Reset the map container element
  document.getElementById('mapContainer').innerHTML = "<div id='map'></div>";

  // initialize the map centered on British Columbia, Canada
  var mymap = L.map('map').setView([54.5, -125], 5);

  // add a tile layer for the map background
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mymap);

  // Loop through the locationData array and add markers for each location
  locationData.forEach(function(location) {
    var lat = location['Latitude in Decimal Degrees'];
    var lon = location['Longitude in Decimal Degrees'];
    var projectName = location['Project Name']; // Change to project name

    // Add a marker for the current location
    var marker = L.marker([lat, lon]).addTo(mymap);

    // Add a popup to the marker with the project name
    marker.bindPopup(projectName);
  });
}

// Export the drawMap function for use in other JavaScript files
// export { drawMap };
