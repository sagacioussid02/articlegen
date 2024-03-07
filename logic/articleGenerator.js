const { OpenAI } = require("openai");
const fs = require('fs');
const { promisify } = require('util');
const prompts = require('../prompts/prompts');

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

// Initialize OpenAI API
const openai = new OpenAI();

async function generateArticle(category, topic, subtopic, description) {
    const promptContent = prompts.articlePrompt(topic, category, subtopic, description);
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: promptContent },
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
              { role: 'user', content: prompts.imagePrompt(paragraph) },
            ],
            model: 'gpt-4-turbo-preview',
          });
  
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error summarizing paragraph:", error);
      return paragraph; // Return the original paragraph if summarization fails
    }
  }

module.exports = {
  generateArticle,
  generateImages,
  saveArticleWithImages,
  separateParagraphs,
  summarizeParagraph,
  mkdirp
};
