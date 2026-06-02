// --- State Management & Elements ---
const pages = {
  home: document.getElementById('page-home'),
  results: document.getElementById('page-results'),
  improve: document.getElementById('page-improve')
};

// Global Analysis State to send to /api/improve
const analysisState = {
  output: '',
  prompt: '',
  context: '',
  assumptions: [],
  uncertainty: [],
  contextGaps: []
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
  showToast('Output accepted! Redirecting to home...');
  setTimeout(() => {
    showPage('home');
    evalForm.reset();
  }, 1500);
});

// Copy Improved Output
btnCopyOutput.addEventListener('click', () => {
  // Get text content without the HTML tags
  const textToCopy = document.getElementById('improved-output-display').innerText;
  navigator.clipboard.writeText(textToCopy).then(() => {
    showToast('Copied improved output to clipboard!');
  }).catch(() => {
    showToast('Failed to copy output.');
  });
});

// Reset loaders to loading skeleton
function resetLoaders() {
  const cards = ['panel-assumptions', 'panel-uncertainty', 'panel-context', 'panel-prompts'];
  cards.forEach(id => {
    const card = document.getElementById(id);
    card.classList.remove('panel-error');
    card.querySelector('.skeleton-wrapper').style.display = 'flex';
    
    const bodyContent = card.querySelector('.analysis-list') || card.querySelector('.chips-container');
    bodyContent.style.display = 'none';
    bodyContent.innerHTML = '';
  });

  // Score section resets
  const scoreCard = document.getElementById('score-section-card');
  scoreCard.classList.remove('panel-error');
  document.querySelector('.score-skeleton').style.display = 'flex';
  document.querySelector('.score-grid').style.display = 'none';
  document.querySelector('.score-summary-bar').style.display = 'none';
  document.querySelector('.action-buttons-row').style.display = 'none';
}

// Helper to show error inline in a panel card
function showPanelError(panelId, message) {
  const card = document.getElementById(panelId);
  card.classList.add('panel-error');
  card.querySelector('.skeleton-wrapper').style.display = 'none';
  
  const bodyContent = card.querySelector('.analysis-list') || card.querySelector('.chips-container');
  bodyContent.style.display = 'block';
  bodyContent.innerHTML = `<div class="error-text"><strong>Analysis failed:</strong><br>${message}</div>`;
}

// --- Form Submit and API orchestrator ---
evalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const output = document.getElementById('ai-output').value.trim();
  const prompt = document.getElementById('user-prompt').value.trim();
  const context = document.getElementById('context-type').value;
  const groqApiKey = localStorage.getItem('groq_api_key') || '';
  const geminiApiKey = localStorage.getItem('gemini_api_key') || '';

  if (!output) return;

  // Save in global state for improvement call
  analysisState.output = output;
  analysisState.prompt = prompt;
  analysisState.context = context;
  analysisState.assumptions = [];
  analysisState.uncertainty = [];
  analysisState.contextGaps = [];

  // Set active context tag
  document.getElementById('active-context-tag').innerText = context;
  
  // Navigate to results page
  showPage('results');
  
  // Set original output displays
  document.getElementById('original-output-display').innerText = output;

  // Reset UI loaders
  resetLoaders();

  // Prepare payload
  const payload = { output, prompt, context, groqApiKey, geminiApiKey };

  // Trigger concurrent API Requests (Progressive Loading)
  fetchAssumptions(payload);
  fetchUncertainty(payload);
  fetchContext(payload);
  fetchPrompts(payload);
  fetchScore(payload);
});

// Helper for score ratings
function getScoreUIProps(score) {
  const norm = (score || '').toLowerCase();
  if (norm === 'high') {
    return { percent: '100%', badgeClass: 'badge-high' };
  } else if (norm === 'medium' || norm === 'med') {
    return { percent: '65%', badgeClass: 'badge-medium' };
  } else {
    return { percent: '30%', badgeClass: 'badge-low' };
  }
}

// 1. Fetch Assumptions
async function fetchAssumptions(payload) {
  try {
    const response = await fetch('/api/analyze/assumptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || 'Server error');
    
    analysisState.assumptions = data; // store state
    
    const list = document.querySelector('#panel-assumptions .analysis-list');
    list.innerHTML = data.map(item => `
      <li>
        <span class="tooltip-trigger">
          ${escapeHtml(item.assumption)}
          <span class="tooltip-text">${escapeHtml(item.why_it_matters)}</span>
        </span>
      </li>
    `).join('');
    
    document.querySelector('#panel-assumptions .skeleton-wrapper').style.display = 'none';
    list.style.display = 'flex';
  } catch (err) {
    showPanelError('panel-assumptions', err.message);
  }
}

// 2. Fetch Uncertainty Flags
async function fetchUncertainty(payload) {
  try {
    const response = await fetch('/api/analyze/uncertainty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || 'Server error');
    
    analysisState.uncertainty = data; // store state
    
    const list = document.querySelector('#panel-uncertainty .analysis-list');
    list.innerHTML = data.map(item => `
      <li>
        <div class="flag-sentence">"${escapeHtml(item.sentence)}"</div>
        <div class="flag-reason">${escapeHtml(item.reason)}</div>
      </li>
    `).join('');
    
    document.querySelector('#panel-uncertainty .skeleton-wrapper').style.display = 'none';
    list.style.display = 'flex';
  } catch (err) {
    showPanelError('panel-uncertainty', err.message);
  }
}

// 3. Fetch Missing Context
async function fetchContext(payload) {
  try {
    const response = await fetch('/api/analyze/context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || 'Server error');
    
    analysisState.contextGaps = data; // store state
    
    const list = document.querySelector('#panel-context .analysis-list');
    list.innerHTML = data.map(item => `
      <li>
        <div class="gap-desc">${escapeHtml(item.gap)}</div>
        <div class="gap-suggest">${escapeHtml(item.how_to_fill)}</div>
      </li>
    `).join('');
    
    document.querySelector('#panel-context .skeleton-wrapper').style.display = 'none';
    list.style.display = 'flex';
  } catch (err) {
    showPanelError('panel-context', err.message);
  }
}

// 4. Fetch Critical Thinking Prompts
async function fetchPrompts(payload) {
  try {
    const response = await fetch('/api/analyze/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || 'Server error');
    
    const container = document.querySelector('#panel-prompts .chips-container');
    container.innerHTML = data.map(item => `
      <div class="chip-card">
        <div class="chip-header">
          <span>${escapeHtml(item.question)}</span>
          <span class="chip-icon">▼</span>
        </div>
        <div class="chip-content">
          <p>${escapeHtml(item.explanation)}</p>
        </div>
      </div>
    `).join('');
    
    document.querySelector('#panel-prompts .skeleton-wrapper').style.display = 'none';
    container.style.display = 'flex';
  } catch (err) {
    showPanelError('panel-prompts', err.message);
  }
}

// 5. Fetch Judgment score breakdown
async function fetchScore(payload) {
  try {
    const response = await fetch('/api/analyze/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || 'Server error');

    // Reasoning
    const reasoningProps = getScoreUIProps(data.reasoning.score);
    document.getElementById('score-val-reasoning').innerText = data.reasoning.score;
    document.getElementById('score-val-reasoning').className = `score-value ${reasoningProps.badgeClass}`;
    document.getElementById('fill-reasoning').style.width = reasoningProps.percent;
    document.getElementById('explain-reasoning').innerText = data.reasoning.explanation;

    // Completeness
    const completenessProps = getScoreUIProps(data.completeness.score);
    document.getElementById('score-val-completeness').innerText = data.completeness.score;
    document.getElementById('score-val-completeness').className = `score-value ${completenessProps.badgeClass}`;
    document.getElementById('fill-completeness').style.width = completenessProps.percent;
    document.getElementById('explain-completeness').innerText = data.completeness.explanation;

    // Factual Confidence
    const factualProps = getScoreUIProps(data.factual_confidence.score);
    document.getElementById('score-val-factual').innerText = data.factual_confidence.score;
    document.getElementById('score-val-factual').className = `score-value ${factualProps.badgeClass}`;
    document.getElementById('fill-factual').style.width = factualProps.percent;
    document.getElementById('explain-factual').innerText = data.factual_confidence.explanation;

    // Usefulness
    const usefulnessProps = getScoreUIProps(data.usefulness.score);
    document.getElementById('score-val-usefulness').innerText = data.usefulness.score;
    document.getElementById('score-val-usefulness').className = `score-value ${usefulnessProps.badgeClass}`;
    document.getElementById('fill-usefulness').style.width = usefulnessProps.percent;
    document.getElementById('explain-usefulness').innerText = data.usefulness.explanation;

    // Summary text
    document.getElementById('score-summary-text').innerText = data.summary;

    // Toggle displays
    document.querySelector('.score-skeleton').style.display = 'none';
    document.querySelector('.score-grid').style.display = 'flex';
    document.querySelector('.score-summary-bar').style.display = 'block';
    document.querySelector('.action-buttons-row').style.display = 'flex';

  } catch (err) {
    const card = document.getElementById('score-section-card');
    card.classList.add('panel-error');
    document.querySelector('.score-skeleton').style.display = 'none';
    document.querySelector('.score-grid').style.display = 'none';
    document.querySelector('.score-summary-bar').style.display = 'block';
    document.getElementById('score-summary-text').innerHTML = `<span class="error-text" style="display:block"><strong>Score calculation failed:</strong><br>${err.message}</span>`;
  }
}

// --- Phase 4: Improve Output Interaction ---
btnImproveOutput.addEventListener('click', () => {
  showPage('improve');
  
  // Set up loading view
  const improvedDisplay = document.getElementById('improved-output-display');
  const changesList = document.getElementById('changes-list');
  
  improvedDisplay.innerHTML = `
    <div class="skeleton-wrapper">
      <div class="skeleton-line" style="width: 100%"></div>
      <div class="skeleton-line" style="width: 90%"></div>
      <div class="skeleton-line" style="width: 95%"></div>
      <div class="skeleton-line" style="width: 80%"></div>
      <div class="skeleton-line" style="width: 85%"></div>
    </div>
  `;
  changesList.innerHTML = `
    <div class="skeleton-wrapper" style="gap:0.5rem">
      <div class="skeleton-line" style="width: 70%; height:12px"></div>
      <div class="skeleton-line" style="width: 50%; height:12px"></div>
    </div>
  `;
  
  btnCopyOutput.disabled = true;

  fetchImprovedOutput();
});

async function fetchImprovedOutput() {
  try {
    const groqApiKey = localStorage.getItem('groq_api_key') || '';
    const geminiApiKey = localStorage.getItem('gemini_api_key') || '';
    const payload = {
      output: analysisState.output,
      prompt: analysisState.prompt,
      context: analysisState.context,
      assumptions: analysisState.assumptions,
      uncertainty: analysisState.uncertainty,
      contextGaps: analysisState.contextGaps,
      groqApiKey,
      geminiApiKey
    };

    const response = await fetch('/api/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || 'Server error');

    // Parse double asterisks to green highlights
    const rawImprovedText = data.improved_output;
    // Replace **text** with <span class="highlight-add">text</span>
    const highlightedText = escapeHtml(rawImprovedText)
      .replace(/\*\*(.*?)\*\*/g, '<span class="highlight-add">$1</span>');

    document.getElementById('improved-output-display').innerHTML = highlightedText;

    // Render list of improvements
    const changesList = document.getElementById('changes-list');
    changesList.innerHTML = data.changes.map(item => `
      <li><strong>${escapeHtml(item.change)}:</strong> ${escapeHtml(item.reason)}</li>
    `).join('');

    btnCopyOutput.disabled = false;
  } catch (err) {
    document.getElementById('improved-output-display').innerHTML = `
      <div class="error-text">
        <strong>Failed to improve output:</strong><br>${err.message}
      </div>
    `;
    document.getElementById('changes-list').innerHTML = `
      <li style="color:var(--amber-600)">Could not retrieve improvements due to server error.</li>
    `;
    btnCopyOutput.disabled = true;
  }
}

// HTML Escaping Helper to prevent injection
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
