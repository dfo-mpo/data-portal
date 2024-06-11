function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GeoJSONCacheDB', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('geojsonLayers')) {
        db.createObjectStore('geojsonLayers');
      }
    };

    request.onsuccess = event => {
      resolve(event.target.result);
    };

    request.onerror = event => {
      reject(event.target.error);
    };
  });
}

function getFromIndexedDB(storeName, key) {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = event => {
      resolve(event.target.result);
    };

    request.onerror = event => {
      reject(event.target.error);
    };
  });
}

function saveToIndexedDB(storeName, key, data) {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data, key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = event => {
      reject(event.target.error);
    };
  });
}

export { getFromIndexedDB, saveToIndexedDB };