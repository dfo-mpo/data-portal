function drawMap(locationData) {
  console.log(locationData);
  
  Highcharts.mapChart('map', {
    chart: {
      margin: 0
    },
  
    title: {
      text: ''
    },
  
    subtitle: {
      text: ''
    },
  
    navigation: {
      buttonOptions: {
        align: 'left',
        theme: {
          stroke: '#e6e6e6'
        }
      }
    },
  
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        alignTo: 'spacingBox'
      }
    },
  
    mapView: {
      center: [-125, 54.5],
      zoom: 5
    },
  
    tooltip: {
      pointFormat: '{point.name}'
    },
  
    legend: {
      enabled: true,
      title: {
        text: 'Project Locations'
      },
      align: 'left',
      symbolWidth: 20,
      symbolHeight: 20,
      itemStyle: {
        textOutline: '1 1 1px rgba(255,255,255)'
      },
      backgroundColor: 'rgba(255,255,255,0.8)',
      float: true,
      borderColor: '#e6e6e6',
      borderWidth: 1,
      borderRadius: 2,
      itemMarginBottom: 5
    },
  
    plotOptions: {
      mappoint: {
        dataLabels: {
          enabled: false
        }
      },
      series: {
        turboThreshold: 0
      }
    },
  
    series: [
      {
        type: 'tiledwebmap',
        name: 'Basemap Tiles',
        provider: {
          type: 'OpenStreetMap'
        },
        showInLegend: false
      },
      {
        type: 'mappoint',
        name: 'Project Locations',
        marker: {
          symbol: 'circle',
          radius: 5,
        },
        data: locationData.map(location => ({
          name: location['Project Name'],
          lat: location['Latitude in Decimal Degrees'],
          lon: location['Longitude in Decimal Degrees'],
          tooltip: {
            pointFormat: '<b>{point.name}</b><br>{point.info}'
          },
        })),
          
      }
    ]
  });
  return 0;
}

// export { drawMap };