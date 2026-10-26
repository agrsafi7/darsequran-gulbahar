import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AdPlaceholder } from "@/components/shared/AdPlaceholder";
import { siteConfig } from "@/lib/siteConfig";

const LAST_UPDATED = "October 26, 2026";

interface Section {
  title: string;
  body: React.ReactNode;
}

const sections: Section[] = [
  {
    title: "Information We Collect",
    body: (
      <p>
        We do not ask visitors to create accounts. When you browse the site, we
        automatically receive anonymous usage information such as pages visited,
        browser type, device type, and approximate location. If you contact us
        through the contact page, we receive only the details you send us.
      </p>
    ),
  },
  {
    title: "Cookies",
    body: (
      <p>
        This site uses cookies for basic site functions, for understanding how
        visitors use the site, and for advertising.
      </p>
    ),
  },
  {
    title: "Google Analytics",
    body: (
      <p>
        We use Google Analytics (GA4) to understand how visitors use the site,
        for example which lessons are read most. Google Analytics uses cookies
        and collects anonymous usage data; it does not identify you personally.
        You can opt out with Google's browser add-on at{" "}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener noreferrer"
        >
          tools.google.com/dlpage/gaoptout
        </a>
        .
      </p>
    ),
  },
  {
    title: "Google AdSense and Advertising",
    body: (
      <p>
        This site shows ads served by Google AdSense. Google and its advertising
        partners use cookies, including the DART cookie, to show ads based on
        your visits to this and other websites. You can manage or turn off
        personalised ads in your Google ad settings at{" "}
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          adssettings.google.com
        </a>
        , and learn more about advertising opt-outs at{" "}
        <a
          href="https://www.aboutads.info"
          target="_blank"
          rel="noopener noreferrer"
        >
          www.aboutads.info
        </a>
        .
      </p>
    ),
  },
  {
    title: "How We Share Information",
    body: (
      <p>
        We do not sell your personal information. Anonymous analytics data is
        processed by Google under its own privacy policy.
      </p>
    ),
  },
  {
    title: "Children's Privacy",
    body: (
      <p>
        This site is for general audiences. We do not knowingly collect personal
        information from children under 13.
      </p>
    ),
  },
  {
    title: "Changes to This Policy",
    body: (
      <p>
        We may update this policy from time to time. The date above shows the
        latest version.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p>
        Questions about this policy can be sent through our Contact page at{" "}
        <Link to="/contact">{siteConfig.domain}/contact</Link>.
      </p>
    ),
  },
];

const PrivacyPolicy = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-4 text-shadow-lg">
              Privacy Policy
            </h1>
            <p className="text-lg text-primary-foreground/90 text-shadow mb-4">
              {siteConfig.name}
            </p>
            <p className="inline-block rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground/90">
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {siteConfig.name} ({siteConfig.domain.replace("https://", "")})
                shares the teachings of the Quran in simple Pashto and Urdu. This
                policy explains what information we collect and how it is used.
              </p>

              <div className="space-y-10">
                {sections.map((section) => (
                  <article key={section.title}>
                    <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-3">
                      {section.title}
                    </h2>
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      {section.body}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <AdPlaceholder size="vertical" location="sidebar" label="Sidebar Ad" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
