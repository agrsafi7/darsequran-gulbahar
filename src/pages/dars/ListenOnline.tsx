import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Headphones } from "lucide-react";

interface DarsAudio {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration: string | null;
}

const ListenOnline = () => {
  const [audioList, setAudioList] = useState<DarsAudio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudio = async () => {
      const { data, error } = await supabase
        .from("dars_audio")
        .select("*")
        .eq("category", "listen")
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
                <Headphones className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-primary-foreground/80 font-medium">
                Dars-e-Quran
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl text-primary-foreground mb-4 text-shadow-lg">
              Listen Online
            </h1>
            <p className="text-lg text-primary-foreground/90 text-shadow">
              Stream Quran lessons directly in your browser. Access our complete library of audio recordings.
            </p>
          </div>
        </div>
      </section>

      {/* Audio List Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))
            ) : audioList.length > 0 ? (
              audioList.map((audio) => (
                <AudioPlayer
                  key={audio.id}
                  src={audio.audio_url}
                  title={audio.title}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-xl text-foreground mb-2">
                  No Audio Available
                </h3>
                <p className="text-muted-foreground">
                  Check back soon for new Quran lessons.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ListenOnline;
