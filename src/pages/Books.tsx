import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdPlaceholder } from "@/components/shared/AdPlaceholder";
import { BookOpen, Download } from "lucide-react";

const books = [
  {
    id: "1",
    title: "Understanding the Quran: A Beginner's Guide",
    author: "Sheikh Abdullah bin Ahmad",
    pages: 245,
    description: "A comprehensive introduction to Quranic studies for those beginning their journey.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80",
  },
  {
    id: "2",
    title: "The Life of Prophet Muhammad (PBUH)",
    author: "Dr. Fatima Al-Hassan",
    pages: 380,
    description: "An authentic biography of the Prophet based on classical Islamic sources.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
  },
  {
    id: "3",
    title: "Islamic Jurisprudence Made Easy",
    author: "Mufti Ibrahim Khan",
    pages: 290,
    description: "A practical guide to understanding fiqh and its application in daily life.",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80",
  },
  {
    id: "4",
    title: "Spiritual Growth in Islam",
    author: "Sheikh Ahmad Al-Qadri",
    pages: 210,
    description: "A journey through Islamic spirituality and self-improvement.",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&q=80",
  },
];

const Books = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 text-shadow-lg">
              Books
            </h1>
            <p className="text-xl text-primary-foreground/90 text-shadow">
              A curated collection of Islamic literature covering faith, jurisprudence, and spirituality
            </p>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-6">
                {books.map((book, index) => (
                  <Card 
                    key={book.id} 
                    className="card-elevated border-0 overflow-hidden animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-40 h-48 sm:h-auto overflow-hidden flex-shrink-0">
                        <img
                          src={book.image}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <CardHeader>
                          <CardTitle className="font-heading text-xl">
                            {book.title}
                          </CardTitle>
                          <CardDescription>
                            by {book.author} • {book.pages} pages
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">
                            {book.description}
                          </p>
                          <div className="flex gap-3">
                            <Button size="sm" variant="outline">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Read Online
                            </Button>
                            <Button size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </div>
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

export default Books;
