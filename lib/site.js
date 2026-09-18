export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://foresightgr.com.au";
export const SITE_NAME = "FOREsight";
export const SITE_TITLE =
  "Government relations for for-purpose organisations | FOREsight";
export const SITE_DESCRIPTION =
  "FOREsight gives for-purpose organisations the templates, intelligence and expert access to run their own government relations, without hiring a GR team.";
export const PARENT_ORG_NAME = "FORE Good";
export const PARENT_ORG_URL = "https://www.foregood.org.au";
export const SITE_EMAIL = "hello@foregood.org.au";

// `pack` is a one-off price for a 3-month Campaign Pack (~3x the Guided
// monthly, rounded) so "you've already paid for 3 months of Guided" holds.
export const PRICING = {
  under30k: { essentials: 20, advisory: null, pack: null },
  "30-250k": { essentials: 49, advisory: 229, pack: 690 },
  "250-1m": { essentials: 69, advisory: 299, pack: 895 },
  "1m-5m": { essentials: 99, advisory: 429, pack: 1290 },
  "5m+": { essentials: 129, advisory: 579, pack: 1740 },
};

// Name of the current pricing experiment. Lands in Calendly as utm_campaign
// so each intro-call booking can be attributed to the option (and revenue
// band) the visitor chose.
export const PRICING_EXPERIMENT = "pricing-3way-sep26";

// App checkout deep-link plans. `priceKey` is the field on PRICING; `calendly`
// is the utm_content used when that plan has no public price (Contact us).
export const SUBSCRIBE_PLANS = {
  essentials: { priceKey: "essentials", calendly: "essentials" },
  guided: { priceKey: "advisory", calendly: "guided" },
  pack: { priceKey: "pack", calendly: "campaign-pack" },
};

export const INTRO_CALL_LINK =
  "https://calendly.com/lucy-foregood/new-meeting";

export const QUIZ_LINK = "https://forms.gle/Vj8GUXctRWrHs4zR6";
export const APP_LINK = "https://app.foresightgr.com.au/";
export const APP_SIGNUP_LINK = "https://app.foresightgr.com.au/?auth=signup";

export const NEWSLETTER_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfdFInTlEEPJLqlKfJ5i6GmotuX5iAVSRYtNDEBY2uu3jc84Q/formResponse";
export const NEWSLETTER_EMAIL_FIELD = "entry.902983980";

export const SIZE_TABS = [
  { id: "under30k", label: "Under 30K" },
  { id: "30-250k", label: "30 - 250K" },
  { id: "250-1m", label: "250 - 1M" },
  { id: "1m-5m", label: "1M - 5M" },
  { id: "5m+", label: "5M +" },
];

export const DEFAULT_SIZE = "30-250k";

export function formatMoney(n) {
  return "$" + n.toLocaleString("en-AU");
}

export function withParams(url, params) {
  const u = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      u.searchParams.set(key, String(value));
    }
  }
  return u.toString();
}

// Calendly keeps UTM params against the booking, so which card the visitor
// clicked (utm_content) and their revenue band (utm_term) show up in the
// event details / export without any analytics tooling.
export function introCallHref(option, size) {
  return withParams(INTRO_CALL_LINK, {
    utm_source: "foresightgr.com.au",
    utm_medium: "pricing",
    utm_campaign: PRICING_EXPERIMENT,
    utm_content: option,
    utm_term: size,
  });
}

// App deep link so Subscribe opens Advice with the plan and band pre-selected.
// Payment happens in-app Checkout. Guided and Campaign Pack at under30k have
// no public price — those stay Contact us / Calendly.
// `interval` is "month" (default, omitted) or "year"; pack ignores it.
export function subscribeHref(size, plan, data, interval) {
  const meta = SUBSCRIBE_PLANS[plan];
  const priceKey = meta?.priceKey || plan;
  const priceKnown = data[priceKey] !== null && data[priceKey] !== undefined;
  const calendlyOption = meta?.calendly || plan;

  if (!priceKnown) {
    return { href: introCallHref(calendlyOption, size), label: "Contact us" };
  }

  const params = { subscribe: plan, band: size };
  if (interval === "year" && plan !== "pack") {
    params.interval = "year";
  }

  return {
    href: withParams(APP_LINK, params),
    label: "Subscribe now",
  };
}
