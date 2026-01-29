import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  id: string;
  title: string;
  url: string;
  parent_id: string | null;
  sort_order: number;
  is_visible: boolean;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
}

export interface NavigationItem {
  title: string;
  href: string;
  children?: { title: string; href: string }[];
}

export function useNavigation() {
  return useQuery({
    queryKey: ["navigation"],
    queryFn: async () => {
      // Fetch navigation items
      const { data: navData, error: navError } = await supabase
        .from("navigation_items")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (navError) throw navError;

      // Fetch all categories for building hierarchy
      const { data: categoriesData, error: catError } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id, sort_order")
        .order("sort_order", { ascending: true });

      if (catError) throw catError;

      const items = navData as NavItem[];
      const categories = (categoriesData || []) as Category[];
      const parentItems = items.filter((item) => !item.parent_id);
      
      const navigationItems: NavigationItem[] = await Promise.all(
        parentItems.map(async (parent) => {
          // Get manually added children from navigation_items
          const manualChildren = items
            .filter((item) => item.parent_id === parent.id)
            .map((child) => ({
              title: child.title,
              href: child.url,
            }));

          // If this nav item is linked to a category, get category's children
          let categoryChildren: { title: string; href: string }[] = [];
          if (parent.category_id) {
            const linkedCategory = categories.find(c => c.id === parent.category_id);
            if (linkedCategory) {
              // Get child categories
              const childCategories = categories.filter(c => c.parent_id === linkedCategory.id);
              
              // Build URLs based on whether parent is top-level or nested
              categoryChildren = childCategories.map(child => {
                // Check if the linked category has a parent (is it a subcategory?)
                if (linkedCategory.parent_id) {
                  const grandparent = categories.find(c => c.id === linkedCategory.parent_id);
                  if (grandparent?.slug === "dars-e-quran") {
                    return {
                      title: child.name,
                      href: `/dars-e-quran/${linkedCategory.slug}/${child.slug}`,
                    };
                  }
                  return {
                    title: child.name,
                    href: `/${linkedCategory.slug}/${child.slug}`,
                  };
                }
                // Linked category is top-level
                if (linkedCategory.slug === "dars-e-quran") {
                  return {
                    title: child.name,
                    href: `/dars-e-quran/${child.slug}`,
                  };
                }
                return {
                  title: child.name,
                  href: `/${linkedCategory.slug}/${child.slug}`,
                };
              });
            }
          }

          // Combine manual children and category children
          const allChildren = [...manualChildren, ...categoryChildren];

          return {
            title: parent.title,
            href: parent.url,
            ...(allChildren.length > 0 && { children: allChildren }),
          };
        })
      );

      return navigationItems;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}