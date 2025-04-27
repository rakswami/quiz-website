// Configuration
const OPENAI_MODEL = "gpt-3.5-turbo";  // Good balance of cost and performance
const QUESTIONS_PER_QUIZ = 5;           // Number of questions to generate

async function fetchQuestions(topic) {
    // Show loading state
    document.getElementById('quiz-area').innerHTML = `
        <div class="loading">
            <div class="spinner">⌛</div>
            <p>Creating your ${topic} quiz...</p>
            <p class="loading-note">This may take 10-20 seconds</p>
        </div>
    `;

    try {
        // In production, you should call your own backend/API route here
        // This example assumes you've set up a secure backend endpoint
        const response = await callOpenAIAPI(topic);
        
        if (!response.questions || response.questions.length === 0) {
            throw new Error("No questions were generated. Please try a different topic.");
        }
        
        return response;
    } catch (error) {
        console.error("API Error:", error);
        document.getElementById('quiz-area').innerHTML = `
            <div class="error">
                <p>⚠️ Couldn't generate questions about "${topic}"</p>
                <p>Possible reasons:</p>
                <ul>
                    <li>The topic might be too vague or complex</li>
                    <li>API limits reached (if using free tier)</li>
                    <li>Temporary service issue</li>
                </ul>
                <button onclick="generateQuiz()">Try Again</button>
            </div>
        `;
        throw error; // Re-throw for further handling if needed
    }
}

// This would call your secure backend in production
async function callOpenAIAPI(topic) {
    // IMPORTANT: In a real app, this should call YOUR backend, not directly use the API key
    // This is just for demonstration
    
    const apiKey = "sk-your-key-here"; // Never expose this in frontend code!
    const prompt = `
        Generate ${QUESTIONS_PER_QUIZ} multiple choice questions about "${topic}".
        For each question:
        - Provide a clear, self-contained question
        - Include 4 plausible options (labeled a-d)
        - Mark the correct answer (letter only)
        - Add a 1-2 sentence explanation
        
        Format as valid JSON:
        {
            "questions": [
                {
                    "question": "...",
                    "options": ["a) ...", "b) ...", "c) ...", "d) ..."],
                    "answer": "a",
                    "explanation": "..."
                }
            ]
        }
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,  // Balance between creativity and accuracy
            max_tokens: 2000   // Enough for several questions
        })
    });

    const data = await response.json();
    try {
        // Extract the JSON from OpenAI's response
        const content = data.choices[0].message.content;
        return JSON.parse(content);
    } catch (e) {
        console.error("Failed to parse response:", data);
        throw new Error("Received malformed questions from the API");
    }
}

// Enhanced display function
function displayQuiz(quizData) {
    let html = `
        <div class="quiz-header">
            <h2>${document.getElementById('topic').value} Quiz</h2>
            <p>${quizData.questions.length} questions</p>
        </div>
        <div class="questions-container">
    `;

    quizData.questions.forEach((q, index) => {
        html += `
            <div class="question" id="q${index}">
                <div class="question-text">${index + 1}. ${q.question}</div>
                <div class="options">
                    ${q.options.map(opt => `
                        <label class="option">
                            <input type="radio" name="q${index}" value="${opt.charAt(0)}">
                            <span class="option-text">${opt}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="explanation hidden">
                    <div class="answer">Correct answer: ${q.answer.toUpperCase()}</div>
                    <p>${q.explanation}</p>
                </div>
            </div>
        `;
    });

    html += `
        </div>
        <div class="quiz-actions">
            <button class="submit-btn" onclick="checkAnswers()">Check Answers</button>
            <button class="new-quiz-btn" onclick="location.reload()">New Quiz</button>
        </div>
    `;

    document.getElementById('quiz-area').innerHTML = html;
}

// Enhanced answer checking
function checkAnswers() {
    const questions = document.querySelectorAll('.question');
    let score = 0;
    
    questions.forEach((qEl, index) => {
        const selectedOption = qEl.querySelector('input[type="radio"]:checked');
        const explanation = qEl.querySelector('.explanation');
        explanation.classList.remove('hidden');
        
        if (selectedOption) {
            const questionData = /* ...get current question data... */;
            if (selectedOption.value.toLowerCase() === questionData.answer.toLowerCase()) {
                qEl.classList.add('correct');
                score++;
            } else {
                qEl.classList.add('incorrect');
            }
        }
    });
    
    // Show score
    document.getElementById('quiz-area').innerHTML += `
        <div class="results">
            <h3>Your Score: ${score}/${questions.length}</h3>
            <p>${getScoreComment(score, questions.length)}</p>
        </div>
    `;
}

function getScoreComment(score, total) {
    const percentage = score / total;
    if (percentage >= 0.8) return "🎉 Excellent work! You're an expert!";
    if (percentage >= 0.6) return "👍 Good job! You know quite a bit!";
    if (percentage >= 0.4) return "🤔 Not bad! Keep learning!";
    return "📚 Keep studying! You'll get better!";
}