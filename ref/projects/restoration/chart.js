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

function linechart(values, labels, xTitle, yTitle) {
  Highcharts.chart('lineChart', {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Test Data'
    },
    subtitle: {
        text: ''
    },
    xAxis: {
        categories: labels
    },
    yAxis: {
        title: {
            text: yTitle
        }
    },
    plotOptions: {
        line: {
            dataLabels: {
                enabled: true
            },
            enableMouseTracking: false
        }
    },
    series: [{
        name: xTitle,
        data: values
    }]
  });
  return 0;
}

function drawLineChart(data) {
  document.getElementById('chartContainer').innerHTML = "<div id='lineChart'></div>";
  const projectCountsByYear = countProjectsByYear(data, 'Reporting Fiscal Year');
  const labels = projectCountsByYear.map(entry => entry['Year']);
  const values = projectCountsByYear.map(entry => entry['Count']);
  linechart(values, labels, 'Year', 'Number of Projects');
  return 0;
}

// export { drawLineChart };