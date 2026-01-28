import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AdSize = "horizontal" | "vertical" | "square" | "leaderboard";
type AdLocation = "header" | "sidebar" | "in_content" | "footer" | "mobile";

interface AdPlaceholderProps {
  size: AdSize;
  location: AdLocation;
  className?: string;
  label?: string;
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

export function AdPlaceholder({ size, location, className, label = "Advertisement" }: AdPlaceholderProps) {
  const [adCode, setAdCode] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdSettings();
  }, [location]);

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

  // If ad is enabled and has code, render the actual ad
  if (!loading && isEnabled && adCode) {
    return (
      <div
        className={cn("ad-container", className)}
        role="complementary"
        aria-label={label}
        dangerouslySetInnerHTML={{ __html: adCode }}
      />
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

  // While loading, return nothing to prevent layout shift
  return null;
}
