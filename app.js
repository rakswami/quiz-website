let currentQuestions = [];

async function generateQuiz() {
  const topic = document.getElementById('topic').value.trim();
  if (!topic) {
    alert("Please enter a topic!");
    return;
  }

  // Show loading
  document.getElementById('quiz-area').innerHTML = `
    <div class="loading">
      <div class="spinner">⌛</div>
      <p>Generating ${topic} quiz...</p>
    </div>
  `;

  try {
    const questions = await fetchAIQuestions(topic);
    currentQuestions = questions;
    displayQuiz(questions);
  } catch (error) {
    console.error("Quiz generation failed:", error);
    document.getElementById('quiz-area').innerHTML = `
      <div class="error">
        <p>⚠️ Failed to generate quiz. Possible reasons:</p>
        <ul>
          <li>API limit reached</li>
          <li>Network issue</li>
          <li>Invalid topic</li>
        </ul>
        <button onclick="generateQuiz()">Try Again</button>
        <button onclick="useSampleQuestions('${topic}')">Use Sample Questions</button>
      </div>
    `;
  }
}

async function fetchAIQuestions(topic) {
  // First try direct API call (works if no CORS issues)
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_OPENAI_KEY" // Replace with your actual key
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Generate 5 unique multiple-choice questions about ${topic}. 
                   Return ONLY valid JSON format like this example:
                   [{
                     "question": "What is...?",
                     "options": ["a) Option 1", "b) Option 2", "c) Option 3", "d) Option 4"],
                     "answer": "a",
                     "explanation": "Because..."
                   }]`
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Safely parse the JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse API response:", content);
      throw new Error("Received malformed questions from API");
    }
    
  } catch (directError) {
    console.log("Direct API call failed, trying fallback...");
    return getFallbackQuestions(topic);
  }
}

function getFallbackQuestions(topic) {
  // Local question bank fallback
  const fallbackQuestions = {
    science: [
      {
        question: "What is the chemical symbol for water?",
        options: ["a) H2O", "b) CO2", "c) NaCl", "d) O2"],
        answer: "a",
        explanation: "Water is composed of two hydrogen atoms and one oxygen atom."
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["a) Venus", "b) Mars", "c) Jupiter", "d) Saturn"],
        answer: "b",
        explanation: "Mars appears red due to iron oxide on its surface."
      }
    ],
    math: [
      {
        question: "What is 7 × 8?",
        options: ["a) 42", "b) 56", "c) 64", "d) 72"],
        answer: "b",
        explanation: "7 multiplied by 8 equals 56."
      }
    ],
    default: [
      {
        question: `Sample question about ${topic}`,
        options: ["a) Option 1", "b) Option 2", "c) Option 3", "d) Option 4"],
        answer: "a",
        explanation: "This is a sample explanation for the question."
      }
    ]
  };

  return fallbackQuestions[topic.toLowerCase()] || fallbackQuestions.default;
}

function useSampleQuestions(topic) {
  const questions = getFallbackQuestions(topic);
  currentQuestions = questions;
  displayQuiz(questions);
}

function displayQuiz(questions) {
  if (!questions || questions.length === 0) {
    document.getElementById('quiz-area').innerHTML = `
      <p class="error">No questions could be generated for this topic.</p>
      <button onclick="generateQuiz()">Try Again</button>
    `;
    return;
  }

  let html = `
    <div class="quiz-results">
      <h2>${document.getElementById('topic').value} Quiz</h2>
      <p>${questions.length} questions</p>
    </div>
  `;

  questions.forEach((q, i) => {
    html += `
      <div class="question" id="q${i}">
        <h3>${i + 1}. ${q.question}</h3>
        <div class="options">
          ${q.options.map(opt => `
            <label class="option">
              <input type="radio" name="q${i}" value="${opt.charAt(0)}">
              <span class="option-text">${opt}</span>
            </label>
          `).join('')}
        </div>
        <div class="explanation hidden">
          <p><strong>Correct Answer:</strong> ${q.answer.toUpperCase()}</p>
          <p>${q.explanation}</p>
        </div>
      </div>
    `;
  });

  html += `
    <div class="quiz-actions">
      <button class="submit-btn" onclick="checkAnswers()">Check Answers</button>
      <button class="new-quiz-btn" onclick="generateQuiz()">New Quiz</button>
    </div>
  `;

  document.getElementById('quiz-area').innerHTML = html;
}

function checkAnswers() {
  let score = 0;
  
  currentQuestions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const questionDiv = document.getElementById(`q${i}`);
    const explanation = questionDiv.querySelector('.explanation');
    
    if (explanation) {
      explanation.classList.remove('hidden');
      
      if (selected) {
        if (selected.value === q.answer) {
          questionDiv.classList.add('correct');
          score++;
        } else {
          questionDiv.classList.add('incorrect');
        }
      }
    }
  });

  // Display score
  const scorePercentage = Math.round((score / currentQuestions.length) * 100);
  document.getElementById('quiz-area').innerHTML += `
    <div class="score-display">
      <h3>Your Score: ${score}/${currentQuestions.length} (${scorePercentage}%)</h3>
      <p>${getFeedbackMessage(scorePercentage)}</p>
    </div>
  `;
}

function getFeedbackMessage(percentage) {
  if (percentage >= 80) return "🎉 Excellent work! You're a master!";
  if (percentage >= 60) return "👍 Good job! You know your stuff!";
  if (percentage >= 40) return "🤔 Not bad! Keep practicing!";
  return "📚 Keep learning! You'll improve!";
}
