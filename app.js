// --- State ---
const pages = {
  home: document.getElementById('page-home'),
  results: document.getElementById('page-results'),
  improve: document.getElementById('page-improve')
};

const analysisState = {
  output: '',
  prompt: '',
  context: '',
  assumptions: [],
  uncertainty: [],
  contextGaps: []
};

// --- Element References ---
const evalForm = document.getElementById('evaluation-form');
const btnBackHome = document.getElementById('btn-back-home');
const btnBackResults = document.getElementById('btn-back-results');
const btnUseOutput = document.getElementById('btn-use-output');
const btnImproveOutput = document.getElementById('btn-improve-output');
const btnCopyOutput = document.getElementById('btn-copy-output');

const settingsOpenBtn = document.getElementById('settings-open-btn');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsGroqKeyInput = document.getElementById('settings-groq-key');
const settingsGeminiKeyInput = document.getElementById('settings-gemini-key');
const settingsSaveBtn = document.getElementById('settings-save-btn');
const settingsClearBtn = document.getElementById('settings-clear-btn');
const toast = document.getElementById('toast');

// --- Navigation ---
function showPage(pageId) {
  Object.keys(pages).forEach(key => {
    pages[key].classList.toggle('active', key === pageId);
  });
}

// --- Back Buttons ---
btnBackHome.addEventListener('click', () => showPage('home'));
btnBackResults.addEventListener('click', () => showPage('results'));

// --- Settings ---
settingsOpenBtn.addEventListener('click', () => {
  settingsGroqKeyInput.value = localStorage.getItem('groq_api_key') || '';
  settingsGeminiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
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
  groqKey ? localStorage.setItem('groq_api_key', groqKey) : localStorage.removeItem('groq_api_key');
  geminiKey ? localStorage.setItem('gemini_api_key', geminiKey) : localStorage.removeItem('gemini_api_key');
  showToast('API Keys saved!');
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

// --- Toast ---
function showToast(message) {
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// --- Use Output ---
btnUseOutput.addEventListener('click', () => {
  showToast('Output accepted!');
  setTimeout(() => {
    showPage('home');
    evalForm.reset();
  }, 1200);
});

// --- Copy Improved Output ---
btnCopyOutput.addEventListener('click', () => {
  const text = document.getElementById('improved-output-display').innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy.');
  });
});

// --- Question Chip Toggle (event delegation) ---
document.addEventListener('click', (e) => {
  const chip = e.target.closest('.question-chip');
  if (chip) chip.classList.toggle('expanded');
});

// --- Insight counter ---
let totalInsights = 0;

function updateInsightBadge() {
  document.getElementById('insight-count').innerText = totalInsights;
}

// --- Reset sections to loading state ---
function resetSections() {
  totalInsights = 0;
  updateInsightBadge();

  ['sec-assumptions', 'sec-verify', 'sec-think'].forEach(id => {
    const el = document.getElementById(id);
    const shimmerCount = id === 'sec-think' ? 3 : 2;
    el.innerHTML = `<div class="loading-placeholder">${
      Array.from({ length: shimmerCount }, (_, i) => {
        const w = [100, 80, 70][i] || 80;
        return `<div class="shimmer-line w${w}"></div>`;
      }).join('')
    }</div>`;
  });
}

// --- Form Submit ---
evalForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const output = document.getElementById('ai-output').value.trim();
  const prompt = document.getElementById('user-prompt').value.trim();
  const context = document.getElementById('context-type').value;
  const groqApiKey = localStorage.getItem('groq_api_key') || '';
  const geminiApiKey = localStorage.getItem('gemini_api_key') || '';

  if (!output) return;

  analysisState.output = output;
  analysisState.prompt = prompt;
  analysisState.context = context;
  analysisState.assumptions = [];
  analysisState.uncertainty = [];
  analysisState.contextGaps = [];

  // Set preview text
  document.getElementById('output-preview-text').innerText = output;
  document.getElementById('original-output-display').innerText = output;

  showPage('results');
  resetSections();

  const payload = { output, prompt, context, groqApiKey, geminiApiKey };

  // Fire concurrent API calls
  fetchAssumptions(payload);
  fetchUncertainty(payload);
  fetchPrompts(payload);
});

// --- API: Assumptions ---
async function fetchAssumptions(payload) {
  try {
    const res = await fetch('/api/analyze/assumptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Server error');

    analysisState.assumptions = data;
    const items = Array.isArray(data) ? data.slice(0, 2) : [];
    totalInsights += items.length;
    updateInsightBadge();

    const container = document.getElementById('sec-assumptions');
    container.innerHTML = items.map(item =>
      `<div class="assume-card">${escapeHtml(item.assumption || item.text || JSON.stringify(item))}</div>`
    ).join('');
  } catch (err) {
    document.getElementById('sec-assumptions').innerHTML =
      `<div class="error-text"><strong>Failed:</strong> ${err.message}</div>`;
  }
}

// --- API: Uncertainty ---
async function fetchUncertainty(payload) {
  try {
    const res = await fetch('/api/analyze/uncertainty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Server error');

    analysisState.uncertainty = data;
    const item = Array.isArray(data) ? data[0] : (typeof data === 'object' ? data : null);
    if (item) {
      totalInsights += 1;
      updateInsightBadge();
    }

    const container = document.getElementById('sec-verify');
    if (item) {
      container.innerHTML = `
        <div class="verify-card">
          <div class="verify-sentence">"${escapeHtml(item.sentence || '')}"</div>
          <div class="verify-reason">${escapeHtml(item.reason || '')}</div>
        </div>`;
    } else {
      container.innerHTML = `<div class="verify-card">No uncertainty flags detected.</div>`;
    }
  } catch (err) {
    document.getElementById('sec-verify').innerHTML =
      `<div class="error-text"><strong>Failed:</strong> ${err.message}</div>`;
  }
}

// --- API: Questions ---
async function fetchPrompts(payload) {
  try {
    const res = await fetch('/api/analyze/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Server error');

    const items = Array.isArray(data) ? data.slice(0, 3) : [];
    totalInsights += items.length;
    updateInsightBadge();

    const container = document.getElementById('sec-think');
    container.innerHTML = items.map(item =>
      `<button class="question-chip" type="button">
        ${escapeHtml(item.question || '')}
        <div class="chip-answer">${escapeHtml(item.explanation || '')}</div>
      </button>`
    ).join('');
  } catch (err) {
    document.getElementById('sec-think').innerHTML =
      `<div class="error-text"><strong>Failed:</strong> ${err.message}</div>`;
  }
}

// --- Improve Output ---
btnImproveOutput.addEventListener('click', () => {
  showPage('improve');

  const improvedDisplay = document.getElementById('improved-output-display');
  const changesList = document.getElementById('changes-list');

  improvedDisplay.innerHTML = `<div class="loading-placeholder">
    <div class="shimmer-line w100"></div>
    <div class="shimmer-line w90"></div>
    <div class="shimmer-line w80"></div>
    <div class="shimmer-line w100"></div>
  </div>`;
  changesList.innerHTML = `<div class="loading-placeholder">
    <div class="shimmer-line w80"></div>
    <div class="shimmer-line w70"></div>
  </div>`;

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

    const res = await fetch('/api/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Server error');

    const highlighted = escapeHtml(data.improved_output)
      .replace(/\*\*(.*?)\*\*/g, '<span class="highlight-add">$1</span>');
    document.getElementById('improved-output-display').innerHTML = highlighted;

    document.getElementById('changes-list').innerHTML = data.changes.map(item =>
      `<li><strong>${escapeHtml(item.change)}:</strong> ${escapeHtml(item.reason)}</li>`
    ).join('');

    btnCopyOutput.disabled = false;
  } catch (err) {
    document.getElementById('improved-output-display').innerHTML =
      `<div class="error-text"><strong>Failed to improve output:</strong><br>${err.message}</div>`;
    document.getElementById('changes-list').innerHTML =
      `<li class="error-text">Could not retrieve improvements.</li>`;
    btnCopyOutput.disabled = true;
  }
}

// --- Utilities ---
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
