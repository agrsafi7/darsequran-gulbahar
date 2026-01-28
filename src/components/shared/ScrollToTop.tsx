import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Component that scrolls to top on route change
 * Place this inside BrowserRouter to automatically scroll to top when navigating
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}
