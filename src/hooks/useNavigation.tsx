import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  id: string;
  title: string;
  url: string;
  parent_id: string | null;
  sort_order: number;
  is_visible: boolean;
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
      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      // Transform flat list into nested structure
      const items = data as NavItem[];
      const parentItems = items.filter((item) => !item.parent_id);
      
      const navigationItems: NavigationItem[] = parentItems.map((parent) => {
        const children = items
          .filter((item) => item.parent_id === parent.id)
          .map((child) => ({
            title: child.title,
            href: child.url,
          }));

        return {
          title: parent.title,
          href: parent.url,
          ...(children.length > 0 && { children }),
        };
      });

      return navigationItems;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}