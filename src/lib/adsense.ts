type AdSenseParsedUnit = {
  client?: string;
  slot?: string;
  format?: string;
  fullWidthResponsive?: string;
  style?: string;
  layoutKey?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function getAttr(tag: string, attr: string): string | undefined {
  const re = new RegExp(`${attr}\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`, "i");
  const m = tag.match(re);
  if (!m) return undefined;
  return m[1].replace(/^['"]|['"]$/g, "");
}

export function extractAdSenseClientIdFromCode(code: string): string | null {
  // Try script URL first: ...adsbygoogle.js?client=ca-pub-xxxx
  const scriptClient = code.match(/adsbygoogle\.js\?client=([^"'\s&]+)/i)?.[1];
  if (scriptClient) return scriptClient;

  // Try <ins data-ad-client="ca-pub-xxxx">
  const insTag = code.match(/<ins\b[^>]*class=(?:"|')adsbygoogle(?:"|')[^>]*>/i)?.[0];
  const insClient = insTag ? getAttr(insTag, "data-ad-client") : undefined;
  return insClient ?? null;
}

export function parseAdSenseUnitFromCode(code: string): AdSenseParsedUnit | null {
  const insTag = code.match(/<ins\b[^>]*class=(?:"|')adsbygoogle(?:"|')[^>]*>/i)?.[0];
  if (!insTag) return null;

  return {
    client: getAttr(insTag, "data-ad-client"),
    slot: getAttr(insTag, "data-ad-slot"),
    format: getAttr(insTag, "data-ad-format"),
    fullWidthResponsive: getAttr(insTag, "data-full-width-responsive"),
    style: getAttr(insTag, "style"),
    layoutKey: getAttr(insTag, "data-ad-layout-key"),
  };
}

export function ensureAdSenseScript(clientId: string) {
  if (typeof document === "undefined") return;
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]`
  );
  if (existing) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

export function renderAdSenseUnit(container: HTMLElement, unit: AdSenseParsedUnit) {
  // Check if container already has an ad
  if (container.querySelector('.adsbygoogle[data-adsbygoogle-status]')) {
    return; // Ad already rendered
  }
  
  // Clear previous renders
  container.innerHTML = "";

  const ins = document.createElement("ins");
  ins.className = "adsbygoogle";
  
  // Set style for proper sizing - ensure minimum width for responsive ads
  const baseStyle = "display:block;min-width:300px;";
  ins.setAttribute("style", unit.style ? `${baseStyle}${unit.style}` : baseStyle);
  
  if (unit.client) ins.setAttribute("data-ad-client", unit.client);
  if (unit.slot) ins.setAttribute("data-ad-slot", unit.slot);
  if (unit.format) ins.setAttribute("data-ad-format", unit.format);
  if (unit.fullWidthResponsive)
    ins.setAttribute("data-full-width-responsive", unit.fullWidthResponsive);
  if (unit.layoutKey)
    ins.setAttribute("data-ad-layout-key", unit.layoutKey);

  container.appendChild(ins);

  // Trigger render with a small delay to ensure DOM is ready
  window.adsbygoogle = window.adsbygoogle || [];
  
  // Use setTimeout to ensure the element is in the DOM and has layout
  setTimeout(() => {
    try {
      window.adsbygoogle?.push({});
    } catch {
      // If AdSense blocks rendering (domain not ready, adblock, etc.), fail silently.
    }
  }, 100);
}
