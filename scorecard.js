// scorecard.js — Step 2: Live Scorecard Interface + Step 3: Photo Capture
// In-memory state only. IndexedDB persistence arrives in Step 5.
// Photos are captured via the native camera (input[type=file][capture])
// and held as data URLs in memory — no upload, no disk write yet.

(function () {
  const CLUBS = [
    'Driver', '3 Wood', '5 Wood', 'Hybrid',
    '3 Iron', '4 Iron', '5 Iron', '6 Iron',
    '7 Iron', '8 Iron', '9 Iron',
    'Pitching Wedge', 'Gap Wedge', 'Sand Wedge', 'Lob Wedge',
    'Putter'
  ];

  const DIRECTIONS = ['Slice', 'Fade', 'Straight', 'Draw', 'Hook'];

  const PAR_MIN = 3, PAR_MAX = 6;
  const STROKES_MIN = 1, STROKES_MAX = 15;

  let holes = [];       // holeCount hole objects (9 or 18)
  let holeCount = 18;   // set by course-selection toggle in Step 1
  let currentHole = 1;  // 1-indexed
  let courseName = '';

  function freshHoles(count) {
    return Array.from({ length: count }, (_, i) => ({
      number: i + 1,
      par: 4,
      strokes: null,
      club: null,
      direction: null,
      photo: null // wired up in Step 3
    }));
  }

  function scoreLabel(hole) {
    if (hole.strokes == null) return null;
    const diff = hole.strokes - hole.par;
    if (diff <= -2) return { text: 'Eagle or better', cls: 'birdie' };
    if (diff === -1) return { text: 'Birdie', cls: 'birdie' };
    if (diff === 0) return { text: 'Par', cls: '' };
    if (diff === 1) return { text: 'Bogey', cls: 'bogey' };
    return { text: `+${diff} (Double Bogey or worse)`, cls: 'bogey' };
  }

  function render() {
    const root = document.getElementById('scorecard-main');
    const hole = holes[currentHole - 1];
    const filledCount = holes.filter(h => h.strokes != null).length;

    root.innerHTML = `
      <div class="hole-nav">
        <button type="button" class="hole-nav-btn" id="hole-prev-btn" ${currentHole === 1 ? 'disabled' : ''} aria-label="Previous hole">&#8592;</button>
        <div class="hole-nav-center">
          <div class="hole-label">Hole</div>
          <div class="hole-number">${hole.number} / ${holeCount}</div>
        </div>
        <button type="button" class="hole-nav-btn" id="hole-next-btn" ${currentHole === holeCount ? 'disabled' : ''} aria-label="Next hole">&#8594;</button>
      </div>

      <div class="hole-strip" id="hole-strip"></div>

      <div class="sc-card">
        <p class="sc-card-title">Par</p>
        <div class="stepper-row">
          <button type="button" class="stepper-btn" id="par-minus" aria-label="Decrease par">&minus;</button>
          <div class="stepper-value" id="par-value">${hole.par}</div>
          <button type="button" class="stepper-btn" id="par-plus" aria-label="Increase par">&plus;</button>
        </div>
      </div>

      <div class="sc-card">
        <p class="sc-card-title">Total Strokes</p>
        <div class="stepper-row">
          <button type="button" class="stepper-btn" id="strokes-minus" aria-label="Decrease strokes">&minus;</button>
          <div class="stepper-value" id="strokes-value">${hole.strokes ?? '&ndash;'}</div>
          <button type="button" class="stepper-btn" id="strokes-plus" aria-label="Increase strokes">&plus;</button>
        </div>
        <div class="score-badge ${scoreLabel(hole)?.cls || ''}" id="score-badge">
          ${scoreLabel(hole)?.text || 'Enter strokes to see score'}
        </div>
      </div>

      <div class="sc-card">
        <p class="sc-card-title">Club Used</p>
        <div class="club-grid" id="club-grid">
          ${CLUBS.map(c => `
            <button type="button" class="club-btn ${hole.club === c ? 'selected' : ''}" data-club="${c}">${c}</button>
          `).join('')}
        </div>
      </div>

      <div class="sc-card">
        <p class="sc-card-title">Shot Direction</p>
        <div class="direction-row" id="direction-row">
          ${DIRECTIONS.map(d => `
            <button type="button" class="direction-btn ${hole.direction === d ? 'selected' : ''}" data-direction="${d}">${d}</button>
          `).join('')}
        </div>
      </div>

      <div class="sc-card">
        <p class="sc-card-title">Photo</p>
        ${hole.photo ? `
          <div class="photo-preview">
            <img src="${hole.photo}" alt="Photo captured for hole ${hole.number}">
            <div class="photo-actions">
              <button type="button" class="photo-action-btn" id="photo-retake-btn">Retake</button>
              <button type="button" class="photo-action-btn photo-remove-btn" id="photo-remove-btn">Remove</button>
            </div>
          </div>
        ` : `
          <label class="photo-capture-btn" for="photo-input">
            📷 Capture Photo
          </label>
        `}
        <input
          type="file"
          accept="image/*"
          capture="camera"
          id="photo-input"
          class="photo-input-hidden">
      </div>

      <button type="button" class="summary-cta" id="summary-btn">
        View Round Summary (${filledCount}/${holeCount} holes)
      </button>
    `;

    buildHoleStrip();
    wireEvents();
  }

  function buildHoleStrip() {
    const strip = document.getElementById('hole-strip');
    strip.innerHTML = holes.map(h => {
      const filled = h.strokes != null;
      const isCurrent = h.number === currentHole;
      return `<button type="button" class="${isCurrent ? 'is-current' : ''} ${filled ? 'is-filled' : ''}" data-jump="${h.number}">${h.number}</button>`;
    }).join('');

    strip.querySelectorAll('button[data-jump]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentHole = parseInt(btn.dataset.jump, 10);
        render();
      });
    });
  }

  function wireEvents() {
    const hole = holes[currentHole - 1];

    document.getElementById('hole-prev-btn').addEventListener('click', () => {
      if (currentHole > 1) { currentHole--; render(); }
    });
    document.getElementById('hole-next-btn').addEventListener('click', () => {
      if (currentHole < holeCount) { currentHole++; render(); }
    });

    document.getElementById('par-minus').addEventListener('click', () => {
      hole.par = Math.max(PAR_MIN, hole.par - 1);
      render();
    });
    document.getElementById('par-plus').addEventListener('click', () => {
      hole.par = Math.min(PAR_MAX, hole.par + 1);
      render();
    });

    document.getElementById('strokes-minus').addEventListener('click', () => {
      const base = hole.strokes == null ? hole.par : hole.strokes;
      hole.strokes = Math.max(STROKES_MIN, base - 1);
      render();
    });
    document.getElementById('strokes-plus').addEventListener('click', () => {
      const base = hole.strokes == null ? hole.par - 1 : hole.strokes;
      hole.strokes = Math.min(STROKES_MAX, base + 1);
      render();
    });

    document.querySelectorAll('#club-grid .club-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        hole.club = hole.club === btn.dataset.club ? null : btn.dataset.club;
        render();
      });
    });

    document.querySelectorAll('#direction-row .direction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        hole.direction = hole.direction === btn.dataset.direction ? null : btn.dataset.direction;
        render();
      });
    });

    // ---- Photo capture (Step 3) ----
    const photoInput = document.getElementById('photo-input');
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        hole.photo = reader.result; // data URL, held in memory only
        render();
      };
      reader.readAsDataURL(file);
    });

    const retakeBtn = document.getElementById('photo-retake-btn');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => photoInput.click());
    }

    const removeBtn = document.getElementById('photo-remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        hole.photo = null;
        render();
      });
    }

    // ---- Round Summary (Step 4) ----
    document.getElementById('summary-btn').addEventListener('click', () => {
      if (typeof window.GolfTracker.goToSummary === 'function') {
        window.GolfTracker.goToSummary();
      }
    });
  }

  function initScorecard(selectedCourseName, selectedHoleCount) {
    courseName = selectedCourseName;
    holeCount = (selectedHoleCount === 9) ? 9 : 18;
    holes = freshHoles(holeCount);
    currentHole = 1;
    render();
  }

  window.GolfTracker = window.GolfTracker || {};
  window.GolfTracker.initScorecard = initScorecard;
  window.GolfTracker.getHoles = () => holes; // exposed for Step 4/5 hookup
})();