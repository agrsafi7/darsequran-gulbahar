// Google Analytics 4 Event Tracking Utility

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type GA4EventParams = Record<string, string | number | boolean | undefined>;

/**
 * Send a custom event to Google Analytics 4
 */
export function trackEvent(eventName: string, params?: GA4EventParams): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/**
 * Track file download events
 */
export function trackDownload(
  fileName: string,
  fileType: 'audio' | 'zip' | 'torrent',
  itemId?: string
): void {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
    content_id: itemId,
  });
}

/**
 * Track audio play events (for embedded players)
 */
export function trackAudioPlay(
  title: string,
  source: 'archive' | 'youtube' | 'soundcloud' | 'spotify',
  itemId?: string
): void {
  trackEvent('audio_play', {
    content_title: title,
    audio_source: source,
    content_id: itemId,
  });
}

/**
 * Track external link clicks
 */
export function trackOutboundLink(url: string, linkText?: string): void {
  trackEvent('click', {
    link_url: url,
    link_text: linkText,
    outbound: true,
  });
}

/**
 * Track page/content views with additional context
 */
export function trackContentView(
  contentType: string,
  contentId: string,
  contentTitle?: string
): void {
  trackEvent('view_item', {
    content_type: contentType,
    content_id: contentId,
    content_title: contentTitle,
  });
}
