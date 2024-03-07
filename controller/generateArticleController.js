const { generateArticle, generateImages, saveArticleWithImages, separateParagraphs, mkdirp } = require('../logic/articleGenerator');

async function generateArticleController(req, res) {
  try {
    const { numArticles, category, topic, subtopic, description } = req.body;
    const defaultNumArticles = numArticles || 1;
    const defaultCategory = category || "defaultCategory";
    const defaultTopic = topic || "defaultTopic";
    const defaultDescription = description || "defaultDescription";

    const articles = [];
    for (let i = 0; i < defaultNumArticles; i++) {
      const articleContent = await generateArticle(defaultCategory, defaultTopic, subtopic, defaultDescription);
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
}

module.exports = generateArticleController;
