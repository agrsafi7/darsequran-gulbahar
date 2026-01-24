import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdPlaceholder } from "@/components/shared/AdPlaceholder";

export function AboutPreview() {
  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              About Our Mission
            </div>
            
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
              Spreading the Light of <span className="text-primary">Islamic Knowledge</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Welcome to our Islamic Educational Platform, a dedicated space for seekers of 
              authentic Islamic knowledge. Our mission is to make the teachings of the Quran 
              and the wisdom of Islamic scholarship accessible to everyone, regardless of their 
              background or location.
            </p>
            
            <p className="text-muted-foreground leading-relaxed">
              Through our comprehensive Dars-e-Quran sessions, insightful speeches, and carefully 
              curated books, we aim to nurture spiritual growth and foster a deeper understanding 
              of Islam. Our platform serves as a bridge connecting hearts to the timeless guidance 
              of the Quran.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg hero-gradient flex items-center justify-center">
                  <span className="text-primary-foreground font-heading text-xl">📖</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">100+</p>
                  <p className="text-sm text-muted-foreground">Quran Lessons</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg hero-gradient flex items-center justify-center">
                  <span className="text-primary-foreground font-heading text-xl">🎙️</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">50+</p>
                  <p className="text-sm text-muted-foreground">Speeches</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg hero-gradient flex items-center justify-center">
                  <span className="text-primary-foreground font-heading text-xl">📚</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">25+</p>
                  <p className="text-sm text-muted-foreground">Books</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button asChild className="group">
                <Link to="/about">
                  Read More About Us
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Ad Placeholder - 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AdPlaceholder size="vertical" label="Sidebar Ad" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
