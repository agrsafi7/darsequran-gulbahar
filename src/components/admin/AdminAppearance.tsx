import { useEffect, type ReactNode } from "react";
import "./admin.css";

// Body-scoped tokens also reach Radix dialogs/menus rendered in portals.
// Never change the public site's theme class or stored preference.
export function AdminAppearance({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  useEffect(() => {
    const previousArea = document.body.getAttribute("data-admin");
    const previousTheme = document.body.getAttribute("data-admin-theme");
    document.body.setAttribute("data-admin", "true");
    document.body.setAttribute("data-admin-theme", dark ? "dark" : "light");
    return () => {
      if (previousArea === null) document.body.removeAttribute("data-admin");
      else document.body.setAttribute("data-admin", previousArea);
      if (previousTheme === null) document.body.removeAttribute("data-admin-theme");
      else document.body.setAttribute("data-admin-theme", previousTheme);
    };
  }, [dark]);

  return <>{children}</>;
}