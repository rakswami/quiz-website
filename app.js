// Science Question Generator Engine
const scienceQuestionBank = {
  elements: {
    template: "What is the chemical symbol for {element}?",
    elements: ["Oxygen", "Hydrogen", "Carbon", "Nitrogen", "Sodium", "Gold", "Silver", "Iron"],
    symbols: ["O", "H", "C", "N", "Na", "Au", "Ag", "Fe"],
    distractors: ["He", "Ne", "Ca", "K", "Mg", "Cu", "Zn", "Pb"]
  },
  physics: {
    template: "What is the unit of {measurement}?",
    measurements: ["force", "energy", "power", "electric current"],
    units: ["Newton (N)", "Joule (J)", "Watt (W)", "Ampere (A)"],
    distractors: ["Pascal (Pa)", "Volt (V)", "Ohm (Ω)", "Hertz (Hz)"]
  },
  biology: {
    template: "Which organelle is responsible for {function}?",
    functions: ["energy production", "protein synthesis", "cellular digestion", "photosynthesis"],
    organelles: ["mitochondria", "ribosomes", "lysosomes", "chloroplasts"],
    distractors: ["nucleus", "golgi apparatus", "vacuole", "endoplasmic reticulum"]
  }
};

let currentQuestions = [];

function generateQuiz() {
  const topic = "science"; // Force science questions
  const questions = [];
  
  // Generate 5 questions from different categories
  const categories = Object.keys(scienceQuestionBank);
  for (let i = 0; i < 5; i++) {
    const category = categories[i % categories.length]; // Cycle through categories
    questions.push(generateScienceQuestion(category));
  }

  currentQuestions = questions;
  displayQuiz(questions);
}

function generateScienceQuestion(category) {
  const bank = scienceQuestionBank[category];
  const index = Math.floor(Math.random() * bank.elements.length);
  
  // Get correct answer and distractors
  const correct = category === 'elements' 
    ? bank.symbols[index] 
    : category === 'physics' 
      ? bank.units[index] 
      : bank.organelles[index];
  
  const questionText = bank.template.replace(
    `{${category === 'elements' ? 'element' : category === 'physics' ? 'measurement' : 'function'}}`,
    category === 'elements' 
      ? bank.elements[index] 
      : category === 'physics' 
        ? bank.measurements[index] 
        : bank.functions[index]
  );

  // Prepare options
  const options = [];
  options.push(`a) ${correct}`);
  
  // Add 3 unique distractors
  const usedIndices = new Set();
  while (options.length < 4) {
    const randomIndex = Math.floor(Math.random() * bank.distractors.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      options.push(
        `${String.fromCharCode(98 + options.length - 1)}) ${bank.distractors[randomIndex]}`
      );
    }
  }

  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  // Find new index of correct answer
  const correctOption = options.findIndex(opt => opt.includes(correct));
  const answer = String.fromCharCode(97 + correctOption);

  return {
    question: questionText,
    options: options,
    answer: answer,
    explanation: `The correct answer is ${correct}. ${getExplanation(category, index)}`
  };
}

function getExplanation(category, index) {
  const explanations = {
    elements: [
      "Oxygen is essential for respiration.",
      "Hydrogen is the lightest element.",
      "Carbon is the basis of organic chemistry.",
      "Nitrogen makes up 78% of Earth's atmosphere.",
      "Sodium is a highly reactive alkali metal.",
      "Gold has been valued since ancient times.",
      "Silver has the highest electrical conductivity.",
      "Iron is crucial for hemoglobin in blood."
    ],
    physics: [
      "Force is measured in Newtons (F=ma).",
      "Energy is measured in Joules (work done).",
      "Power is the rate of energy transfer.",
      "Current is the flow of electric charge."
    ],
    biology: [
      "Mitochondria are the powerhouse of the cell.",
      "Ribosomes synthesize proteins from amino acids.",
      "Lysosomes break down waste materials.",
      "Chloroplasts convert light energy to chemical energy."
    ]
  };
  return explanations[category][index];
}

// Rest of your existing displayQuiz and checkAnswers functions remain the same
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
