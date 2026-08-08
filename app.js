const roundSession = { course: null, date: null, player: "Lwando", started: false };

  const dateEl = document.getElementById('today-date');
  const today = new Date();
  dateEl.textContent = today.toLocaleDateString('en-ZA', { day:'numeric', month:'short', year:'numeric' });
  roundSession.date = today.toISOString().slice(0,10);

  const form = document.getElementById('course-form');
  const customRadio = document.getElementById('custom-radio');
  const customInput = document.getElementById('custom-name');
  const startBtn = document.getElementById('start-round');
  const ctaHint = document.getElementById('cta-hint');
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');

  function currentCourseName(){
    const checked = form.querySelector('input[name="course"]:checked');
    if (!checked) return null;
    if (checked.value === '__custom__'){
      const name = customInput.value.trim();
      return name.length ? name : null;
    }
    return checked.value;
  }

  function refreshState(){
    const name = currentCourseName();
    startBtn.disabled = !name;
    ctaHint.textContent = name ? `Ready to tee off at ${name}` : 'Select a course to continue';
  }

  form.addEventListener('change', refreshState);
  customInput.addEventListener('input', refreshState);

  customRadio.addEventListener('change', () => {
    if (customRadio.checked) setTimeout(() => customInput.focus(), 180);
  });

  startBtn.addEventListener('click', () => {
    const name = currentCourseName();
    if (!name) return;

    roundSession.course = name;
    roundSession.started = true;

    toastTitle.textContent = `Round started — ${name}`;
    toast.classList.add('show');

    startBtn.disabled = true;
    startBtn.textContent = 'Round in progress…';

    console.log('roundSession initialized:', roundSession);
  });

  refreshState();