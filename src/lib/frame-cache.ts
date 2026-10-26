// IndexedDB store for captured WebP frame sequences, keyed by `url|width`.

const STORE = "frames";

function open(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadFrames(dbName: string, key: string): Promise<Blob[] | null> {
  try {
    const db = await open(dbName);
    return await new Promise((resolve) => {
      const req = db.transaction(STORE).objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as Blob[] | undefined) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveFrames(dbName: string, key: string, frames: Blob[]) {
  try {
    const db = await open(dbName);
    db.transaction(STORE, "readwrite").objectStore(STORE).put(frames, key);
  } catch {
    // Cache is an optimisation only.
  }
}
