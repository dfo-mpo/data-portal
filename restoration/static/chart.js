function countProjectsByYear(data, key) {
  const yearCounts = {};
  data.forEach(project => {
      const year = project[key];
      yearCounts[year] = (yearCounts[year] || 0) + 1;
  });

  return Object.keys(yearCounts).map(year => ({
    'Year': year,
    'Count': yearCounts[year]
  }));
}

function linechart(data) {
  document.getElementById('chartContainer').innerHTML = "<div id='chartDiv'></div>";

  am5.ready(function() {
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new("chartDiv");
    
    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    
    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelY: "zoomXY",
        pinchZoomX: true
      })
    );
    
    chart.get("colors").set("step", 2);
    
    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/  
    var xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 50,
      minorGridEnabled: true
    });
    
    var xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "Year",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {})
      })
    );
    
    xRenderer.grid.template.setAll({
      location: 1
    })
    
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraMax: 0.1,
        extraMin: 0.1,
        renderer: am5xy.AxisRendererY.new(root, {
          strokeOpacity: 0.1
        }),
        tooltip: am5.Tooltip.new(root, {})
      })
    );
    
    // Create series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var series = chart.series.push(
      am5xy.LineSeries.new(root, {
        calculateAggregates: true,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "Count",
        categoryXField: "Year",
        tooltip: am5.Tooltip.new(root, {
          labelText: "value: {valueY}"
        })
      })
    );
    
    // Add circle bullet
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/#Bullets
    series.bullets.push(function() {
      var graphics = am5.Circle.new(root, {
        strokeWidth: 2,
        radius: 5,
        stroke: series.get("stroke"),
        fill: root.interfaceColors.get("background")
      });
      return am5.Bullet.new(root, {
        sprite: graphics
      });
    });
    
    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    chart.set("cursor", am5xy.XYCursor.new(root, {
      xAxis: xAxis,
      yAxis: yAxis,
      snapToSeries: [series]
    }));
    
    series.data.setAll(data);
    xAxis.data.setAll(data);
    
    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000);
    chart.appear(1000, 100);
  });
}

function filterByYear(data, yearThresholdStart, yearThresholdEnd) {
  return data.filter(obj => {
    const yearRange = obj["Year"].split("-").map(Number);
    return yearRange.some(Year => Year > yearThresholdStart && Year < yearThresholdEnd);
  });
}

function drawLineChart(data) {
  document.getElementById('chartContainer').innerHTML = "<div id='chartDiv'></div>";
  const projectCountsByYear = countProjectsByYear(data, dataNameAlias.Year);
  projectCountsByYear.sort((a, b) => a["Year"].localeCompare(b["Year"]));
  linechart(filterByYear(projectCountsByYear, 2018, 2024));
}