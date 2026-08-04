import { useState, useEffect } from "react";
import { Download, Loader2, Clock, HardDrive, FileArchive, Share2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AudioPlayer } from "./AudioPlayer";
import { supabase } from "@/integrations/supabase/client";
import { trackDownload } from "@/lib/analytics";
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

interface BulkDownload {
  type: 'torrent' | 'zip';
  name: string;
  size?: string;
  downloadUrl: string;
}

interface ArchiveContentProps {
  itemId: string;
}

function formatFileSize(bytes: string): string {
  const size = parseInt(bytes, 10);
  if (isNaN(size)) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
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

export function ArchiveContent({ itemId }: ArchiveContentProps) {
  const [files, setFiles] = useState<ArchiveFile[]>([]);
  const [bulkDownloads, setBulkDownloads] = useState<BulkDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<ArchiveFile | null>(null);


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
      setBulkDownloads(data.bulkDownloads || []);
    } catch (err) {
      console.error('Error fetching archive files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading content from Archive.org...</span>
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

  const torrent = bulkDownloads.find(d => d.type === 'torrent');
  const zip = bulkDownloads.find(d => d.type === 'zip');

  const activeFile = selectedFile ?? files[0] ?? null;
  const activeLabel = activeFile
    ? formatArchiveFileLabel(activeFile.name) || activeFile.title
    : "";

  return (
    <div className="space-y-8">
      {/* Section 1: Custom Audio Player */}
      {activeFile && (
        <section>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            🎵 Listen Online
          </h3>
          <AudioPlayer
            key={activeFile.name}
            src={activeFile.downloadUrl}
            title={activeLabel}
          />
        </section>
      )}

      <Separator className="my-8" />

      {/* Section 2: Download List (also selects file for player) */}
      <section>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-primary" />
          Audio Files ({files.length})
        </h3>

        {files.length === 0 ? (
          <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
            <p>No downloadable files found.</p>
          </div>
        ) : (
          <div className="border rounded-lg divide-y max-h-[60vh] md:max-h-[480px] overflow-y-auto overscroll-contain">
            {files.map((file, index) => {
              const displayLabel = formatArchiveFileLabel(file.name) || file.title;
              const isActive = activeFile?.name === file.name;

              return (
                <div
                  key={file.name}
                  className={`flex items-center justify-between gap-2 px-4 py-5 transition-colors ${
                    isActive
                      ? "bg-primary/10"
                      : index % 2 === 0
                      ? "bg-muted/30"
                      : "bg-background"
                  } hover:bg-muted/50`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedFile(file)}
                    aria-label={`Play ${displayLabel}`}
                    className={`shrink-0 flex items-center justify-center h-9 w-9 rounded-full transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                    }`}
                  >
                    {isActive ? (
                      <Pause className="h-4 w-4" fill="currentColor" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFile(file)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span
                      className="block font-medium text-foreground text-base md:text-lg leading-snug truncate"
                      title={displayLabel}
                    >
                      {displayLabel}
                      {isActive && (
                        <span className="ml-2 inline-flex items-center gap-1 align-middle text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          Now Playing
                        </span>
                      )}
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
                  </button>

                  <DownloadButton
                    url={file.downloadUrl}
                    filename={displayLabel}
                    itemId={itemId}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>


      <Separator className="my-8" />

      {/* Section 3: Bulk Download Options */}
      <section>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          📦 Download All Files
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {/* ZIP Download */}
          {zip ? (
            <div className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                  <FileArchive className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">VBR MP3 (ZIP)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Download all audio files in a single ZIP archive
                  </p>
                  {zip.size && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Size: {formatFileSize(zip.size)}
                    </p>
                  )}
                  <Button asChild size="sm" className="w-full">
                    <a
                      href={zip.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      onClick={() => trackDownload('VBR MP3 ZIP', 'zip', itemId)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download ZIP
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-muted/30 text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted">
                  <FileArchive className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">VBR MP3 (ZIP)</h4>
                  <p className="text-sm">ZIP download not available for this item</p>
                </div>
              </div>
            </div>
          )}

          {/* Torrent Download */}
          {torrent ? (
            <div className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                  <Share2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Torrent</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Download via BitTorrent (faster for large files)
                  </p>
                  {torrent.size && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Size: {formatFileSize(torrent.size)}
                    </p>
                  )}
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <a
                      href={torrent.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      onClick={() => trackDownload('Torrent', 'torrent', itemId)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Torrent
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-muted/30 text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted">
                  <Share2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Torrent</h4>
                  <p className="text-sm">Torrent not available for this item</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground text-center pt-4">
          All files hosted on{" "}
          <a
            href={`https://archive.org/details/${itemId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Archive.org
          </a>
        </p>
      </section>
    </div>
  );
}