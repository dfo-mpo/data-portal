async function checkFileExistence(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

function getRandomColor() {
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  const hex = '#' + red.toString(16).padStart(2, '0') +
                    green.toString(16).padStart(2, '0') +
                    blue.toString(16).padStart(2, '0');

  return hex;
}

function createElement(tagName, attributes = {}, textContent = '') {
  const element = document.createElement(tagName);

  if (attributes) {
    for (const[attr, value] of Object.entries(attributes)) {
      element.setAttribute(attr, value);
    }
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}