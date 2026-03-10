import QRCode from "qrcode"

const DB_NAME = "4-cut-life"
const STORE_NAME = "strips"

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveStripToIdb(id: string, blob: Blob): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put(blob, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadStripFromIdb(id: string): Promise<Blob | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const req = tx.objectStore(STORE_NAME).get(id)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function generateQrForStrip(
  pngDataUrl: string,
  origin: string,
): Promise<string> {
  // Save blob to IDB, encode the /view URL in the QR
  const id = crypto.randomUUID()
  const res = await fetch(pngDataUrl)
  const blob = await res.blob()
  await saveStripToIdb(id, blob)

  const viewUrl = `${origin}/view?id=${id}`
  return QRCode.toDataURL(viewUrl, { width: 300, margin: 2 })
}
