// Minimal, dependency-free event tracker.
//
// The site has no analytics installed yet. This forwards events to whichever
// of the common tools is present on the page, so the pricing experiment can be
// read from GA4, Plausible, Vercel Analytics or GTM as soon as one is added
// to app/layout.js. Until then, events are logged to the console in dev.
export function track(name, data = {}) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") window.gtag("event", name, data);
    if (typeof window.plausible === "function") {
      window.plausible(name, { props: data });
    }
    if (typeof window.va === "function") window.va("event", { name, data });
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...data });
    }
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[track]", name, data);
    }
  } catch {
    /* never let analytics break the page */
  }
}
