const express = require('express');
const cors = require('cors');
const app = express();

// Add this
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ai = new GoogleGenerativeAI("AIzaSyD4SX2TeFTj7NXGovdxP8xBrMYJcvE1H6w");

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('AI Assistant Backend is running');
});

// Updated /api/chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message, codeMentions } = req.body;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({
      id: Date.now().toString(),
      type: 'assistant',
      content: text,
      timestamp: new Date().toISOString(),
      context: codeMentions || []
    });
  } catch (error) {
    console.error('Error calling Google Gemini API:', error);
    res.status(500).json({
      id: Date.now().toString(),
      type: 'assistant',
      content: 'Sorry, there was an error processing your request.',
      timestamp: new Date().toISOString(),
      context: codeMentions || []
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});





