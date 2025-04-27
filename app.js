// Dynamic Question Generator Engine
const questionTemplates = {
  general: [
    {
      template: "What is the primary function of {system} in {context}?",
      variables: {
        system: ["the circulatory system", "mitochondria", "the CPU", "a blockchain"],
        context: ["the human body", "cells", "computers", "cryptocurrency"]
      },
      options: [
        "a) {correct}",
        "b) {wrong1}",
        "c) {wrong2}",
        "d) {wrong3}"
      ],
      answers: {
        correct: ["Transporting blood", "Producing energy", "Processing instructions", "Recording transactions"],
        wrong1: ["Filtering air", "Storing DNA", "Displaying graphics", "Mining gold"],
        wrong2: ["Digesting food", "Creating proteins", "Storing memory", "Encrypting emails"],
        wrong3: ["Producing hormones", "Generating heat", "Connecting to WiFi", "Predicting weather"]
      }
    },
    {
      template: "Which historical figure is known for {achievement}?",
      variables: {
        achievement: [
          "inventing the telephone", 
          "discovering penicillin",
          "leading India's independence movement",
          "developing the theory of relativity"
        ]
      },
      options: [
        "a) {correct}",
        "b) {wrong1}",
        "c) {wrong2}",
        "d) {wrong3}"
      ],
      answers: {
        correct: ["Alexander Graham Bell", "Alexander Fleming", "Mahatma Gandhi", "Albert Einstein"],
        wrong1: ["Thomas Edison", "Marie Curie", "Winston Churchill", "Isaac Newton"],
        wrong2: ["Nikola Tesla", "Louis Pasteur", "Nelson Mandela", "Stephen Hawking"],
        wrong3: ["Guglielmo Marconi", "Joseph Lister", "Jawaharlal Nehru", "Niels Bohr"]
      }
    }
  ]
};

let currentQuestions = [];

function generateQuiz() {
  const topic = document.getElementById('topic').value.trim();
  if (!topic) {
    alert("Please enter a topic!");
    return;
  }

  // Generate dynamic questions
  const questions = [];
  const templatePool = [...questionTemplates.general];
  
  for (let i = 0; i < 5; i++) {
    if (templatePool.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * templatePool.length);
    const template = templatePool[randomIndex];
    templatePool.splice(randomIndex, 1); // Ensure uniqueness
    
    const question = generateQuestion(template, topic);
    questions.push(question);
  }

  currentQuestions = questions;
  displayQuiz(questions);
}

function generateQuestion(template, topic) {
  // Select random variables
  const selectedVars = {};
  Object.keys(template.variables).forEach(key => {
    const options = template.variables[key];
    selectedVars[key] = options[Math.floor(Math.random() * options.length)];
  });

  // Prepare answer options
  const answerKey = {};
  Object.keys(template.answers).forEach(key => {
    const options = template.answers[key];
    answerKey[key] = options[Math.floor(Math.random() * options.length)];
  });

  // Build question text
  let questionText = template.template;
  for (const [key, value] of Object.entries(selectedVars)) {
    questionText = questionText.replace(`{${key}}`, value);
  }

  // Build options
  const options = template.options.map(opt => {
    let optionText = opt;
    for (const [key, value] of Object.entries(answerKey)) {
      optionText = optionText.replace(`{${key}}`, value);
    }
    return optionText;
  });

  return {
    question: questionText,
    options: options,
    answer: "a", // First option is always correct in this template
    explanation: `This question relates to ${topic}. The correct answer is ${answerKey.correct} because...`
  };
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
    <button onclick="generateQuiz()">Generate New Quiz</button>
  `;
  
  document.getElementById('quiz-area').innerHTML = html;
}

function checkAnswers() {
  currentQuestions.forEach((q, i) => {
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
