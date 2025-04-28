let currentQuiz = [];

async function generateQuiz() {
  const topic = document.getElementById('topic').value.trim();
  if (!topic) {
    alert("Please enter a topic!");
    return;
  }

  // Show loading message
  document.getElementById('quiz-area').innerHTML = `
    <div style="text-align:center; padding:20px;">
      <div style="font-size:24px;">⌛</div>
      <p>Creating your ${topic} quiz...</p>
    </div>
  `;

  try {
    // Try local questions first (works without API)
    const questions = getLocalQuestions(topic);
    currentQuiz = questions;
    showQuiz(questions);
    
    // Uncomment this if you have API key (remove /* and */)
    /*
    const apiQuestions = await fetchApiQuestions(topic);
    currentQuiz = apiQuestions;
    showQuiz(apiQuestions);
    */
    
  } catch (error) {
    document.getElementById('quiz-area').innerHTML = `
      <div style="color:red; padding:20px;">
        <p>Here's a sample question:</p>
        ${showQuiz(getLocalQuestions(topic))}
      </div>
    `;
  }
}

// Local question bank (works without internet)
function getLocalQuestions(topic) {
  return [
    {
      question: `What is 2 + 2? (About ${topic})`,
      options: ["a) 3", "b) 4", "c) 5", "d) 6"],
      answer: "b",
      explanation: "Basic math tells us 2 + 2 = 4"
    },
    {
      question: `What comes after 3? (${topic} version)`,
      options: ["a) 1", "b) 2", "c) 4", "d) 5"],
      answer: "c",
      explanation: "The number sequence continues as 1, 2, 3, 4..."
    }
  ];
}

// API function (only needed if you have OpenAI key)
async function fetchApiQuestions(topic) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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
' // ← Replace this
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Generate 2 multiple-choice questions about ${topic} with 4 options, answers, and explanations`
      }]
    })
  });
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

function showQuiz(questions) {
  let html = '';
  questions.forEach((q, i) => {
    html += `
      <div style="margin:20px; padding:15px; background:#f5f5f5; border-radius:8px;">
        <h3>${i+1}. ${q.question}</h3>
        ${q.options.map(opt => `
          <div style="margin:5px;">
            <input type="radio" name="q${i}" value="${opt.charAt(0)}">
            <label>${opt}</label>
          </div>
        `).join('')}
        <div class="explanation" style="display:none; margin-top:10px; padding:10px; background:#e0e0e0;">
          <strong>Answer:</strong> ${q.answer.toUpperCase()}<br>
          ${q.explanation}
        </div>
      </div>
    `;
  });
  
  html += `<button onclick="checkAnswers()" style="margin:10px; padding:8px 15px; background:#4CAF50; color:white; border:none; border-radius:4px;">Check Answers</button>`;
  
  document.getElementById('quiz-area').innerHTML = html;
}

function checkAnswers() {
  currentQuiz.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const explanation = document.querySelectorAll('.explanation')[i];
    if (selected && explanation) {
      explanation.style.display = 'block';
      explanation.style.color = selected.value === q.answer ? 'green' : 'red';
    }
  });
}
