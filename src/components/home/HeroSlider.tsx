import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Slide {
  id: string;
  image_url: string;
  heading: string | null;
  subtext: string | null;
}

// Demo slides - used when database is empty or unavailable
const demoSlides: Slide[] = [
  {
    id: "1",
    image_url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1920&q=80",
    heading: "Discover the Beauty of Quranic Wisdom",
    subtext: "Join our comprehensive Dars-e-Quran sessions and deepen your understanding",
  },
  {
    id: "2",
    image_url: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1920&q=80",
    heading: "Learn from Authentic Scholars",
    subtext: "Access centuries of Islamic knowledge through our curated lectures and speeches",
  },
  {
    id: "3",
    image_url: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=1920&q=80",
    heading: "A Journey of Spiritual Growth",
    subtext: "Explore our library of Islamic books and educational resources",
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: dbSlides, isLoading } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Slide[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const slides = dbSlides && dbSlides.length > 0 ? dbSlides : demoSlides;

  const goToSlide = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, slides.length, goToSlide]);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (isLoading) {
    return (
      <section className="relative w-full h-[60vh] min-h-[400px] max-h-[700px] overflow-hidden flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section className="relative w-full h-[60vh] min-h-[400px] max-h-[700px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {/* Background Image */}
          <div 
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-transform duration-[8s]",
              index === currentSlide && "slide-animate"
            )}
            style={{ backgroundImage: `url(${slide.image_url})` }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 hero-overlay" />
          
          {/* Islamic Pattern Overlay */}
          <div className="absolute inset-0 pattern-bg opacity-20" />

          {/* Content */}
          <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
            <div 
              className={cn(
                "max-w-3xl text-primary-foreground",
                index === currentSlide && "animate-slide-up"
              )}
            >
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 text-shadow-lg leading-tight">
                {slide.heading || "Welcome"}
              </h2>
              {slide.subtext && (
                <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 text-shadow max-w-2xl">
                  {slide.subtext}
                </p>
              )}
              <div className="mt-8 flex gap-4">
                <Button 
                  size="lg" 
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-gold"
                >
                  Explore Dars-e-Quran
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/50 text-white bg-transparent hover:bg-white/10 backdrop-blur-sm"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentSlide 
                ? "w-8 bg-accent" 
                : "w-2 bg-primary-foreground/40 hover:bg-primary-foreground/60"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}