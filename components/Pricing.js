"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_SIZE,
  PRICING,
  PRICING_EXPERIMENT,
  SIZE_TABS,
  formatMoney,
  introCallHref,
  subscribeHref,
} from "@/lib/site";
import { track } from "@/lib/track";

/*
 * Pricing experiment: three options, Campaign Pack highlighted as the entry.
 *
 *   campaign-pack  – one moment, 3 months, fixed price (highlighted)
 *   guided         – advisory + tools, monthly (was "advisory" in PRICING)
 *   essentials     – tools & intel only, monthly
 *
 * Every CTA is tagged with the option and revenue band so the choice is
 * visible in Calendly (UTMs), Stripe (client_reference_id) and any analytics
 * tool via track().
 */

export default function Pricing() {
  const [size, setSize] = useState(DEFAULT_SIZE);
  const data = PRICING[size];

  const options = useMemo(() => {
    const pack =
      data.pack === null
        ? { amount: "Contact us", term: "" }
        : { amount: formatMoney(data.pack), term: "for 3 months, one-off" };

    const guided =
      data.advisory === null
        ? { amount: "Contact us", term: "", annual: null }
        : {
            amount: formatMoney(data.advisory),
            term: "/month",
            annual: formatMoney(data.advisory * 10),
          };

    return [
      {
        id: "campaign-pack",
        highlighted: true,
        eyebrow: "For a moment",
        name: "Campaign Pack",
        summary:
          "An inquiry, a budget ask, a new minister, an election. Three months of guided support to get through it well.",
        price: pack,
        annual: null,
        items: [
          { text: "Kick-off strategy session", included: true },
          {
            text: "5 × 30-min advisory sessions, scheduled around your timeline",
            included: true,
          },
          { text: "Written next steps after every session", included: true },
          {
            text: "Policy Intelligence Tool and Template Library for the full 3 months",
            included: true,
          },
          {
            text: "Pack price credited if you move to Guided",
            included: true,
          },
        ],
        primary: subscribeHref(size, "pack", data, "campaign-pack"),
        secondary: {
          href: introCallHref("campaign-pack", size),
          label: "Book a free intro call",
        },
      },
      {
        id: "guided",
        eyebrow: "For an ongoing rhythm",
        name: "Guided",
        summary:
          "Advisory and tools, month to month. Build government engagement capability without building a GR team.",
        price: guided,
        annual: guided.annual,
        items: [
          { text: "2 × 30-min advisory sessions a month", included: true },
          { text: "Direct email support", included: true },
          { text: "Policy Intelligence Tool", included: true },
          { text: "Template Library", included: true },
        ],
        primary: subscribeHref(size, "advisory", data, "guided"),
        secondary: {
          href: introCallHref("guided", size),
          label: "Book a free intro call",
        },
      },
      {
        id: "essentials",
        eyebrow: "Tools to do it yourself",
        name: "Essentials",
        summary:
          "Intelligence and templates for teams who already know their way around government.",
        price: {
          amount: formatMoney(data.essentials),
          term: "/month",
        },
        annual: formatMoney(data.essentials * 10),
        items: [
          { text: "Policy Intelligence Tool", included: true },
          { text: "Template Library", included: true },
          { text: "Advisory sessions", included: false },
        ],
        primary: subscribeHref(size, "essentials", data),
        secondary: {
          href: introCallHref("essentials", size),
          label: "Book a free intro call",
        },
      },
    ];
  }, [data, size]);

  function handleSize(id) {
    setSize(id);
    track("pricing_size_change", { experiment: PRICING_EXPERIMENT, size: id });
  }

  function handleCta(option, cta) {
    track("pricing_option_click", {
      experiment: PRICING_EXPERIMENT,
      option,
      cta,
      size,
    });
  }

  return (
    <section
      className="section pricing"
      id="pricing"
      data-experiment={PRICING_EXPERIMENT}
    >
      <div className="wrap">
        <p className="eyebrow center">Pricing</p>
        <h2 className="section-title">Three ways to work with us</h2>
        <p className="section-sub">
          Priced to your organisation&apos;s revenue, because a $40k budget and
          a $10m budget can&apos;t stretch the same way.
        </p>

        <div className="size-tabs" role="tablist" aria-label="Organisation size">
          <span className="size-tabs-label">Your annual revenue:</span>
          {SIZE_TABS.map((tab) => {
            const active = tab.id === size;
            return (
              <button
                key={tab.id}
                className={`size-tab${active ? " active" : ""}`}
                data-size={tab.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => handleSize(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="pricing-grid pricing-grid--three">
          {options.map((opt) => (
            <article
              key={opt.id}
              className={`price-card price-card--option${
                opt.highlighted ? " price-card--hero popular" : ""
              }`}
              data-option={opt.id}
            >
              {opt.highlighted ? (
                <p className="popular-badge">Most organisations start here</p>
              ) : null}
              <p className="price-eyebrow">{opt.eyebrow}</p>
              <h3>{opt.name}</h3>
              <p className="price-summary">{opt.summary}</p>

              <p className="price">
                <span className="price-amount" data-tier={opt.id}>
                  {opt.price.amount}
                </span>
                {opt.price.term ? (
                  <span className="price-term"> {opt.price.term}</span>
                ) : null}
              </p>
              {opt.annual ? (
                <p className="price-annual">
                  <span data-tier={`${opt.id}-annual`}>{opt.annual}</span>
                  /year, 2 months free
                </p>
              ) : (
                <p className="price-annual price-annual--spacer" aria-hidden />
              )}

              <ul className="price-checklist">
                {opt.items.map((item) => (
                  <li
                    key={item.text}
                    className={item.included ? "included" : "excluded"}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>

              <div className="price-actions">
                <a
                  className="btn btn-accent"
                  data-subscribe={opt.id}
                  href={opt.primary.href}
                  target="_blank"
                  rel="noopener"
                  onClick={() => handleCta(opt.id, "primary")}
                >
                  {opt.primary.label}
                </a>
                {opt.secondary ? (
                  <a
                    className="btn btn-outline"
                    href={opt.secondary.href}
                    target="_blank"
                    rel="noopener"
                    onClick={() => handleCta(opt.id, "intro-call")}
                  >
                    {opt.secondary.label}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <p className="pricing-note">
          Guided and Essentials are monthly or annual with no lock-in. Change or
          cancel whenever you need to. Early joiner pricing for organisations
          who come on board before the end of 2026.{" "}
          <a
            href={introCallHref("unsure", size)}
            target="_blank"
            rel="noopener"
            onClick={() => handleCta("unsure", "note")}
          >
            Not sure which fits? Book a call and we&apos;ll help you choose.
          </a>
        </p>
      </div>
    </section>
  );
}
