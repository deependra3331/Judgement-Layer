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

// Reset loaders to loading skeleton
function resetLoaders() {
  const cards = ['panel-assumptions', 'panel-uncertainty', 'panel-context', 'panel-prompts'];
  cards.forEach(id => {
    const card = document.getElementById(id);
    card.classList.remove('panel-error'); // remove error classes
    card.querySelector('.skeleton-wrapper').style.display = 'flex';
    
    const bodyContent = card.querySelector('.analysis-list') || card.querySelector('.chips-container');
    bodyContent.style.display = 'none';
    bodyContent.innerHTML = '';
  });

  // Score section resets
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

  // Phase 2 Score Mock load (simulate score load in 3 seconds)
  simulateScoreLoad(output);
});

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

// Phase 2: Mock Score Loader
function simulateScoreLoad(output) {
  setTimeout(() => {
    document.querySelector('.score-skeleton').style.display = 'none';
    document.querySelector('.score-grid').style.display = 'flex';
    document.querySelector('.score-summary-bar').style.display = 'block';
    document.querySelector('.action-buttons-row').style.display = 'flex';

    // Set mock improvement outputs
    document.getElementById('improved-output-display').innerHTML = 
      output.replace(/(?:[0-9]{1,2}(?:\.[0-9]+)?%)/g, match => `<span class="highlight-add">${match} (verified)</span>`) + 
      '\n\n<span class="highlight-add">[Improved Output: Added balanced context for other regional viewpoints and expert citations.]</span>';
    
    document.getElementById('changes-list').innerHTML = `
      <li>Added verification badges for numerical assertions.</li>
      <li>Expanded perspective scope to include contrasting academic theories.</li>
    `;
  }, 3000);
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
