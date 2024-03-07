const express = require('express');
const bodyParser = require('body-parser');
const generateArticleController = require('./controller/generateArticleController');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
// Enable CORS for all origins (for development)
app.use(cors());

// Route for generating article
app.post('/generate-article', generateArticleController);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
