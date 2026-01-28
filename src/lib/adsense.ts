type AdSenseParsedUnit = {
  client?: string;
  slot?: string;
  format?: string;
  fullWidthResponsive?: string;
  style?: string;
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
  };
}

export function ensureAdSenseScript(clientId: string) {
  if (typeof document === "undefined") return;
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"][src*="client=${clientId}"]`
  );
  if (existing) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

export function renderAdSenseUnit(container: HTMLElement, unit: AdSenseParsedUnit) {
  // Clear previous renders
  container.innerHTML = "";

  const ins = document.createElement("ins");
  ins.className = "adsbygoogle";
  // Keep provided style if present, otherwise ensure block display.
  ins.setAttribute("style", unit.style || "display:block");
  if (unit.client) ins.setAttribute("data-ad-client", unit.client);
  if (unit.slot) ins.setAttribute("data-ad-slot", unit.slot);
  if (unit.format) ins.setAttribute("data-ad-format", unit.format);
  if (unit.fullWidthResponsive)
    ins.setAttribute("data-full-width-responsive", unit.fullWidthResponsive);

  container.appendChild(ins);

  // Trigger render
  window.adsbygoogle = window.adsbygoogle || [];
  try {
    window.adsbygoogle.push({});
  } catch {
    // If AdSense blocks rendering (domain not ready, adblock, etc.), fail silently.
  }
}
