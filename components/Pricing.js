"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_SIZE,
  INTRO_CALL_LINK,
  PRICING,
  SIZE_TABS,
  formatMoney,
  subscribeHref,
} from "@/lib/site";

export default function Pricing() {
  const [size, setSize] = useState(DEFAULT_SIZE);
  const data = PRICING[size];

  const essentials = useMemo(() => {
    return {
      monthly: formatMoney(data.essentials),
      annual: formatMoney(data.essentials * 10),
      subscribe: subscribeHref(size, "essentials", data),
    };
  }, [data, size]);

  const advisory = useMemo(() => {
    if (data.advisory === null) {
      return {
        monthly: "Contact us",
        annual: null,
        subscribe: subscribeHref(size, "advisory", data),
      };
    }
    return {
      monthly: formatMoney(data.advisory),
      annual: formatMoney(data.advisory * 10),
      subscribe: subscribeHref(size, "advisory", data),
    };
  }, [data, size]);

  return (
    <section className="section pricing" id="pricing">
      <div className="wrap">
        {/* <p className="eyebrow center">Early joiner pricing (until end of 2026)</p> */}
        <h2 className="section-title">Priced to match your size</h2>
        {/* <p className="section-sub">
          Because a $40k annual budget and a $10m budget can&apos;t stretch the
          same way.
        </p> */}

        <div className="size-tabs" role="tablist" aria-label="Organisation size">
          <div>Your revenue:</div>
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
                onClick={() => setSize(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="pricing-grid">
          <article className="price-card price-card--hero popular">
            <p className="popular-badge">Most organisations start here</p>
            <h3>Campaign pack</h3>
            <p
              className="price-annual"
              style={advisory.annual === null ? { display: "none" } : undefined}
            >
              For those looking to level up their Govt relations capability.
            </p>
            <p className="price">
              <span className="price-amount" data-tier="advisory">
                {advisory.monthly}
              </span>
              /month
            </p>

            <ul className="price-checklist">
              <li>Expert guidance</li>
              <li className="included">
                Up to 2&times;30-min Advisory Calls/month
              </li>
              <li className="included">Policy Intelligence Tool</li>
              <li className="included">Template Library</li>
            </ul>
            <div className="price-actions">
              <a
                className="btn btn-accent"
                data-subscribe="advisory"
                href={advisory.subscribe.href}
                target="_blank"
                rel="noopener"
              >
                {advisory.subscribe.label}
              </a>
              <a
                className="btn btn-outline"
                href={INTRO_CALL_LINK}
                target="_blank"
                rel="noopener"
              >
                Book a FREE Intro Call
              </a>
            </div>
          </article>

          <article className="price-card price-card--secondary">
            <h3>Essentials</h3>
            <p className="price">
              <span className="price-amount" data-tier="essentials">
                {essentials.monthly}
              </span>
              /month
            </p>
            <p className="price-annual">
              <span data-tier="essentials-annual">{essentials.annual}</span>
              /year, 2 months free
            </p>
            <ul className="price-checklist">
              <li className="included">Policy Intelligence Tool</li>
              <li className="included">Template Library</li>
              <li className="excluded">Advisory Calls</li>
            </ul>
            <div className="price-actions">
              <a
                className="btn btn-outline"
                data-subscribe="essentials"
                href={essentials.subscribe.href}
                target="_blank"
                rel="noopener"
              >
                {essentials.subscribe.label}
              </a>
              <a
                className="btn btn-outline"
                href={INTRO_CALL_LINK}
                target="_blank"
                rel="noopener"
              >
                Book a FREE Intro Call
              </a>
            </div>
          </article>
        </div>
        <p className="pricing-note">
          Monthly or annual, no lock-in. Change or cancel whenever you need to.
          This is our early joiner pricing, available to organisations who come
          on board before the end of 2026.
        </p>
      </div>
    </section>
  );
}
