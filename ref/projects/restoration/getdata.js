function readCSVFile(fileName) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', fileName);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const csvString = xhr.responseText;
          const jsonData = csvToJSON(csvString);
          resolve(jsonData);
        } else {
          reject(new Error('Failed to fetch CSV file'));
        }
      }
    };
    xhr.send();
  });
}

function csvToJSON(csvString) {
  const lines = csvString.split('\n');
  const headers = lines[0].split(',').map(header => header.trim()); // `.replace(/\s+/g, '')` Add this to remove spaces
  const jsonData = [];
  const strToFloat = [dataNameAlias.Lat, dataNameAlias.Lon];

  headers[0] = (headers[0] === '') ? 'id' : headers[0];

  for (let i = 1; i < lines.length; i++) {
    const data = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(value => value.replace(/(^"|"$)/g, '').trim());
    const row = {};

    if (data.length === headers.length) {
      
      for (let j = 0; j < headers.length; j++) {
        const value = data[j] || "(Blank)";
        row[headers[j]] = !(strToFloat.includes(headers[j])) ? value : parseFloat(value);
      }
      jsonData.push(row);
    }
  }

  return jsonData;
}

async function csv2json(inputFile) {
  return new Promise((resolve, reject) => {
    readCSVFile(inputFile)
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function fetchData(csvfile) {
  try {
    // const fileExists = await checkFileExistence(csvfile);
    // if (!fileExists) {
    //   throw new Error('File does not exist.');
    // }
    // const data = await csv2json(csvfile);
    const data = dataset;
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}