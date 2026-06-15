import { useState } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { forceDownload, type DownloadProgress } from "@/lib/forceDownload";
import { trackDownload } from "@/lib/analytics";

interface DownloadButtonProps {
  url: string;
  filename: string;
  itemId: string;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function DownloadButton({ url, filename, itemId }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [errored, setErrored] = useState(false);

  const start = async (e: React.MouseEvent) => {
    e.preventDefault();
    trackDownload(filename, "audio", itemId);
    setDownloading(true);
    setErrored(false);
    setProgress({ loaded: 0, total: 0, percent: 0 });

    const result = await forceDownload(url, filename, {
      onProgress: (p) => setProgress(p),
    });

    setDownloading(false);

    if (result.ok) {
      setProgress(null);
      toast.success("Download complete", { description: filename });
    } else {
      setErrored(true);
      setProgress(null);
      toast.error("Download failed", {
        description: result.error?.message ?? "Could not fetch the file.",
        action: {
          label: "Retry",
          onClick: () => start(e),
        },
      });
    }
  };

  const percent = progress?.percent ?? null;
  const showBar = downloading && progress;

  return (
    <div className="ml-2 shrink-0 flex flex-col items-end gap-1 min-w-[110px] sm:min-w-[160px]">
      <button
        type="button"
        disabled={downloading}
        onClick={start}
        aria-label={`Download ${filename}`}
        className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200 text-sm font-medium hover:shadow-md disabled:cursor-not-allowed ${
          errored
            ? "bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground hover:scale-105 disabled:opacity-80 disabled:hover:scale-100"
        }`}
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : errored ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {downloading
            ? percent !== null
              ? `${Math.floor(percent)}%`
              : "Downloading..."
            : errored
            ? "Retry"
            : "Download"}
        </span>
        <span className="sm:hidden">
          {downloading && percent !== null ? `${Math.floor(percent)}%` : ""}
        </span>
      </button>

      {showBar && (
        <div className="w-full">
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-150 ease-out"
              style={{
                width: percent !== null ? `${percent}%` : "100%",
              }}
            />
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground tabular-nums text-right">
            {formatBytes(progress.loaded)}
            {progress.total ? ` / ${formatBytes(progress.total)}` : ""}
          </div>
        </div>
      )}
    </div>
  );
}
