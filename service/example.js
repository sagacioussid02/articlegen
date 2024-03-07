require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const base64 = require('base-64');
const cors = require('cors');
const openai = require('openai');

const app = express();
// Enable CORS for all origins (for development)
app.use(cors());
const port = 3001; // Choose any available port

// Replace with your actual API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "default_value_here";


app.use(bodyParser.json());


app.post('/openai-api', async (req, res) => {
    try {
      const prompt = req.body.prompt;
      const openai_client = new openai();
      const response = await openai_client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'user', content: prompt },
        ],
      });
  
      res.json({ response: response.choices[0].message.content });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error processing OpenAI request' });
    }
  });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});