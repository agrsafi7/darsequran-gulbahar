import { useState, useEffect } from "react";
import { Download, Loader2, Clock, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { trackDownload } from "@/lib/analytics";
import { formatArchiveFileLabel } from "@/lib/archiveFileName";

interface ArchiveFile {
  name: string;
  title: string;
  size: string;
  length: string;
  track: string;
  downloadUrl: string;
}

interface ArchiveDownloadListProps {
  itemId: string;
}

function formatFileSize(bytes: string): string {
  const size = parseInt(bytes, 10);
  if (isNaN(size)) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: string): string {
  const totalSeconds = parseFloat(seconds);
  if (isNaN(totalSeconds)) return "";
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function ArchiveDownloadList({ itemId }: ArchiveDownloadListProps) {
  const [files, setFiles] = useState<ArchiveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemId) {
      fetchFiles();
    }
  }, [itemId]);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('archive-files', {
        body: { itemId, format: 'VBR MP3' },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch files');
      }

      setFiles(data.files || []);
    } catch (err) {
      console.error('Error fetching archive files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load download list');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading download list...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 rounded-lg text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={fetchFiles}>
          Try Again
        </Button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
        <p>No downloadable files found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Download className="h-5 w-5 text-primary" />
        Download Files ({files.length})
      </h3>
      
      <div className="border rounded-lg divide-y">
        {files.map((file) => {
          const displayLabel = formatArchiveFileLabel(file.name) || file.title;

          return (
            <div
              key={file.name}
              className="flex items-center justify-between px-4 py-5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={file.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="block font-semibold text-primary text-base md:text-lg leading-snug hover:underline truncate"
                  title={displayLabel}
                  onClick={() => trackDownload(displayLabel, 'audio', itemId)}
                >
                  {displayLabel}
                </a>

                {(file.length || file.size) && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    {file.length && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(file.length)}
                      </span>
                    )}
                    {file.size && (
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatFileSize(file.size)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm" asChild className="ml-2 shrink-0">
                <a
                  href={file.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  aria-label={`Download ${displayLabel}`}
                  onClick={() => trackDownload(displayLabel, 'audio', itemId)}
                >
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground text-center pt-2">
        Files hosted on{" "}
        <a
          href={`https://archive.org/details/${itemId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Archive.org
        </a>
      </p>
    </div>
  );
}
