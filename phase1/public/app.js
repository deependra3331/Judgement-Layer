// --- State Management & Elements ---
const pages = {
  home: document.getElementById('page-home'),
  results: document.getElementById('page-results'),
  improve: document.getElementById('page-improve')
};

// Form & Buttons
const evalForm = document.getElementById('evaluation-form');
const btnEvaluate = document.getElementById('btn-evaluate');
const btnBackHome = document.getElementById('btn-back-home');
const btnBackResults = document.getElementById('btn-back-results');
const btnUseOutput = document.getElementById('btn-use-output');
const btnImproveOutput = document.getElementById('btn-improve-output');
const btnCopyOutput = document.getElementById('btn-copy-output');
const headerLogo = document.getElementById('header-logo');

// Settings Modal Elements
const settingsOpenBtn = document.getElementById('settings-open-btn');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsGroqKeyInput = document.getElementById('settings-groq-key');
const settingsGeminiKeyInput = document.getElementById('settings-gemini-key');
const settingsSaveBtn = document.getElementById('settings-save-btn');
const settingsClearBtn = document.getElementById('settings-clear-btn');

// Toast & Overlay
const toast = document.getElementById('toast');

// --- Navigation Function ---
function showPage(pageId) {
  Object.keys(pages).forEach(key => {
    if (key === pageId) {
      pages[key].classList.add('active');
    } else {
      pages[key].classList.remove('active');
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Logo click returns to home
headerLogo.addEventListener('click', () => {
  showPage('home');
});

// Back buttons
btnBackHome.addEventListener('click', () => {
  showPage('home');
});

btnBackResults.addEventListener('click', () => {
  showPage('results');
});

// Settings Modal Logic
settingsOpenBtn.addEventListener('click', () => {
  const savedGroqKey = localStorage.getItem('groq_api_key') || '';
  const savedGeminiKey = localStorage.getItem('gemini_api_key') || '';
  settingsGroqKeyInput.value = savedGroqKey;
  settingsGeminiKeyInput.value = savedGeminiKey;
  settingsModal.classList.add('active');
});

function closeSettings() {
  settingsModal.classList.remove('active');
}

settingsCloseBtn.addEventListener('click', closeSettings);
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) closeSettings();
});

settingsSaveBtn.addEventListener('click', () => {
  const groqKey = settingsGroqKeyInput.value.trim();
  const geminiKey = settingsGeminiKeyInput.value.trim();

  if (groqKey) {
    localStorage.setItem('groq_api_key', groqKey);
  } else {
    localStorage.removeItem('groq_api_key');
  }

  if (geminiKey) {
    localStorage.setItem('gemini_api_key', geminiKey);
  } else {
    localStorage.removeItem('gemini_api_key');
  }

  showToast('API Keys saved to browser storage!');
  closeSettings();
});

settingsClearBtn.addEventListener('click', () => {
  localStorage.removeItem('groq_api_key');
  localStorage.removeItem('gemini_api_key');
  settingsGroqKeyInput.value = '';
  settingsGeminiKeyInput.value = '';
  showToast('API Keys cleared.');
  closeSettings();
});

// Toast Helper
function showToast(message) {
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Expandable Critical Thinking Chips (Event delegation)
document.addEventListener('click', (e) => {
  const chipHeader = e.target.closest('.chip-header');
  if (chipHeader) {
    const card = chipHeader.closest('.chip-card');
    card.classList.toggle('expanded');
  }

  // Expandable Score Bars
  const scoreCard = e.target.closest('.score-bar-card');
  if (scoreCard) {
    scoreCard.classList.toggle('expanded');
  }
});

// Use Output Action
btnUseOutput.addEventListener('click', () => {
  showToast('Output accepted! Redirecting to dashboard...');
  setTimeout(() => {
    showPage('home');
    evalForm.reset();
  }, 1500);
});

// Improve Output Navigation (To Page 4)
btnImproveOutput.addEventListener('click', () => {
  showPage('improve');
});

// Copy Improved Output
btnCopyOutput.addEventListener('click', () => {
  const textToCopy = document.getElementById('improved-output-display').innerText;
  navigator.clipboard.writeText(textToCopy).then(() => {
    showToast('Copied improved output to clipboard!');
  }).catch(() => {
    showToast('Failed to copy output.');
  });
});

// --- Mock Evaluation (Phase 1 Sandbox) ---
evalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const output = document.getElementById('ai-output').value.trim();
  const prompt = document.getElementById('user-prompt').value.trim();
  const context = document.getElementById('context-type').value;

  if (!output) return;

  // Set active context tag
  document.getElementById('active-context-tag').innerText = context;
  
  // Navigate to results page
  showPage('results');
  
  // Set original output displays
  document.getElementById('original-output-display').innerText = output;

  // Reset Loaders to Loading State
  resetLoaders();

  // Simulate Progressive Loading of 4 Panels + Scores
  simulateProgressiveLoad(output, prompt);
});

function resetLoaders() {
  const cards = ['panel-assumptions', 'panel-uncertainty', 'panel-context', 'panel-prompts'];
  cards.forEach(id => {
    const card = document.getElementById(id);
    card.querySelector('.skeleton-wrapper').style.display = 'flex';
    const list = card.querySelector('.analysis-list') || card.querySelector('.chips-container');
    list.style.display = 'none';
    list.innerHTML = '';
  });

  // Score section resets
  document.querySelector('.score-skeleton').style.display = 'flex';
  document.querySelector('.score-grid').style.display = 'none';
  document.querySelector('.score-summary-bar').style.display = 'none';
  document.querySelector('.action-buttons-row').style.display = 'none';
}

function simulateProgressiveLoad(output, prompt) {
  // Panel 1: Assumptions (Loads in 600ms)
  setTimeout(() => {
    const list = document.querySelector('#panel-assumptions .analysis-list');
    list.innerHTML = `
      <li>
        <span class="tooltip-trigger">
          Assumed a formal academic tone was required
          <span class="tooltip-text">Why it matters: If you are writing a casual summary or blog post, this tone might feel overly stiff or inaccessible to your readers.</span>
        </span>
      </li>
      <li>
        <span class="tooltip-trigger">
          Assumed the event occurred in 2023
          <span class="tooltip-text">Why it matters: If the event actually took place in late 2022 or early 2024, the timeline and dependent analyses will be incorrect.</span>
        </span>
      </li>
      <li>
        <span class="tooltip-trigger">
          Assumed quantitative metrics are preferred over qualitative analysis
          <span class="tooltip-text">Why it matters: Skewing towards pure numbers can omit crucial human perspectives and cultural context.</span>
        </span>
      </li>
    `;
    document.querySelector('#panel-assumptions .skeleton-wrapper').style.display = 'none';
    list.style.display = 'flex';
  }, 600);

  // Panel 2: Uncertainty Flags (Loads in 1200ms)
  setTimeout(() => {
    const list = document.querySelector('#panel-uncertainty .analysis-list');
    list.innerHTML = `
      <li>
        <div class="flag-sentence">"The global market size expanded by exactly 14.2% in 2023..."</div>
        <div class="flag-reason">This statistic could not be verified — treat with caution.</div>
      </li>
      <li>
        <div class="flag-sentence">"Most experts agree that the transition will be completed by next year..."</div>
        <div class="flag-reason">Vague attribution ('most experts') and speculative timeline.</div>
      </li>
    `;
    document.querySelector('#panel-uncertainty .skeleton-wrapper').style.display = 'none';
    list.style.display = 'flex';
  }, 1200);

  // Panel 3: Missing Context (Loads in 1800ms)
  setTimeout(() => {
    const list = document.querySelector('#panel-context .analysis-list');
    list.innerHTML = `
      <li>
        <div class="gap-desc">No opposing viewpoint was presented</div>
        <div class="gap-suggest">Check arguments from researchers who disagree with this hypothesis to balance your perspective.</div>
      </li>
      <li>
        <div class="gap-desc">Regional or cultural context was not considered</div>
        <div class="gap-suggest">Determine how this policy impacts developing regions differently than developed nations.</div>
      </li>
    `;
    document.querySelector('#panel-context .skeleton-wrapper').style.display = 'none';
    list.style.display = 'flex';
  }, 1800);

  // Panel 4: Critical Thinking Prompts (Loads in 2400ms)
  setTimeout(() => {
    const container = document.querySelector('#panel-prompts .chips-container');
    container.innerHTML = `
      <div class="chip-card">
        <div class="chip-header">
          <span>Does this match what your professor taught?</span>
          <span class="chip-icon">▼</span>
        </div>
        <div class="chip-content">
          <p>Always align AI outputs with core lecture material. The AI might use a different framework or terminology than your course syllabus.</p>
        </div>
      </div>
      <div class="chip-card">
        <div class="chip-header">
          <span>Is there a perspective missing here?</span>
          <span class="chip-icon">▼</span>
        </div>
        <div class="chip-content">
          <p>AI often summarizes the dominant consensus. Look for minority viewpoints, local experiences, or historical exceptions.</p>
        </div>
      </div>
      <div class="chip-card">
        <div class="chip-header">
          <span>Would an expert in this field agree?</span>
          <span class="chip-icon">▼</span>
        </div>
        <div class="chip-content">
          <p>Review peer-reviewed journals. If the AI makes bold claims, check if those assertions are supported by recent scholarly consensus.</p>
        </div>
      </div>
    `;
    document.querySelector('#panel-prompts .skeleton-wrapper').style.display = 'none';
    container.style.display = 'flex';
  }, 2400);

  // Score Screen & CTAs (Loads in 3000ms)
  setTimeout(() => {
    document.querySelector('.score-skeleton').style.display = 'none';
    document.querySelector('.score-grid').style.display = 'flex';
    document.querySelector('.score-summary-bar').style.display = 'block';
    document.querySelector('.action-buttons-row').style.display = 'flex';

    // Populate Improve tab mock displays
    document.getElementById('improved-output-display').innerHTML = 
      output.replace(/14\.2%/g, '<span class="highlight-add">14.2% (verified via World Bank Report 2023)</span>') + 
      '\n\n<span class="highlight-add">[Added Context: From a developing nation perspective, the policy impacts local communities differently because of infrastructure limitations, a viewpoint missing in the initial output.]</span>';
    
    document.getElementById('changes-list').innerHTML = `
      <li>Added verification tag and reference link for the 14.2% statistic.</li>
      <li>Incorporated socio-economic context for developing economies to balance the global perspective.</li>
      <li>Softened speculative expert statements to represent scholarly nuance more accurately.</li>
    `;

  }, 3000);
}
