export async function forceDownload(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return true;
  } catch (err) {
    console.error("Force download failed, falling back:", err);
    // Fallback: open in new tab so it doesn't replace the current page
    window.open(url, "_blank", "noopener,noreferrer");
    return false;
  }
}
