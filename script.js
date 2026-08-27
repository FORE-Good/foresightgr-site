// Pricing by organisation size, sourced from the live foresightgr.com.au pricing tabs.
// "under30k" advisory price was blank on the live site at time of migration — flagged as "Contact us".
const PRICING = {
  "under30k": { essentials: 20, advisory: null },
  "30-250k": { essentials: 49, advisory: 229 },
  "250-1m": { essentials: 69, advisory: 299 },
  "1m-5m": { essentials: 99, advisory: 429 },
  "5m+": { essentials: 129, advisory: 579 },
};

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
