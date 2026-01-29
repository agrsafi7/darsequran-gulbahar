import { useState, useEffect, forwardRef, useRef } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  ensureAdSenseScript,
  extractAdSenseClientIdFromCode,
  parseAdSenseUnitFromCode,
  renderAdSenseUnit,
} from "@/lib/adsense";

export const MobileStickyAd = forwardRef<HTMLDivElement>((_, ref) => {
  const [adCode, setAdCode] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const adRenderedRef = useRef(false);
  const adContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchAdSettings();
  }, []);

  useEffect(() => {
    if (!adCode || !isEnabled || isDismissed || adRenderedRef.current) return;
    
    const unit = parseAdSenseUnitFromCode(adCode);
    const clientId = extractAdSenseClientIdFromCode(adCode);
    
    if (!unit || !clientId || !adContainerRef.current) return;
    
    const attemptRender = () => {
      if (adRenderedRef.current || !adContainerRef.current) return;
      
      const rect = adContainerRef.current.getBoundingClientRect();
      if (rect.width > 0) {
        ensureAdSenseScript(clientId);
        renderAdSenseUnit(adContainerRef.current, unit);
        adRenderedRef.current = true;
      } else {
        requestAnimationFrame(attemptRender);
      }
    };
    
    requestAnimationFrame(attemptRender);
  }, [adCode, isEnabled, isDismissed]);

  const fetchAdSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["ad_code_mobile", "ad_enabled_mobile"]);

    if (!error && data) {
      const codeItem = data.find(d => d.key === "ad_code_mobile");
      const enabledItem = data.find(d => d.key === "ad_enabled_mobile");
      
      setAdCode(codeItem?.value || null);
      setIsEnabled(enabledItem?.value === "true");
    }
    
    setLoading(false);
  };

  // Don't render if loading, disabled, dismissed, or no ad code
  if (loading || !isEnabled || !adCode || isDismissed) {
    return null;
  }

  const unit = parseAdSenseUnitFromCode(adCode);
  const clientId = extractAdSenseClientIdFromCode(adCode);

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg",
        "lg:hidden", // Only show on mobile/tablet, hide on desktop
        "safe-area-inset-bottom" // Account for iOS safe area
      )}
      ref={ref}
    >
      <div className="relative">
        {/* Dismiss button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute -top-8 right-2 p-1.5 bg-background/90 rounded-full border border-border shadow-sm hover:bg-muted transition-colors"
          aria-label="Close ad"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
        
        {/* Ad content */}
        {unit && clientId ? (
          <div
            className="p-2 flex items-center justify-center min-h-[60px]"
            ref={adContainerRef}
          />
        ) : (
          <div
            className="p-2 flex items-center justify-center min-h-[60px]"
            dangerouslySetInnerHTML={{ __html: adCode }}
          />
        )}
      </div>
    </div>
  );
});

MobileStickyAd.displayName = "MobileStickyAd";
