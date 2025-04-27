// Configuration
const API_KEY = "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"; // Replace with your actual key
const QUESTIONS_COUNT = 5; // Number of questions to generate
let currentQuestions = [];

// Main quiz generation function
async function generateQuiz() {
  const topic = document.getElementById('topic').value.trim();
  if (!topic) {
    showError("Please enter a topic!");
    return;
  }

  showLoading(topic);

  try {
    const questions = await fetchQuestions(topic);
    if (questions.length === 0) throw new Error("No questions generated");
    currentQuestions = questions;
    displayQuiz(questions);
  } catch (error) {
    showError(`Failed to generate quiz: ${error.message}`);
    console.error("Generation error:", error);
    useFallbackQuestions(topic);
  }
}

// Fetch questions from OpenAI API with proper error handling
async function fetchQuestions(topic) {
  try {
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
          content: `Generate ${QUESTIONS_COUNT} MCQs about ${topic}. Format as JSON: [{
            "question": "...",
            "options": ["a)...","b)...","c)...","d)..."],
            "answer": "a",
            "explanation": "..."
          }]`
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);

  } catch (apiError) {
    console.warn("API failed, using fallback:", apiError);
    return getFallbackQuestions(topic);
  }
}

// Local question bank fallback
function getFallbackQuestions(topic) {
  const fallback = {
    science: [
      {
        question: "What is the chemical symbol for gold?",
        options: ["a) Au", "b) Ag", "c) Pb", "d) Fe"],
        answer: "a",
        explanation: "Gold's symbol Au comes from 'Aurum'"
      }
    ],
    default: [
      {
        question: `Sample question about ${topic}`,
        options: ["a) Option 1", "b) Option 2", "c) Option 3", "d) Option 4"],
        answer: "a",
        explanation: "Sample explanation"
      }
    ]
  };
  return fallback[topic.toLowerCase()] || fallback.default;
}

// Display quiz questions
function displayQuiz(questions) {
  let html = `
    <div class="quiz-header">
      <h2>${document.getElementById('topic').value} Quiz</h2>
      <p>${questions.length} questions</p>
    </div>
  `;

  questions.forEach((q, i) => {
    html += `
      <div class="question" id="q${i}">
        <h3>${i+1}. ${q.question}</h3>
        <div class="options">
          ${q.options.map(opt => `
            <label class="option">
              <input type="radio" name="q${i}" value="${opt.charAt(0)}">
              ${opt}
            </label>
          `).join('')}
        </div>
        <div class="explanation">
          <p><strong>Answer:</strong> ${q.answer.toUpperCase()}</p>
          <p>${q.explanation}</p>
        </div>
      </div>
    `;
  });

  html += `
    <div class="quiz-actions">
      <button class="btn" onclick="checkAnswers()">Check Answers</button>
      <button class="btn btn-secondary" onclick="generateQuiz()">New Quiz</button>
    </div>
  `;

  document.getElementById('quiz-area').innerHTML = html;
}

// Check user answers
function checkAnswers() {
  let score = 0;
  
  currentQuestions.forEach((q, i) => {
    const questionEl = document.getElementById(`q${i}`);
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const explanation = questionEl.querySelector('.explanation');

    if (selected) {
      explanation.style.display = 'block';
      if (selected.value === q.answer) {
        questionEl.classList.add('correct');
        score++;
      } else {
        questionEl.classList.add('incorrect');
      }
    }
  });

  showResults(score);
}

// Helper functions
function showLoading(topic) {
  document.getElementById('quiz-area').innerHTML = `
    <div class="loading">
      <div class="spinner">⌛</div>
      <p>Generating ${topic} quiz...</p>
    </div>
  `;
}

function showError(message) {
  document.getElementById('quiz-area').innerHTML = `
    <div class="error">
      <p>${message}</p>
      <button class="btn" onclick="generateQuiz()">Try Again</button>
    </div>
  `;
}

function showResults(score) {
  const percentage = Math.round((score / currentQuestions.length) * 100);
  const resultHtml = `
    <div class="results">
      <h3>Your Score: ${score}/${currentQuestions.length} (${percentage}%)</h3>
      <p>${getFeedback(percentage)}</p>
    </div>
  `;
  document.getElementById('quiz-area').insertAdjacentHTML('beforeend', resultHtml);
}

function getFeedback(percentage) {
  if (percentage >= 80) return "🎉 Excellent! You're an expert!";
  if (percentage >= 60) return "👍 Good job!";
  if (percentage >= 40) return "🤔 Not bad!";
  return "📚 Keep learning!";
}

function useFallbackQuestions(topic) {
  const questions = getFallbackQuestions(topic);
  currentQuestions = questions;
  displayQuiz(questions);
}
