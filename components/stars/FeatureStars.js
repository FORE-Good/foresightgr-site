"use client";

import { useEffect, useRef } from "react";
import { paintStars, resolveField, unpackControls } from "./effects";
import "./star-lab.css";

/** Stickers in the blue around the copy, clear of the type and cards. */
const CONTENT = {
  hero: "h1, .hero-sub, .cta-row a",
  features: ".eyebrow, h2, .section-sub",
};

const PLACES = {
  features: [
    { band: "above", ax: 0.2, size01: 0.42, sketch: 1, tilt: -8, phase: 0.6 },
    { band: "side-left", ax: 0.55, size01: 0.7, sketch: 0, tilt: 14, phase: 1.8 },
    { band: "side-right", ax: 0.45, size01: 0.28, sketch: 2, tilt: -12, phase: 2.7 },
  ],
  hero: [
    { band: "above", ax: 0.22, size01: 0.4, sketch: 1, tilt: -8, phase: 0.2 },
    { band: "side-left", ax: 0.48, size01: 0.85, sketch: 0, tilt: 12, phase: 1.6 },
    { band: "below", ax: 0.78, size01: 0.26, sketch: 2, tilt: -11, phase: 2.9 },
  ],
};

const TEXT_GAP = 18;
const ROTATION = 1.22;

function contentBox(fieldEl, selector) {
  const field = fieldEl.getBoundingClientRect();
  const nodes = fieldEl.parentElement.querySelectorAll(selector);
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  }
  if (!Number.isFinite(left) || field.width === 0) return null;
  return {
    left: left - field.left,
    top: top - field.top,
    right: right - field.left,
    bottom: bottom - field.top,
  };
}

function starRadius(star, controls) {
  const lo = Math.min(controls.field.sizeMin, controls.field.sizeMax);
  const hi = Math.max(controls.field.sizeMin, controls.field.sizeMax);
  return (lo + star.size01 * (hi - lo)) / 2;
}

function overlapsText(px, py, radius, box) {
  return (
    px > box.left - radius - TEXT_GAP &&
    px < box.right + radius + TEXT_GAP &&
    py > box.top - radius - TEXT_GAP &&
    py < box.bottom + radius + TEXT_GAP
  );
}

function makeStar(spot, index) {
  return {
    x: 0,
    y: 0,
    size01: spot.size01,
    phase: spot.phase,
    phase01: 0.12 + index * 0.28,
    seed: 14 + index * 11,
    layer: { motion: 1, brightness: 1, size: 1 },
    sketch: spot.sketch,
    tilt: spot.tilt,
    jitterX: index ? 0.45 : -0.55,
    jitterY: index ? -0.35 : 0.4,
    jitterNext: 0,
    twitchAngle: index ? 8 : -10,
    twitchNext: 0,
    color: "",
    px: -1,
    glowOn: false,
    cls: "",
    el: null,
  };
}

export default function FeatureStars({ preset, place = "features" }) {
  const fieldRef = useRef(null);

  useEffect(() => {
    const fieldEl = fieldRef.current;
    const spots = PLACES[place];
    if (!fieldEl || !preset || !spots) return;

    const controls = unpackControls(preset);
    controls.field.count = spots.length;
    const authoredSize = {
      min: controls.field.sizeMin,
      max: controls.field.sizeMax,
    };
    const stars = spots.map(makeStar);

    fieldEl.replaceChildren();
    for (const star of stars) {
      const el = document.createElement("span");
      fieldEl.appendChild(el);
      star.el = el;
    }

    const layout = () => {
      const width = fieldEl.clientWidth;
      const height = fieldEl.clientHeight;
      const box = contentBox(fieldEl, CONTENT[place]);
      if (box) {
        const lane = Math.min(box.top, height - box.bottom);
        const cap = Math.max(24, (lane - TEXT_GAP - 6) / ROTATION);
        controls.field.sizeMax = Math.min(authoredSize.max, cap);
        controls.field.sizeMin = Math.min(
          authoredSize.min,
          Math.max(24, controls.field.sizeMax * 0.72)
        );
      }
      const fitted = resolveField(controls, { width, height, hole: box });

      spots.forEach((spot, index) => {
        const star = stars[index];
        let px;
        let py;
        let show = true;

        if (spot.band && !box) {
          show = false;
          px = 0;
          py = 0;
        } else if (spot.band && box) {
          const reach = starRadius(star, fitted.controls) * ROTATION;
          const edge = reach + 4;
          const clear = TEXT_GAP + 1;
          if (spot.band === "above") {
            py = box.top - clear - reach;
            px = edge + spot.ax * Math.max(0, width - edge * 2);
            show = py >= edge;
          } else if (spot.band === "below") {
            py = box.bottom + clear + reach;
            px = edge + spot.ax * Math.max(0, width - edge * 2);
            show = py <= height - edge;
          } else if (spot.band === "side-left") {
            px = box.left - clear - reach;
            py = box.top + spot.ax * (box.bottom - box.top);
            show = px >= edge;
          } else {
            px = box.right + clear + reach;
            py = box.top + spot.ax * (box.bottom - box.top);
            show = px <= width - edge;
          }
          if (show && overlapsText(px, py, reach, box)) show = false;
        } else {
          px = spot.fromRight ? width - spot.x : spot.x;
          py = spot.fromBottom ? height - spot.y : spot.y;
        }

        star.el.style.visibility = show ? "visible" : "hidden";
        star.x = width ? px / width : 0;
        star.y = height ? py / height : 0;
        star.el.style.left = `${star.x * 100}%`;
        star.el.style.top = `${star.y * 100}%`;
      });

      return { width, height, hole: box };
    };

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let elapsed = 0;
    let last = performance.now();
    let raf = 0;
    let stopped = false;

    const paint = () => {
      const space = layout();
      if (space.width <= 0) return;
      const fitted = resolveField(controls, space);
      paintStars(stars, elapsed, fitted.controls, space);
    };

    paint();

    const frame = (now) => {
      if (stopped) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden && !motion.matches) {
        elapsed += dt * controls.field.masterSpeed;
      }
      if (!document.hidden) paint();
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    const observer = new ResizeObserver(paint);
    observer.observe(fieldEl);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      fieldEl.replaceChildren();
    };
  }, [preset, place]);

  const className = place === "hero" ? "hero-stars star-field" : "feature-stars star-field";
  return <div className={className} ref={fieldRef} aria-hidden="true" />;
}
