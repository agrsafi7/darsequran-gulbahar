export interface DownloadProgress {
  loaded: number;
  total: number;
  percent: number | null;
}

export interface ForceDownloadOptions {
  onProgress?: (p: DownloadProgress) => void;
  signal?: AbortSignal;
}

export async function forceDownload(
  url: string,
  filename: string,
  options: ForceDownloadOptions = {}
): Promise<{ ok: boolean; fallback?: boolean; error?: Error }> {
  const { onProgress, signal } = options;
  try {
    const res = await fetch(url, { mode: "cors", signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const contentLength = res.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    let blob: Blob;

    if (res.body && typeof res.body.getReader === "function") {
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loaded += value.length;
          onProgress?.({
            loaded,
            total,
            percent: total > 0 ? Math.min(100, (loaded / total) * 100) : null,
          });
        }
      }

      blob = new Blob(chunks as BlobPart[]);
    } else {
      blob = await res.blob();
      onProgress?.({ loaded: blob.size, total: blob.size, percent: 100 });
    }

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return { ok: true };
  } catch (err) {
    console.error("Force download failed:", err);
    return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
