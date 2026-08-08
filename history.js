// history.js — Step 5: Round History screen

async function renderHistoryScreen() {
  const listEl = document.getElementById('history-list');
  const emptyEl = document.getElementById('history-empty');
  if (!listEl) return;

  listEl.innerHTML = '';
  const rounds = await getAllRounds();

  if (rounds.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  rounds.forEach((round) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'history-card';

    const toPar = round.scoreToPar;
    const toParLabel = toPar === 0 ? 'E' : toPar > 0 ? `+${toPar}` : `${toPar}`;
    const badgeClass = toPar > 0 ? 'badge-over' : 'badge-under-or-even';

    card.innerHTML = `
      <div class="history-card-main">
        <span class="history-card-course">${round.course}</span>
        <span class="history-card-meta">${round.date} · ${round.holeCount} holes</span>
      </div>
      <div class="history-card-score">
        <span class="history-score-total">${round.totalStrokes}</span>
        <span class="history-score-badge ${badgeClass}">${toParLabel}</span>
      </div>
    `;

    card.addEventListener('click', () => openPastRound(round.id));
    listEl.appendChild(card);
  });
}

async function openPastRound(id) {
  const round = await getRoundById(id);
  if (!round) return;

  // Swap screens
  document.getElementById('history-screen').classList.remove('active');
  document.getElementById('screen-summary').classList.add('active');

  // Update header
  document.getElementById('summary-course-name').textContent = round.course;

  // Hand off to the summary module
  if (typeof window.GolfTracker.initSummary === 'function') {
    window.GolfTracker.initSummary(round.course, round.holeCount, round.holes);
    
    // Hide the save button since we are viewing an already saved round
    const saveBtn = document.getElementById('save-round-btn');
    if (saveBtn) saveBtn.style.display = 'none';
  }
}