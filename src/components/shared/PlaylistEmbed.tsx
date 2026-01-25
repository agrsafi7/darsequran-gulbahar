import { useMemo } from "react";

interface PlaylistEmbedProps {
  url: string;
}

export function PlaylistEmbed({ url }: PlaylistEmbedProps) {
  const embedInfo = useMemo(() => {
    // YouTube playlist
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      let listId = "";
      
      if (url.includes("list=")) {
        listId = url.split("list=")[1]?.split("&")[0] || "";
      }
      if (url.includes("v=")) {
        videoId = url.split("v=")[1]?.split("&")[0] || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
      }
      
      const embedUrl = listId 
        ? `https://www.youtube.com/embed/videoseries?list=${listId}`
        : videoId 
          ? `https://www.youtube.com/embed/${videoId}`
          : null;
          
      return embedUrl ? { type: "youtube", embedUrl } : null;
    }
    
    // SoundCloud
    if (url.includes("soundcloud.com")) {
      return {
        type: "soundcloud",
        embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
      };
    }
    
    // Spotify
    if (url.includes("spotify.com")) {
      const spotifyUrl = url.replace("open.spotify.com", "open.spotify.com/embed");
      return { type: "spotify", embedUrl: spotifyUrl };
    }
    
    return null;
  }, [url]);

  if (!embedInfo) {
    return (
      <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
        <p>Unable to embed this playlist URL.</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Open playlist in new tab
        </a>
      </div>
    );
  }

  if (embedInfo.type === "youtube") {
    return (
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          src={embedInfo.embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube Playlist"
        />
      </div>
    );
  }

  if (embedInfo.type === "soundcloud") {
    return (
      <div className="rounded-lg overflow-hidden">
        <iframe
          src={embedInfo.embedUrl}
          className="w-full"
          height="300"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          title="SoundCloud Playlist"
        />
      </div>
    );
  }

  if (embedInfo.type === "spotify") {
    return (
      <div className="rounded-lg overflow-hidden">
        <iframe
          src={embedInfo.embedUrl}
          className="w-full"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify Playlist"
        />
      </div>
    );
  }

  return null;
}