// ---- Step 5: Save Round Wiring ----
    const saveRoundBtn = document.getElementById('save-round-btn');
    if (saveRoundBtn) {
      saveRoundBtn.disabled = false;
      saveRoundBtn.textContent = 'Save Round';
      
      saveRoundBtn.addEventListener('click', async () => {
        saveRoundBtn.disabled = true;
        saveRoundBtn.textContent = 'Saving…';
        try {
          // Grab the session data directly from the global variable
          const sessionData = (typeof roundSession !== 'undefined') ? roundSession : {
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
          // THIS WILL PRINT THE ACTUAL ERROR TO YOUR PHONE SCREEN
          alert('Could not save this round. Reason: ' + (err.message || err));
        }
      });
    }