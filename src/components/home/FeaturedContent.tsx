import { Link } from "react-router-dom";
import { BookOpen, Mic2, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: BookOpen,
    title: "Dars-e-Quran",
    description: "Comprehensive Quran lessons with detailed tafseer and explanations for deeper understanding.",
    href: "/dars-e-quran",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Mic2,
    title: "Speeches",
    description: "Inspiring lectures and speeches on various Islamic topics by renowned scholars.",
    href: "/speeches",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: FileText,
    title: "Books",
    description: "A curated collection of Islamic literature covering faith, jurisprudence, and spirituality.",
    href: "/books",
    color: "bg-emerald-light text-primary",
  },
];

const recentPosts = [
  {
    id: "1",
    title: "Understanding Surah Al-Fatiha: A Complete Guide",
    category: "Dars-e-Quran",
    excerpt: "Explore the profound meanings and spiritual significance of the opening chapter of the Quran.",
    date: "2024-01-15",
    image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&q=80",
  },
  {
    id: "2",
    title: "The Importance of Seeking Knowledge in Islam",
    category: "Speeches",
    excerpt: "A powerful discourse on why knowledge is considered the light that guides believers.",
    date: "2024-01-12",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
  },
  {
    id: "3",
    title: "Ramadan Preparation: Spiritual Guidelines",
    category: "Books",
    excerpt: "Essential reading for preparing your heart and mind for the blessed month of Ramadan.",
    date: "2024-01-10",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&q=80",
  },
];

export function FeaturedContent() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Explore Our <span className="text-primary">Resources</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover a wealth of Islamic knowledge through our carefully organized categories
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Link key={feature.title} to={feature.href} className="group">
              <Card className={cn(
                "card-elevated h-full border-0 overflow-hidden",
                "animate-slide-up"
              )} style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="pb-2">
                  <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4", feature.color)}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="font-heading text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                  <div className="mt-4 flex items-center text-primary font-medium text-sm">
                    Explore
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Posts */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl md:text-3xl text-foreground">Recent Posts</h3>
            <Button variant="outline" asChild>
              <Link to="/posts">View All Posts</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post, index) => (
              <Link key={post.id} to={`/posts/${post.id}`} className="group">
                <Card className={cn(
                  "card-elevated h-full border-0 overflow-hidden",
                  "animate-slide-up"
                )} style={{ animationDelay: `${(index + 3) * 100}ms` }}>
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <CardTitle className="font-heading text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2">
                      {post.excerpt}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
