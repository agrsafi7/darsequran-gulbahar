import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { DownloadCard } from "@/components/audio/DownloadCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { FileAudio } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DarsAudio {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration: string | null;
  file_size: string | null;
}

const CompleteDars = () => {
  const [audioList, setAudioList] = useState<DarsAudio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudio = async () => {
      const { data, error } = await supabase
        .from("dars_audio")
        .select("*")
        .eq("category", "complete")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setAudioList(data);
      }
      setLoading(false);
    };

    fetchAudio();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <FileAudio className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground/80 font-medium">
                Dars-e-Quran
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl text-primary-foreground mb-4 text-shadow-lg">
              Complete Dars
            </h1>
            <p className="text-lg text-primary-foreground/90 text-shadow">
              Download complete compilations as single files for uninterrupted listening experience.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : audioList.length > 0 ? (
              <Tabs defaultValue="listen" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="listen">Listen Online</TabsTrigger>
                  <TabsTrigger value="download">Download</TabsTrigger>
                </TabsList>
                
                <TabsContent value="listen" className="space-y-4">
                  {audioList.map((audio) => (
                    <AudioPlayer
                      key={audio.id}
                      src={audio.audio_url}
                      title={audio.title}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="download" className="space-y-4">
                  {audioList.map((audio) => (
                    <DownloadCard
                      key={audio.id}
                      title={audio.title}
                      description={audio.description || undefined}
                      audioUrl={audio.audio_url}
                      duration={audio.duration || undefined}
                      fileSize={audio.file_size || undefined}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mx-auto mb-4">
                  <FileAudio className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-xl text-foreground mb-2">
                  No Complete Dars Available
                </h3>
                <p className="text-muted-foreground">
                  Check back soon for complete Quran lesson compilations.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CompleteDars;
