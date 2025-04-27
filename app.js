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
      <div class="spinner">🌀</div>
      <p>Generating ${topic} quiz...</p>
    </div>
  `;

  try {
    const questions = await fetchAIQuestions(topic);
    currentQuestions = questions;
    displayQuiz(questions);
  } catch (error) {
    document.getElementById('quiz-area').innerHTML = `
      <p class="error">⚠️ Error: ${error.message}</p>
      <button onclick="generateQuiz()">Try Again</button>
    `;
  }
}

async function fetchAIQuestions(topic) {
  // Use a free proxy to avoid CORS issues
  const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  
  const response = await fetch(proxyUrl + apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_OPENAI_KEY" // ← Paste your key here
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Generate 5 unique multiple-choice questions about ${topic}. 
                 Format as JSON: [{
                  "question": "...",
                  "options": ["a) ...", "b) ...", "c) ...", "d) ..."],
                  "answer": "a",
                  "explanation": "..."
                 }]`
      }],
      temperature: 0.7
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
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
  
  html += `<button onclick="checkAnswers()">Check Answers</button>`;
  document.getElementById('quiz-area').innerHTML = html;
}

function checkAnswers() {
  currentQuestions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const explanation = document.querySelectorAll('.explanation')[i];
    
    if (selected) {
      explanation.style.display = 'block';
      if (selected.value === q.answer) {
        explanation.style.color = 'green';
      } else {
        explanation.style.color = 'red';
      }
    }
  });
}
