// Pricing by organisation size, sourced from the live foresightgr.com.au pricing tabs.
// "under30k" advisory price was blank on the live site at time of migration — flagged as "Contact us".
const PRICING = {
  "under30k": { essentials: 20, advisory: null },
  "30-250k": { essentials: 49, advisory: 229 },
  "250-1m": { essentials: 69, advisory: 299 },
  "1m-5m": { essentials: 99, advisory: 429 },
  "5m+": { essentials: 129, advisory: 579 },
};

// Fill each entry with the Stripe Payment Link for that organisation size + plan
// (Stripe dashboard -> Payment Links -> New, one per monthly price). Leave "" until
// created — the Subscribe button falls back to "Contact us" (the Calendly link) until then.
const STRIPE_LINKS = {
  "under30k": { essentials: "", advisory: "" },
  "30-250k": { essentials: "", advisory: "" },
  "250-1m": { essentials: "", advisory: "" },
  "1m-5m": { essentials: "", advisory: "" },
  "5m+": { essentials: "", advisory: "" },
};

const INTRO_CALL_LINK = "https://calendly.com/lucy-foregood/new-meeting";

function formatMoney(n) {
  return "$" + n.toLocaleString("en-AU");
}

function updatePricing(size) {
  const data = PRICING[size];
  if (!data) return;

  const essentialsEl = document.querySelector('[data-tier="essentials"]');
  const essentialsAnnualEl = document.querySelector('[data-tier="essentials-annual"]');
  const advisoryEl = document.querySelector('[data-tier="advisory"]');
  const advisoryAnnualEl = document.querySelector('[data-tier="advisory-annual"]');

  essentialsEl.textContent = formatMoney(data.essentials);
  essentialsAnnualEl.textContent = formatMoney(data.essentials * 10);

  if (data.advisory === null) {
    advisoryEl.textContent = "Contact us";
    advisoryAnnualEl.parentElement.style.display = "none";
  } else {
    advisoryEl.textContent = formatMoney(data.advisory);
    advisoryAnnualEl.textContent = formatMoney(data.advisory * 10);
    advisoryAnnualEl.parentElement.style.display = "";
  }

  updateSubscribeLinks(size, data);
}

function updateSubscribeLinks(size, data) {
  document.querySelectorAll("[data-subscribe]").forEach((btn) => {
    const tier = btn.dataset.subscribe;
    const priceKnown = data[tier] !== null && data[tier] !== undefined;
    const stripeUrl = (STRIPE_LINKS[size] || {})[tier];

    if (priceKnown && stripeUrl) {
      btn.href = stripeUrl;
      btn.textContent = "Subscribe now";
      btn.removeAttribute("aria-disabled");
    } else if (!priceKnown) {
      // e.g. Under 30K advisory price isn't set yet on the live site
      btn.href = INTRO_CALL_LINK;
      btn.textContent = "Contact us";
    } else {
      // price known, Stripe link not configured yet — send to intro call instead
      btn.href = INTRO_CALL_LINK;
      btn.textContent = "Subscribe now";
    }
  });
}

document.querySelectorAll(".size-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".size-tab").forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    updatePricing(tab.dataset.size);
  });
});

// Initialise subscribe links for the default active tab on page load.
updateSubscribeLinks("30-250k", PRICING["30-250k"]);
