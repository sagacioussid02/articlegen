const { OpenAI } = require("openai");

const openai = new OpenAI();

async function main() {
    const image = await openai.images.generate({ 
        model: "dall-e-3", 
        prompt: "Quantum AI Exploration" 
    });

    console.log(image.data);
    console.log(image.data.url);
}
main();