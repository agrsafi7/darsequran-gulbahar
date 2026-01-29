import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useNavigation, NavigationItem } from "@/hooks/useNavigation";
import { siteConfig } from "@/lib/siteConfig";

// Fallback navigation when database is unavailable
const fallbackNavigation: NavigationItem[] = [
  { title: "Home", href: "/" },
  { title: "About Us", href: "/about" },
  { title: "Dars-e-Quran", href: "/dars-e-quran" },
  { title: "Speeches", href: "/speeches" },
  { title: "Books", href: "/books" },
  { title: "Contact Us", href: "/contact" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { data: navigationItems, isLoading, isError } = useNavigation();

  const items = navigationItems && navigationItems.length > 0 ? navigationItems : fallbackNavigation;

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <a href={siteConfig.domain} className="flex items-center gap-2 sm:gap-3 group">
            <img 
              src={logo} 
              alt={siteConfig.name} 
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain"
            />
            <div>
              <h1 className="font-heading text-sm sm:text-lg lg:text-xl text-primary leading-tight">
                {siteConfig.name}
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{siteConfig.subtitle}</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  {items.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      {item.children ? (
                        <>
                          <NavigationMenuTrigger 
                            className={cn(
                              "nav-link bg-transparent hover:bg-secondary/50",
                              isActive(item.href) && "text-primary font-semibold"
                            )}
                          >
                            {item.title}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="grid w-48 gap-1 p-2 bg-card rounded-lg shadow-lg border border-border">
                              {item.children.map((child) => (
                                <li key={child.title}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      to={child.href}
                                      className={cn(
                                        "block select-none rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors",
                                        "hover:bg-secondary hover:text-primary focus:bg-secondary",
                                        isActive(child.href) && "bg-secondary text-primary font-medium"
                                      )}
                                    >
                                      {child.title}
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink asChild>
                          {item.href === "/" ? (
                            <a
                              href={siteConfig.domain}
                              className={cn(
                                "nav-link inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                                "hover:bg-secondary/50 hover:text-primary focus:bg-secondary/50",
                                isActive(item.href) && "text-primary font-semibold active"
                              )}
                            >
                              {item.title}
                            </a>
                          ) : (
                            <Link
                              to={item.href}
                              className={cn(
                                "nav-link inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                                "hover:bg-secondary/50 hover:text-primary focus:bg-secondary/50",
                                isActive(item.href) && "text-primary font-semibold active"
                              )}
                            >
                              {item.title}
                            </Link>
                          )}
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden pb-4 animate-slide-down">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.title}>
                    {item.children ? (
                      <div>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === item.title ? null : item.title)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-md px-4 py-3 text-sm font-medium transition-colors",
                            "hover:bg-secondary/50 hover:text-primary",
                            isActive(item.href) && "text-primary font-semibold"
                          )}
                        >
                          {item.title}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              openDropdown === item.title && "rotate-180"
                            )}
                          />
                        </button>
                        {openDropdown === item.title && (
                          <ul className="ml-4 mt-1 space-y-1 animate-slide-down">
                            {item.children.map((child) => (
                              <li key={child.title}>
                                <Link
                                  to={child.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={cn(
                                    "block rounded-md px-4 py-2 text-sm transition-colors",
                                    "hover:bg-secondary/50 hover:text-primary",
                                    isActive(child.href) && "bg-secondary text-primary font-medium"
                                  )}
                                >
                                  {child.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : item.href === "/" ? (
                      <a
                        href={siteConfig.domain}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "block rounded-md px-4 py-3 text-sm font-medium transition-colors",
                          "hover:bg-secondary/50 hover:text-primary",
                          isActive(item.href) && "text-primary font-semibold bg-secondary/30"
                        )}
                      >
                        {item.title}
                      </a>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "block rounded-md px-4 py-3 text-sm font-medium transition-colors",
                          "hover:bg-secondary/50 hover:text-primary",
                          isActive(item.href) && "text-primary font-semibold bg-secondary/30"
                        )}
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}