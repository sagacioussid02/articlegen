const articlePrompt = (topic, category, subtopic, description) => {
    return `Write a medium article of around 50 words with at least 1 paragraph about ${topic} in the ${category} category. ${subtopic ? `Focusing on ${subtopic}.` : ''} ${description}`;
};

const imagePrompt = (paragraph) => {
    return `Summarize this paragraph in less than 5 words to use it as a prompt to create image: ${paragraph}" `;
};
  
module.exports = {
 articlePrompt,
 imagePrompt,
};
