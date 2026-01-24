import { Layout } from "@/components/layout/Layout";
import { AdPlaceholder } from "@/components/shared/AdPlaceholder";

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 text-shadow-lg">
              About Us
            </h1>
            <p className="text-xl text-primary-foreground/90 text-shadow">
              Dedicated to spreading authentic Islamic knowledge through the teachings of the Quran
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 prose prose-lg max-w-none">
              <h2 className="font-heading text-3xl text-foreground mb-6">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
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

              <h2 className="font-heading text-3xl text-foreground mb-6 mt-12">What We Offer</h2>
              
              <h3 className="font-heading text-xl text-foreground mb-4">Dars-e-Quran Sessions</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our Dars-e-Quran sessions provide in-depth explanations of Quranic verses, 
                combining classical tafseer with contemporary relevance. Whether you're a 
                beginner or an advanced student, our lessons cater to all levels of understanding.
              </p>

              <h3 className="font-heading text-xl text-foreground mb-4">Scholarly Speeches</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access a rich library of lectures and speeches delivered by learned scholars, 
                covering topics from Islamic jurisprudence to spiritual development and 
                contemporary issues facing the Muslim ummah.
              </p>

              <h3 className="font-heading text-xl text-foreground mb-4">Islamic Literature</h3>
              <p className="text-muted-foreground leading-relaxed">
                Explore our carefully selected collection of books that cover various aspects 
                of Islamic knowledge, from foundational texts to specialized works on specific 
                subjects.
              </p>

              {/* In-Content Ad */}
              <div className="my-8">
                <AdPlaceholder size="horizontal" label="In-Content Ad" />
              </div>

              <h2 className="font-heading text-3xl text-foreground mb-6 mt-12">Our Values</h2>
              <ul className="text-muted-foreground space-y-3">
                <li><strong>Authenticity:</strong> We prioritize authentic Islamic scholarship rooted in the Quran and Sunnah.</li>
                <li><strong>Accessibility:</strong> Knowledge should be available to everyone, free from barriers.</li>
                <li><strong>Excellence:</strong> We strive for the highest quality in all our educational content.</li>
                <li><strong>Community:</strong> Building a supportive community of learners seeking knowledge together.</li>
              </ul>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <AdPlaceholder size="vertical" label="Sidebar Ad" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
