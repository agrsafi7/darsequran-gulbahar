import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdPlaceholder } from "@/components/shared/AdPlaceholder";

const speeches = [
  {
    id: "1",
    title: "The Importance of Seeking Knowledge",
    speaker: "Sheikh Abdullah",
    duration: "45 mins",
    date: "2024-01-15",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
  },
  {
    id: "2",
    title: "Understanding Tawakkul (Trust in Allah)",
    speaker: "Dr. Ahmad Hassan",
    duration: "38 mins",
    date: "2024-01-12",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
  },
  {
    id: "3",
    title: "Building Strong Family Bonds in Islam",
    speaker: "Ustaz Ibrahim",
    duration: "52 mins",
    date: "2024-01-10",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80",
  },
  {
    id: "4",
    title: "The Beauty of Prayer",
    speaker: "Sheikh Abdullah",
    duration: "42 mins",
    date: "2024-01-08",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
];

const Speeches = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 text-shadow-lg">
              Speeches
            </h1>
            <p className="text-xl text-primary-foreground/90 text-shadow">
              Inspiring lectures and speeches on various Islamic topics by renowned scholars
            </p>
          </div>
        </div>
      </section>

      {/* Speeches Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {speeches.map((speech, index) => (
                  <Card 
                    key={speech.id} 
                    className="card-elevated border-0 overflow-hidden animate-slide-up cursor-pointer group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={speech.image}
                        alt={speech.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{speech.duration}</span>
                        <span>•</span>
                        <span>{new Date(speech.date).toLocaleDateString()}</span>
                      </div>
                      <CardTitle className="font-heading text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {speech.title}
                      </CardTitle>
                      <CardDescription>{speech.speaker}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <AdPlaceholder size="vertical" label="Sidebar Ad" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Speeches;
