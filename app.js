const express = require('express');
const path = require('path');

const app = express();
const port = 8000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a route for the homepage
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Define a route for the restoration page
app.get('/restoration', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'restoration', 'restoration.html'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(`http://localhost:${port}/restoration/`);
});
