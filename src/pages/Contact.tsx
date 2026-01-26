import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_description: string | null;
}

const Contact = () => {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", "contact")
      .eq("status", "published")
      .maybeSingle();

    if (!error && data) {
      setPage(data);
    }
    setLoading(false);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
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
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Dynamic Content from Database */}
            <div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : page?.content ? (
                <div
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              ) : (
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading text-3xl text-foreground mb-6">Get in Touch</h2>
                  <p className="text-muted-foreground">
                    Content coming soon. Please add content via the admin panel.
                  </p>
                </div>
              )}
            </div>

            {/* Contact Information Cards */}
            <div className="space-y-6">
              <h2 className="font-heading text-3xl text-foreground mb-6">Contact Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="card-elevated border-0">
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      123 Islamic Center Road<br />
                      City, Country 12345
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
                    <p className="text-muted-foreground text-sm">
                      +1 (234) 567-8900<br />
                      +1 (234) 567-8901
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
                    <p className="text-muted-foreground text-sm">
                      info@example.com<br />
                      support@example.com
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
                    <p className="text-muted-foreground text-sm">
                      Mon - Fri: 9am - 6pm<br />
                      Sat - Sun: 10am - 4pm
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
