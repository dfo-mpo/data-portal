import { dataset } from './global.js';
import { checkFileExistence  } from "./utils.js";

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
  const lines = csvString.split('\r\n');
  const headers = lines[0].split(',').map(header => header.trim()); // `.replace(/\s+/g, '')` Add this to remove spaces
  const jsonData = [];
  const requireStrToFloat = [dataset.headers.lat, dataset.headers.lng];
  let count = 0;

  for (let i = 1; i < lines.length; i++) {
    const data = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(value => value.replace(/(^"|"$)/g, '').trim());
    const row = {};

    if (data.length === headers.length) {
      
      for (let j = 0; j < headers.length; j++) {
        const value = data[j] || "(Blank)";
        row[headers[j]] = !(requireStrToFloat.includes(headers[j])) ? value : parseFloat(value);
      }

      // create unique identifer column
      row['id'] = count;
      jsonData.push(row);
    }
    count += 1;
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

function fetchAndParseCSV(filePath) {
  return new Promise((resolve, reject) => {
    fetch(filePath)
      .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.text();
      })
      .then(csvData => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          transform: function (value, header) {
            return value === '' ? '(Blank)' : value;
          },
          complete: function(results) {
            const jsonData = [];
            results.data.forEach((row, index) => {
              row.id = index.toString(); // Assigning index as 'id'
              jsonData.push(row);
            });
            resolve(jsonData);
          },
          error: function(error) {
            reject(error);
          }
        });
      })
      .catch(error => reject(error));
  });
}

async function fetchData(csvfile) {
  try {
    const fileExists = await checkFileExistence(csvfile);
    if (!fileExists) {
      throw new Error('File does not exist.');
    }
    const data = await fetchAndParseCSV(csvfile);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export { fetchData };