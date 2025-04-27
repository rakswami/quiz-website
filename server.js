require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

app.post('/generate-quiz', async (req, res) => {
  try {
    const { topic } = req.body;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Generate 5 unique MCQs about ${topic} in this exact JSON format:
        [{
          "question": "...",
          "options": ["a)...", "b)...", "c)...", "d)..."],
          "answer": "a",
          "explanation": "..."
        }]`
      }],
      temperature: 0.7
    });

    const quiz = JSON.parse(response.choices[0].message.content);
    res.json(quiz);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
