/**
 * LEARNING — the outbox pattern
 * When `navigator.onLine` is false, we write reports to IndexedDB.
 * When the browser fires `online`, we POST each row and mark it synced.
 */
const DB = "ner-outbox";
const STORE = "reports";

export type PendingReport = {
  id: string;
  districtId: string;
  roadId: string;
  kind: string;
  note: string;
  reporter: string;
  lat: number;
  lng: number;
  photoDataUrl?: string;
  at: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function queueReport(report: PendingReport) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(report);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function allQueued(): Promise<PendingReport[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as PendingReport[]);
    req.onerror = () => reject(req.error);
  });
}

export async function removeQueued(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function flushOutbox() {
  const pending = await allQueued();
  for (const item of pending) {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        districtId: item.districtId,
        roadId: item.roadId,
        kind: item.kind,
        note: item.note,
        reporter: item.reporter,
        photoDataUrl: item.photoDataUrl,
        position: { lat: item.lat, lng: item.lng },
      }),
    });
    if (res.ok) await removeQueued(item.id);
  }
}
