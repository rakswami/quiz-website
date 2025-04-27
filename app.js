// Sample question bank
const questionBank = {
  science: [
    {
      question: "What is the chemical symbol for water?",
      options: ["H2O", "CO2", "NaCl", "O2"],
      answer: "H2O",
      explanation: "Water is made of 2 hydrogen and 1 oxygen atom."
    },
    {
      question: "Which planet is closest to the sun?",
      options: ["Earth", "Venus", "Mercury", "Mars"],
      answer: "Mercury",
      explanation: "Mercury orbits closest to the sun in our solar system."
    }
  ],
  math: [
    {
      question: "What is 5 × 7?",
      options: ["25", "35", "30", "40"],
      answer: "35",
      explanation: "5 multiplied by 7 equals 35."
    }
  ]
};

function generateQuiz() {
  const topic = document.getElementById('topic').value.toLowerCase();
  const questions = questionBank[topic] || [];
  
  if (questions.length === 0) {
    alert(`No questions found for "${topic}". Try "Science" or "Math"!`);
    return;
  }
  
  displayQuiz({ questions });
}

function displayQuiz(quizData) {
  let html = '';
  quizData.questions.forEach((q, index) => {
    html += `
      <div class="question">
        <h3>${index + 1}. ${q.question}</h3>
        ${q.options.map(opt => `
          <label>
            <input type="radio" name="q${index}" value="${opt}">
            ${opt}
          </label><br>
        `).join('')}
        <div class="explanation" style="display:none">
          <strong>Answer:</strong> ${q.answer}<br>
          ${q.explanation}
        </div>
      </div>
    `;
  });
  
  html += `<button onclick="checkAnswers()">Check Answers</button>`;
  document.getElementById('quiz-area').innerHTML = html;
}

function checkAnswers() {
  document.querySelectorAll('.explanation').forEach(el => {
    el.style.display = 'block';
  });
}
