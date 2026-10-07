/** Saves a Blob through a temporary link; the object URL is released after the click is handled. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoking synchronously can cancel the download in some browsers (notably Safari/Firefox).
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Local calendar date for file names (toISOString() would give the UTC date near midnight). */
export function todayStamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
