import { Link } from "react-router-dom";
import { Facebook, Youtube, Mail, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";

const navigationLinks = [
  { title: "Home", href: "/" },
  { title: "About Us", href: "/about" },
  { title: "Dars-e-Quran", href: "/dars-e-quran" },
  { title: "Speeches", href: "/speeches" },
  { title: "Books", href: "/books" },
  { title: "Contact Us", href: "/contact" },
];

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/darsequrangulbaharpeshawar", label: "Facebook", color: "bg-[#1877F2] hover:bg-[#166FE5]" },
  { icon: Youtube, href: "https://www.youtube.com/@darsequrangulbaharpeshawar", label: "YouTube", color: "bg-[#FF0000] hover:bg-[#E60000]" },
  { icon: MessageCircle, href: "https://whatsapp.com/channel/0029Va8kjzj1dAvzifTP8X2o", label: "WhatsApp Channel", color: "bg-[#25D366] hover:bg-[#20BD5A]" },
  { icon: Mail, href: "mailto:darsequrangulbahar@gmail.com", label: "Email", color: "bg-[#EA4335] hover:bg-[#D33426]" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-gradient text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Logo & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={logo} 
                alt="DarseQuran Gulbahar Peshawar" 
                className="w-14 h-14 object-contain bg-white rounded-full p-1"
              />
              <div>
                <h2 className="font-heading text-lg text-primary-foreground">DarseQuran Gulbahar Peshawar</h2>
                <p className="text-xs text-primary-foreground/60">مرکز اشاعت القرآن گلبہار</p>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/80 leading-relaxed max-w-sm">
              Spreading the true meaning of Quran in simple method and interpreting Islam 
              according to the teachings of Quran and Sunnah in Pashto and Urdu languages.
            </p>
          </div>

          {/* Middle Column - Navigation */}
          <div>
            <h3 className="font-heading text-lg mb-4 text-accent">Quick Links</h3>
            <nav>
              <ul className="grid grid-cols-2 gap-2">
                {navigationLinks.map((link) => (
                  <li key={link.title}>
                    <Link
                      to={link.href}
                      className="text-sm text-primary-foreground/80 hover:text-accent transition-colors duration-200 inline-block py-1"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right Column - Social Links */}
          <div>
            <h3 className="font-heading text-lg mb-4 text-accent">Connect With Us</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-12 h-12 rounded-full ${social.color} flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl`}
                >
                  <social.icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-sm text-primary-foreground/60">
                Subscribe to our newsletter for updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-primary-foreground/60 text-center">
            © {currentYear} DarseQuran Gulbahar Peshawar — All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
