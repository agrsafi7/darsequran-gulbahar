import { Download, FileAudio, Clock, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DownloadCardProps {
  title: string;
  description?: string;
  audioUrl: string;
  duration?: string;
  fileSize?: string;
}

export const DownloadCard = ({
  title,
  description,
  audioUrl,
  duration,
  fileSize,
}: DownloadCardProps) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="card-elevated border-0">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center shrink-0">
            <FileAudio className="w-6 h-6 text-primary-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
              {title}
            </h3>
            
            {description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {duration}
                </span>
              )}
              {fileSize && (
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  {fileSize}
                </span>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleDownload}
            className="hero-gradient text-primary-foreground hover:opacity-90 shrink-0"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
