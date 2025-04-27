let currentQuiz = [];

async function generateQuiz() {
    const topic = document.getElementById('topic').value.trim();
    if (!topic) {
        alert("Please enter a topic!");
        return;
    }

    document.getElementById('quiz-area').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Generating ${topic} quiz...</p>
        </div>
    `;

    try {
        const questions = await fetchAIQuestions(topic);
        currentQuiz = questions;
        renderQuiz(questions);
    } catch (error) {
        document.getElementById('quiz-area').innerHTML = `
            <div class="error">
                <p>⚠️ Failed to generate quiz. Please try again.</p>
                <button onclick="generateQuiz()">Retry</button>
            </div>
        `;
        console.error("Error:", error);
    }
}

async function fetchAIQuestions(topic) {
    const response = await fetch('/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
    });
    return await response.json();
}

function renderQuiz(questions) {
    let html = '';
    questions.forEach((q, i) => {
        html += `
            <div class="question" id="q${i}">
                <h3>${i+1}. ${q.question}</h3>
                ${q.options.map(opt => `
                    <label>
                        <input type="radio" name="q${i}" value="${opt.charAt(0)}">
                        ${opt}
                    </label><br>
                `).join('')}
                <div class="explanation">
                    <p><strong>Answer:</strong> ${q.answer.toUpperCase()}</p>
                    <p>${q.explanation}</p>
                </div>
            </div>
        `;
    });
    
    html += `<button onclick="checkAnswers()">Check Answers</button>`;
    document.getElementById('quiz-area').innerHTML = html;
}

function checkAnswers() {
    currentQuiz.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        const explanation = document.querySelectorAll('.explanation')[i];
        
        if (selected) {
            explanation.style.display = 'block';
            if (selected.value === q.answer) {
                explanation.style.backgroundColor = '#e6ffe6';
            } else {
                explanation.style.backgroundColor = '#ffe6e6';
            }
        }
    });
}
