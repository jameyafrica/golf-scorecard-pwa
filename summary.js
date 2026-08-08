// summary.js — Step 4 & 5: End-of-Round Summary Engine + Save Logic

(function () {
  function classify(hole) {
    if (hole.strokes == null) return null; 
    const diff = hole.strokes - hole.par;
    if (diff <= -1) return 'birdie';   
    if (diff === 0) return 'par';
    if (diff === 1) return 'bogey';
    return 'double'; 
  }

  function formatDiff(diff) {
    if (diff === 0) return 'E';
    return diff > 0 ? `+${diff}` : `${diff}`;
  }

  function render(courseName, holeCount, holes) {
    const root = document.getElementById('summary-main');

    const played = holes.filter(h => h.strokes != null);
    const totalStrokes = played.reduce((sum, h) => sum + h.strokes, 0);
    const totalPar = played.reduce((sum, h) => sum + h.par, 0);
    const diff = totalStrokes - totalPar;
    const isComplete = played.length === holeCount;

    const tally = { birdie: 0, par: 0, bogey: 0, double: 0 };
    played.forEach(h => {
      const cls = classify(h);
      if (cls) tally[cls]++;
    });

    const photos = holes.filter(h => h.photo);

    root.innerHTML = `
      ${!isComplete ? `
        <div class="incomplete-banner">
          Through ${played.length} of ${holeCount} holes &mdash; totals reflect holes played so far.
        </div>
      ` : ''}

      <div class="sc-card total-score-card">
        <p class="sc-card-title">Total Score</p>
        <div class="total-score-row">
          <span class="total-score-strokes">${played.length ? totalStrokes : '&ndash;'}</span>
          ${played.length ? `<span class="total-score-diff ${diff > 0 ? 'over' : diff < 0 ? 'under' : 'even'}">${formatDiff(diff)}</span>` : ''}
        </div>
        <p class="total-score-sub">${played.length ? `vs. Par ${totalPar} &middot; ${played.length} holes played` : 'No holes recorded yet'}</p>
      </div>

      <div class="sc-card">
        <p class="sc-card-title">Score Tally</p>
        <div class="tally-grid">
          <div class="tally-cell tally-birdie">
            <span class="tally-count">${tally.birdie}</span>
            <span class="tally-label">Birdies &amp; Eagles</span>
          </div>
          <div class="tally-cell tally-par">
            <span class="tally-count">${tally.par}</span>
            <span class="tally-label">Pars</span>
          </div>
          <div class="tally-cell tally-bogey">
            <span class="tally-count">${tally.bogey}</span>
            <span class="tally-label">Bogeys</span>
          </div>
          <div class="tally-cell tally-double">
            <span class="tally-count">${tally.double}</span>
            <span class="tally-label">Double Bogey+</span>
          </div>
        </div>
      </div>

      <div class="sc-card">
        <p class="sc-card-title">Round Photos</p>
        ${photos.length ? `
          <div class="photo-gallery">
            ${photos.map(h => `
              <div class="photo-gallery-cell">
                <img src="${h.photo}" alt="Photo from hole ${h.number}">
                <span class="photo-gallery-tag">Hole ${h.number}</span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="photo-placeholder">No photos captured this round</div>
        `}
      </div>

      <button type="button" class="save-round-btn" id="save-round-btn">
        Save Round
      </button>
    `;

    // ---- Step 5: Save Round Wiring ----
    const saveRoundBtn = document.getElementById('save-round-btn');
    if (saveRoundBtn) {
      saveRoundBtn.disabled = false;
      saveRoundBtn.textContent = 'Save Round';
      
      saveRoundBtn.addEventListener('click', async () => {
        saveRoundBtn.disabled = true;
        saveRoundBtn.textContent = 'Saving…';
        try {
          const sessionData = (typeof window.roundSession !== 'undefined') ? window.roundSession : {
            course: courseName,
            holeCount: holeCount,
            player: 'Lwando',
            date: new Date().toISOString().slice(0,10)
          };
          
          await saveRoundToDB(sessionData, holes);
          saveRoundBtn.textContent = 'Saved ✓';
        } catch (err) {
          console.error('Failed to save round:', err);
          saveRoundBtn.textContent = 'Save Round';
          saveRoundBtn.disabled = false;
          alert('Could not save this round. Reason: ' + (err.message || err));
        }
      });
    }
  }

  function initSummary(courseName, holeCount, holes) {
    render(courseName, holeCount, holes || []);
  }

  window.GolfTracker = window.GolfTracker || {};
  window.GolfTracker.initSummary = initSummary;
})();