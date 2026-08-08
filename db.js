// db.js — Step 5: IndexedDB Persistence Layer
// Golf Tracker PWA. Zero dependencies — no idb-keyval needed.

const GT_DB_NAME = 'golfTrackerDB';
const GT_DB_VERSION = 1;
const GT_STORE = 'rounds';

let gtDbPromise = null;

function openGolfDB() {
  if (gtDbPromise) return gtDbPromise;
  gtDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(GT_DB_NAME, GT_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(GT_STORE)) {
        const store = db.createObjectStore(GT_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('savedAt', 'savedAt', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
  return gtDbPromise;
}

/**
 * Downscales + recompresses a base64 photo Data URL before it hits IndexedDB.
 * 18 uncompressed camera photos can blow well past mobile PWA storage quotas
 * (Safari especially). This keeps each photo to roughly 80–200KB instead of
 * the 2–8MB a phone sensor produces straight off <input capture="camera">.
 */
function compressPhoto(dataUrl, maxWidth = 900, quality = 0.6) {
  return new Promise((resolve) => {
    if (!dataUrl) return resolve(null);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl); // fall back to original rather than drop the photo
    img.src = dataUrl;
  });
}

/**
 * Persists the current roundSession + holes array as one record.
 * Call from the "Save Round" click handler on the Step 4 summary screen.
 * Returns the new record's auto-generated id.
 */
async function saveRoundToDB(roundSession, holes) {
  const db = await openGolfDB();

  const compressedHoles = await Promise.all(
    holes.map(async (hole) => ({
      ...hole,
      photo: hole.photo ? await compressPhoto(hole.photo) : null,
    }))
  );

  const playedHoles = compressedHoles.filter((h) => typeof h.strokes === 'number' && h.strokes > 0);
  const totalStrokes = playedHoles.reduce((sum, h) => sum + h.strokes, 0);
  const totalPar = playedHoles.reduce((sum, h) => sum + h.par, 0);

  const record = {
    course: roundSession.course,
    player: roundSession.player,
    date: roundSession.date,
    holeCount: roundSession.holeCount,
    holes: compressedHoles,
    totalStrokes,
    totalPar,
    scoreToPar: totalStrokes - totalPar,
    savedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(GT_STORE, 'readwrite');
    const store = tx.objectStore(GT_STORE);
    const request = store.add(record);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllRounds() {
  const db = await openGolfDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(GT_STORE, 'readonly');
    const request = tx.objectStore(GT_STORE).getAll();
    request.onsuccess = () =>
      resolve(request.result.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));
    request.onerror = () => reject(request.error);
  });
}

async function getRoundById(id) {
  const db = await openGolfDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(GT_STORE, 'readonly');
    const request = tx.objectStore(GT_STORE).get(Number(id));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteRoundById(id) {
  const db = await openGolfDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(GT_STORE, 'readwrite');
    const request = tx.objectStore(GT_STORE).delete(Number(id));
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}