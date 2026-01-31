import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Youtube, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LiveStream {
  id: string;
  platform: "youtube" | "facebook";
  stream_url: string;
  is_live: boolean;
}

export function LiveStreamButtons() {
  const { data: streams } = useQuery({
    queryKey: ["live-streams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .order("platform");

      if (error) throw error;
      return data as LiveStream[];
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  const youtubeStream = streams?.find((s) => s.platform === "youtube");
  const facebookStream = streams?.find((s) => s.platform === "facebook");

  const handleClick = (url: string | undefined) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {/* YouTube Button */}
      <Button
        variant="outline"
        className={cn(
          "relative gap-2 border-2 transition-all duration-300",
          youtubeStream?.is_live
            ? "border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            : "border-muted-foreground/30 hover:border-muted-foreground/50"
        )}
        onClick={() => handleClick(youtubeStream?.stream_url)}
        disabled={!youtubeStream?.stream_url}
      >
        <Youtube className={cn("w-5 h-5", youtubeStream?.is_live && "animate-pulse")} />
        <span>YouTube</span>
        {youtubeStream?.is_live && (
          <span className="absolute -top-2 -right-2 flex items-center gap-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            <span className="w-1.5 h-1.5 bg-white rounded-full absolute" />
            LIVE
          </span>
        )}
      </Button>

      {/* Facebook Button */}
      <Button
        variant="outline"
        className={cn(
          "relative gap-2 border-2 transition-all duration-300",
          facebookStream?.is_live
            ? "border-blue-600 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            : "border-muted-foreground/30 hover:border-muted-foreground/50"
        )}
        onClick={() => handleClick(facebookStream?.stream_url)}
        disabled={!facebookStream?.stream_url}
      >
        <Facebook className={cn("w-5 h-5", facebookStream?.is_live && "animate-pulse")} />
        <span>Facebook</span>
        {facebookStream?.is_live && (
          <span className="absolute -top-2 -right-2 flex items-center gap-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)]">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            <span className="w-1.5 h-1.5 bg-white rounded-full absolute" />
            LIVE
          </span>
        )}
      </Button>
    </div>
  );
}
