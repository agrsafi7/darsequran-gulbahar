import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Copy, Share2, ExternalLink } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/lib/siteConfig";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_description: string | null;
}

interface ContactSettings {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

const LOCATION = {
  lat: 34.0084358,
  lng: 71.5931517,
  name: "Ishaat Ul Quran Gulbahar",
  address: "2H5V+97C, Gulbahar, Peshawar, Pakistan",
  shareUrl: "https://maps.app.goo.gl/qv7qKkfGrbhj7ju77",
};


const Contact = () => {
  const [page, setPage] = useState<Page | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactSettings>({
    address: "",
    phone: "",
    email: "",
    hours: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [pageResult, settingsResult] = await Promise.all([
      supabase
        .from("pages")
        .select("*")
        .eq("slug", "contact")
        .eq("status", "published")
        .maybeSingle(),
      supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["contact_address", "contact_phone", "contact_email", "contact_hours"]),
    ]);

    if (!pageResult.error && pageResult.data) {
      setPage(pageResult.data);
    }

    if (!settingsResult.error && settingsResult.data) {
      const settingsMap: Record<string, string> = {};
      settingsResult.data.forEach((item) => {
        settingsMap[item.key] = item.value || "";
      });
      setContactInfo({
        address: settingsMap.contact_address || "",
        phone: settingsMap.contact_phone || "",
        email: settingsMap.contact_email || "",
        hours: settingsMap.contact_hours || "",
      });
    }

    setLoading(false);
  };

  // Keyless Google Maps embed (no API key required) — query by name so the
  // place label/marker title is visible on the map.
  const mapQuery = `${LOCATION.name}, ${LOCATION.address}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&ll=${LOCATION.lat},${LOCATION.lng}&z=16&hl=en&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapQuery
  )}`;

  const displayAddress = contactInfo.address || LOCATION.address;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${LOCATION.name}, ${displayAddress}`);
      toast.success("Address copied to clipboard");
    } catch {
      toast.error("Could not copy the address");
    }
  };

  const handleShareLocation = async () => {
    const shareData = {
      title: LOCATION.name,
      text: `${LOCATION.name} — ${displayAddress}`,
      url: LOCATION.shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(LOCATION.shareUrl);
      toast.success("Location link copied to clipboard");
    } catch {
      // user cancelled share sheet — no error needed
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: siteConfig.name,
    alternateName: LOCATION.name,
    url: `${siteConfig.domain}/contact`,
    hasMap: LOCATION.shareUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: LOCATION.address,
      addressLocality: "Peshawar",
      addressRegion: "Khyber Pakhtunkhwa",
      addressCountry: "PK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: LOCATION.lat,
      longitude: LOCATION.lng,
    },
    ...(contactInfo.phone ? { telephone: contactInfo.phone } : {}),
    ...(contactInfo.email ? { email: contactInfo.email } : {}),
    ...(contactInfo.hours ? { openingHours: contactInfo.hours } : {}),
  };

  return (
    <Layout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div className="max-w-3xl">
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 text-shadow-lg">
                {page?.title || "Contact Us"}
              </h1>
              {page?.meta_description && (
                <p className="text-xl text-primary-foreground/90 text-shadow">
                  {page.meta_description}
                </p>
              )}
            </div>
            <div className="flex justify-center md:justify-end">
              <img
                src={contactIllustration}
                alt="Illustration of a mosque dome with an envelope and location pin"
                width={1024}
                height={1024}
                loading="lazy"
                className="w-40 sm:w-52 md:w-full md:max-w-[280px] lg:max-w-[340px] h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Map + Contact Info side by side on large screens */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Dynamic Content from Database */}
            <div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pageContent ? (
                <div
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: pageContent }}
                />
              ) : null}
            </div>


            {/* Right Column: Map + Contact Information Cards */}
            <div className="space-y-8 lg:sticky lg:top-24">
              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-border shadow-lg bg-card">
                <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-heading text-xl md:text-2xl text-foreground">
                      Our Location
                    </h2>
                    <p className="text-sm text-muted-foreground truncate">{LOCATION.name}</p>
                  </div>
                </div>
                <div
                  role="region"
                  aria-label={`Map showing the location of ${LOCATION.name} in Gulbahar, Peshawar`}
                  className="w-full h-[260px] sm:h-[320px] lg:h-[380px] xl:h-[420px]"
                >
                  <iframe
                    title={`Google Map of ${LOCATION.name}, ${LOCATION.address}`}
                    aria-label={`Google Map of ${LOCATION.name}, ${LOCATION.address}`}
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 border-t border-border space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {LOCATION.name} — {LOCATION.address}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="default" size="sm">
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${LOCATION.name} in Google Maps in a new tab`}
                      >
                        <ExternalLink className="w-4 h-4 mr-1.5" />
                        Open in Google Maps
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopyAddress}>
                      <Copy className="w-4 h-4 mr-1.5" />
                      Copy address
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShareLocation}>
                      <Share2 className="w-4 h-4 mr-1.5" />
                      Share location
                    </Button>
                  </div>
                </div>
              </div>


              {/* Contact Information Cards */}
              <div>
                <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-6">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="card-elevated border-0">
                    <CardHeader className="pb-2">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm whitespace-pre-line">
                        {contactInfo.address || "Address not set"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated border-0">
                    <CardHeader className="pb-2">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Phone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm whitespace-pre-line">
                        {contactInfo.phone || "Phone not set"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated border-0">
                    <CardHeader className="pb-2">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Email</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm whitespace-pre-line">
                        {contactInfo.email || "Email not set"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated border-0">
                    <CardHeader className="pb-2">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm whitespace-pre-line">
                        {contactInfo.hours || "Hours not set"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
