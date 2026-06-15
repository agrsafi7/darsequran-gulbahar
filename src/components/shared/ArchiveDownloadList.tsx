import { useState, useEffect } from "react";
import { Download, Loader2, Clock, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatArchiveFileLabel } from "@/lib/archiveFileName";
import { DownloadButton } from "./DownloadButton";

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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
        {files.map((file, index) => {
          const displayLabel = formatArchiveFileLabel(file.name) || file.title;

          return (
            <div
              key={file.name}
              className={`flex items-center justify-between px-4 py-5 transition-colors ${index % 2 === 0 ? 'bg-muted/30' : 'bg-background'} hover:bg-muted/50`}
            >
              <div className="flex-1 min-w-0">
                <span
                  className="block font-medium text-foreground text-base md:text-lg leading-snug truncate"
                  title={displayLabel}
                >
                  {displayLabel}
                </span>

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

              <DownloadButton
                url={file.downloadUrl}
                filename={displayLabel}
                itemId={itemId}
              />
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
