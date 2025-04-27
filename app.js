// Configuration
const API_KEY = "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"; // Replace with your actual key
const QUESTIONS_COUNT = 5;
let currentQuestions = [];

async function generateQuiz() {
  const topic = document.getElementById('topic').value.trim();
  if (!topic) {
    showError("Please enter a topic!");
    return;
  }

  showLoading(topic);

  try {
    const questions = await fetchAIQuestions(topic);
    if (questions.length === 0) throw new Error("No questions generated");
    currentQuestions = questions;
    displayQuiz(questions);
  } catch (error) {
    console.error("Generation error:", error);
    showError(`Failed to generate quiz. Try a different topic.`);
  }
}

async function fetchAIQuestions(topic) {
  // Unique prompt to prevent cached responses
  const prompt = `Generate ${QUESTIONS_COUNT} FRESH multiple-choice questions about ${topic} 
  as of ${new Date().toISOString()}. Format EXACTLY like this example:
  
  [{
    "question": "What is...?",
    "options": ["a) Option 1", "b) Option 2", "c) Option 3", "d) Option 4"],
    "answer": "a",
    "explanation": "Clear 1-sentence explanation"
  }]
  
  Rules:
  1. ALWAYS return valid JSON
  2. Questions MUST be unique
  3. Options should be plausible
  4. Never repeat questions`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.9, // Higher for more variety
      frequency_penalty: 0.7, // Reduces repetition
      presence_penalty: 0.7 // Encourages novelty
    })
  });

  const data = await response.json();
  let content;
  
  // Handle different response formats
  try {
    content = JSON.parse(data.choices[0].message.content);
  } catch {
    // Fallback for malformed JSON
    const match = data.choices[0].message.content.match(/\[.*\]/s);
    content = match ? JSON.parse(match[0]) : [];
  }
  
  return Array.isArray(content) ? content : [content];
}

function displayQuiz(questions) {
  let html = '';
  questions.forEach((q, i) => {
    html += `
      <div class="question">
        <h3>${i+1}. ${q.question}</h3>
        ${q.options.map(opt => `
          <label>
            <input type="radio" name="q${i}" value="${opt.charAt(0)}">
            ${opt}
          </label><br>
        `).join('')}
        <div class="explanation" style="display:none">
          <strong>Answer:</strong> ${q.answer.toUpperCase()}<br>
          ${q.explanation}
        </div>
      </div>
    `;
  });
  
  html += `
    <button onclick="checkAnswers()">Check Answers</button>
    <button onclick="generateQuiz()">New Quiz</button>
  `;
  
  document.getElementById('quiz-area').innerHTML = html;
}

// Helper functions remain the same as previous version
function checkAnswers() { /* ... */ }
function showLoading(topic) { /* ... */ }
function showError(message) { /* ... */ }
