const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require("openai");
const fs = require('fs');
const { promisify } = require('util');

const app = express();
const port = 3001;

// Promisify file system methods
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const mkdirp = async (dirPath) => {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error("Error creating directory:", error);
  }
};

// Middleware
app.use(bodyParser.json());

// Replace 'YOUR_OPENAI_API_KEY' with your actual OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';

const openai = new OpenAI();

// Route for generating article
app.post('/generate-article', async (req, res) => {
  try {
    const { numArticles, category, topic, subtopic, description } = req.body;

    // Check each parameter and replace it with a default value if missing
    const defaultNumArticles = numArticles || 1;
    const defaultCategory = category || "defaultCategory";
    const defaultTopic = topic || "defaultTopic";
    const defaultDescription = description || "defaultDescription";

    const articles = [];
    for (let i = 0; i < numArticles; i++) {
      const articleContent = await generateArticle(category, topic, subtopic, description);
      const paragraphs = separateParagraphs(articleContent);
      const images = await generateImages(paragraphs);

      articles.push({
        content: articleContent,
        paragraphs,
        images,
      });

      const folderPath = `./generated_articles`;
      await mkdirp(folderPath);

      // Save article content to a .txt file with image URLs below each paragraph
      await saveArticleWithImages(articleContent, images, `./generated_articles/article_${i + 1}.txt`);
    }

    res.send('Articles generated successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

async function generateArticle(category, topic, subtopic, description) {
  const prompt = `Write a medium article of around 50 words with at least 1 paragraph about ${topic} in the ${category} category. ${subtopic ? `Focusing on ${subtopic}.` : ''} ${description}`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4-turbo-preview',
      temperature: 0.5, // Moderate temperature for balanced creativity
    });

    if (completion && completion.choices && completion.choices.length > 0) {
      return completion.choices[0].message.content;
    } else {
      console.error("Error: OpenAI response undefined or missing choices.");
    }
  } catch (error) {
    console.error("Error during OpenAI request:", error);
  }
}

function separateParagraphs(text) {
  return text.split('\n\n');
}

async function generateImages(paragraphs) {
  const images = [];
  for (const paragraph of paragraphs) {
    const summary = await summarizeParagraph(paragraph);
    const imgPrompt = `${summary}`;
    try {
        const image = await openai.images.generate({ 
            model: "dall-e-3", 
            prompt: imgPrompt
        });
      images.push(image.data[0].url);

    } catch (error) {
      console.error("Error generating image:", error);
    }
  }
  return images;
}

async function saveArticleWithImages(content, images, filePath) {
  let textWithImages = '';
  const paragraphs = separateParagraphs(content);

  for (let i = 0; i < paragraphs.length; i++) {
    textWithImages += `${paragraphs[i]}\n`; // Add paragraph
    textWithImages += `![Image ${i + 1}](${images[i]})\n\n`; // Add image URL below the paragraph
  }

  await writeFile(filePath, textWithImages);
}

async function summarizeParagraph(paragraph) {
    try {
        const response = await openai.chat.completions.create({
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: "Summarize this paragraph in less than 5 words to use it as a prompt to create image:"+paragraph },
            ],
            model: 'gpt-4-turbo-preview',
          });
  
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error summarizing paragraph:", error);
      return paragraph; // Return the original paragraph if summarization fails
    }
  }

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
