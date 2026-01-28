import { cn } from "@/lib/utils";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ensureAdSenseScript,
  extractAdSenseClientIdFromCode,
  parseAdSenseUnitFromCode,
  renderAdSenseUnit,
} from "@/lib/adsense";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

type AdSize = "horizontal" | "vertical" | "square" | "leaderboard";
type AdLocation = "header" | "sidebar" | "in_content" | "footer" | "mobile";

interface AdPlaceholderProps {
  size: AdSize;
  location: AdLocation;
  className?: string;
  label?: string;
  lazy?: boolean;
}

const sizeStyles: Record<AdSize, string> = {
  horizontal: "w-full h-24 sm:h-28",
  vertical: "w-full h-[300px] lg:w-[300px]",
  square: "w-[250px] h-[250px]",
  leaderboard: "w-full h-[90px]",
};

const locationToSettingKey: Record<AdLocation, { code: string; enabled: string }> = {
  header: { code: "ad_code_header", enabled: "ad_enabled_header" },
  sidebar: { code: "ad_code_sidebar", enabled: "ad_enabled_sidebar" },
  in_content: { code: "ad_code_in_content", enabled: "ad_enabled_in_content" },
  footer: { code: "ad_code_footer", enabled: "ad_enabled_footer" },
  mobile: { code: "ad_code_mobile", enabled: "ad_enabled_mobile" },
};

export function AdPlaceholder({ size, location, className, label = "Advertisement", lazy = true }: AdPlaceholderProps) {
  const [adCode, setAdCode] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [renderKey, setRenderKey] = useState(0);
  const [adRendered, setAdRendered] = useState(false);
  
  // Lazy loading: only load ad when visible
  const [containerRef, isVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: "200px", // Start loading 200px before visible
    triggerOnce: true,
  });

  useEffect(() => {
    fetchAdSettings();
  }, [location]);

  // When adCode changes, bump key to ensure the container effect re-runs cleanly.
  useEffect(() => {
    setRenderKey((k) => k + 1);
    setAdRendered(false);
  }, [adCode, isEnabled]);

  const fetchAdSettings = async () => {
    const keys = locationToSettingKey[location];
    
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [keys.code, keys.enabled]);

    if (!error && data) {
      const codeItem = data.find(d => d.key === keys.code);
      const enabledItem = data.find(d => d.key === keys.enabled);
      
      setAdCode(codeItem?.value || null);
      setIsEnabled(enabledItem?.value === "true");
    }
    
    setLoading(false);
  };

  const adContainerRef = useCallback((el: HTMLDivElement | null) => {
    if (!el || adRendered) return;
    
    const unit = parseAdSenseUnitFromCode(adCode || "");
    const clientId = extractAdSenseClientIdFromCode(adCode || "");
    
    if (unit && clientId) {
      ensureAdSenseScript(clientId);
      renderAdSenseUnit(el, unit);
      setAdRendered(true);
    }
  }, [adCode, adRendered]);

  // Determine if we should render the ad
  const shouldRender = lazy ? isVisible : true;

  // If ad is enabled and has code, render the actual ad
  if (!loading && isEnabled && adCode) {
    const unit = parseAdSenseUnitFromCode(adCode);
    const clientId = extractAdSenseClientIdFromCode(adCode);

    // If we can parse an AdSense <ins> unit, render it the right way
    if (unit && clientId) {
      return (
        <div
          ref={containerRef}
          className={cn("ad-container min-h-[90px]", className)}
          role="complementary"
          aria-label={label}
        >
          {shouldRender && (
            <div
              key={renderKey}
              ref={adContainerRef}
              className="w-full"
            />
          )}
        </div>
      );
    }

    // Fallback: render raw HTML (works for non-AdSense HTML banners)
    return (
      <div
        ref={containerRef}
        className={cn("ad-container", className)}
        role="complementary"
        aria-label={label}
      >
        {shouldRender && (
          <div dangerouslySetInnerHTML={{ __html: adCode }} />
        )}
      </div>
    );
  }

  // If ad is not configured or disabled, show placeholder (only in development)
  if (!loading && (!isEnabled || !adCode)) {
    // In production, return nothing if ads aren't configured
    if (import.meta.env.PROD) {
      return null;
    }
    
    // In development, show placeholder
    return (
      <div
        className={cn(
          "ad-placeholder",
          sizeStyles[size],
          className
        )}
        role="complementary"
        aria-label={label}
      >
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider mb-1 opacity-70">Ad Space</p>
          <p className="text-[10px] opacity-50">{label}</p>
        </div>
      </div>
    );
  }

  // While loading, return minimal placeholder to prevent layout shift
  return (
    <div 
      ref={containerRef}
      className={cn("ad-container min-h-[90px]", className)} 
    />
  );
}
