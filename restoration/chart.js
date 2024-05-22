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

function barChart(data) {
  const xLabel = 'Year';
  const yLabel = 'Count';
  
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
    var chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft:0,
      paddingRight:1
    }));
    
    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);
    
    
    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xRenderer = am5xy.AxisRendererX.new(root, { 
      minGridDistance: 30, 
      minorGridEnabled: true
    });
    
    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 0,
      fontSize: 10
    });
    
    xRenderer.grid.template.setAll({
      location: 1
    })
    
    var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: xLabel,
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));
    
    var yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0.1,
    })

    yRenderer.labels.template.setAll({
      rotation: -45,
      fontSize: 10,
    });
    
    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 0.3,
      renderer: yRenderer,
      // strictMinMax: true,
      min: 0,
    }));
    
    // Create series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Series 1",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: yLabel,
      sequencedInterpolation: true,
      categoryXField: xLabel,
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      })
    }));
    
    series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, strokeOpacity: 0 });
    series.columns.template.adapters.add("fill", function (fill, target) {
      return chart.get("colors").getIndex(series.columns.indexOf(target));
    });
    
    series.columns.template.adapters.add("stroke", function (stroke, target) {
      return chart.get("colors").getIndex(series.columns.indexOf(target));
    });

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        sprite: am5.Label.new(root, {
          centerX: am5.p50,
          centerY: am5.p50,
          text: "{valueY}",
          populateText: true,
          fontSize: 12,
          fontWeight: "500",
          dy: -10,
        })
      });
    });
    
    xAxis.data.setAll(data);
    series.data.setAll(data);
    
    
    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000);
    chart.appear(1000, 100);
    
    }); // end am5.ready()
  
}

function filterByYear(data, yearThresholdStart = '', yearThresholdEnd = '') {
  return data.filter(obj => {
    const yearRange = obj["Year"].split("-").map(Number);
    return (yearThresholdStart != '' && yearThresholdEnd != '') ? 
      yearRange.some(Year => Year > yearThresholdStart && Year < yearThresholdEnd) : yearRange;
    // return yearRange.some(Year => Year > yearThresholdStart && Year < yearThresholdEnd);
  });
}

function createChart(data) {
  const chartContainer = document.getElementById('chartContainer');

  if(!chartContainer) {
    return;
  }

  chartContainer.innerHTML = "<div id='chartDiv'><h4>Total Number of Projects</h4></div>";
  const projectCountsByYear = countProjectsByYear(data, dataNameAlias.Year);
  projectCountsByYear.sort((a, b) => a["Year"].localeCompare(b["Year"]));
  // linechart(filterByYear(projectCountsByYear, 2018, 2024));
  barChart(filterByYear(projectCountsByYear));
}