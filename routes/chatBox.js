const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const router = require('express').Router();
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/gene', async (req, res) => {
    try {
        const { message, history } = req.body; 

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 200, 
            },
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const text = response.text();
        
        res.json({ reply: text });

    } catch (error) {
        console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
        if (error.message.includes('API key not valid')) {
            res.status(401).json({ error: 'Invalid API Key. Please check your server configuration.' });
        } else if (error.message.includes('429')) { // Too Many Requests
            res.status(429).json({ error: 'Too many requests to Gemini API. Please try again later.' });
        }
        else {
            res.status(500).json({ error: 'Failed to get response from Gemini API' });
        }
    }
});

module.exports = router;