import { Layout } from "@/components/layout/Layout";
import { HeroSlider } from "@/components/home/HeroSlider";
import { AboutPreview } from "@/components/home/AboutPreview";
import { FeaturedContent } from "@/components/home/FeaturedContent";
import { PreFooterAd } from "@/components/home/PreFooterAd";
import { AdPlaceholder } from "@/components/shared/AdPlaceholder";

const Index = () => {
  return (
    <Layout>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Below Hero Ad */}
      <section className="py-6 bg-cream">
        <div className="container mx-auto px-4">
          <AdPlaceholder size="horizontal" label="Below Hero Banner" />
        </div>
      </section>

      {/* About Preview Section */}
      <AboutPreview />

      {/* Featured Content & Recent Posts */}
      <FeaturedContent />

      {/* Pre-Footer Ad */}
      <PreFooterAd />
    </Layout>
  );
};

export default Index;
