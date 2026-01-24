import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { DownloadCard } from "@/components/audio/DownloadCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";

interface DarsAudio {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration: string | null;
  file_size: string | null;
}

const DownloadDars = () => {
  const [audioList, setAudioList] = useState<DarsAudio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudio = async () => {
      const { data, error } = await supabase
        .from("dars_audio")
        .select("*")
        .eq("category", "download")
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
                <Download className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground/80 font-medium">
                Dars-e-Quran
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl text-primary-foreground mb-4 text-shadow-lg">
              Download Dars
            </h1>
            <p className="text-lg text-primary-foreground/90 text-shadow">
              Download individual lessons to listen offline. Perfect for learning on the go.
            </p>
          </div>
        </div>
      </section>

      {/* Download List Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))
            ) : audioList.length > 0 ? (
              audioList.map((audio) => (
                <DownloadCard
                  key={audio.id}
                  title={audio.title}
                  description={audio.description || undefined}
                  audioUrl={audio.audio_url}
                  duration={audio.duration || undefined}
                  fileSize={audio.file_size || undefined}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-xl text-foreground mb-2">
                  No Downloads Available
                </h3>
                <p className="text-muted-foreground">
                  Check back soon for downloadable Quran lessons.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DownloadDars;
