let currentQuiz = [];

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
    // Use direct API call (for testing)
    const questions = await fetchQuestions(topic);
    currentQuiz = questions;
    displayQuiz(questions);
  } catch (error) {
    console.error("Error:", error);
    document.getElementById('quiz-area').innerHTML = `
      <div class="error">
        <p>⚠️ Failed to generate quiz. Try a different topic.</p>
        <button onclick="generateQuiz()">Try Again</button>
      </div>
    `;
  }
}

// Modified fetch function
async function fetchQuestions(topic) {
  // Fallback questions if API fails
  const fallback = [
    {
      question: `What is the most interesting fact about ${topic}?`,
      options: [
        "a) It's fascinating",
        "b) It's complex", 
        "c) It's widely studied",
        "d) All of the above"
      ],
      answer: "d",
      explanation: `${topic} is a fascinating subject with many aspects.`
    }
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY' // Replace this
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Generate 3 multiple-choice questions about ${topic} with 4 options each, correct answers, and explanations. Return as valid JSON.`
        }],
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) || fallback;
  } catch {
    return fallback; // Use fallback if API fails
  }
}

// Rest of your existing displayQuiz and checkAnswers functions
