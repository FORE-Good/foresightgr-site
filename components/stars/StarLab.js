"use client";

import { useEffect, useRef, useState } from "react";
import {
  SHAPES,
  buildStars,
  cloneControls,
  describeFit,
  packControls,
  paintStars,
  scrapbookControls,
  readFieldSpace,
  resolveField,
  unpackControls,
} from "./effects";
import "./star-lab.css";

const GROUPS = ["Move", "Shape", "Light"];
const AUTO_KEY = "star-lab-current";
const PRESET_KEY = "star-lab-preset";

function readStore(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return unpackControls(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeStore(key, controls) {
  try {
    localStorage.setItem(key, JSON.stringify(packControls(controls)));
  } catch {
    // Private browsing or a full disk. The lab still works for this visit.
  }
}

/**
 * Test page for the star field.
 * Buttons turn effects on and off. Sliders under a button tune that effect.
 * The math and the meaning of each number live in effects.js.
 * The loop reads a ref, so dragging a slider updates the stars immediately
 * and does not restart them.
 */
export default function StarLab() {
  const [controls, setControls] = useState(cloneControls);
  const [layoutKey, setLayoutKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [playAnyway, setPlayAnyway] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [hasPreset, setHasPreset] = useState(false);
  const [presetNote, setPresetNote] = useState("");
  const [jsonOpen, setJsonOpen] = useState(false);
  const [fitNote, setFitNote] = useState("");

  const controlsRef = useRef(controls);
  const playAnywayRef = useRef(playAnyway);
  const reduceRef = useRef(false);
  const fieldRef = useRef(null);
  const copyRef = useRef(null);
  const spaceRef = useRef(null);
  const keepPresetNote = useRef(false);
  const fitNoteRef = useRef("");

  controlsRef.current = controls;
  playAnywayRef.current = playAnyway;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceRef.current = mq.matches;
    setReduceMotion(mq.matches);
    const onChange = () => {
      reduceRef.current = mq.matches;
      setReduceMotion(mq.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const saved = readStore(AUTO_KEY);
    if (saved) setControls(saved);
    setHasPreset(readStore(PRESET_KEY) != null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStore(AUTO_KEY, controls);
    if (keepPresetNote.current) {
      keepPresetNote.current = false;
      return;
    }
    setPresetNote("");
  }, [controls, hydrated]);

  useEffect(() => {
    const fieldEl = fieldRef.current;
    const copyEl = copyRef.current;
    if (!fieldEl || !copyEl) return;

    const measure = () => {
      spaceRef.current = readFieldSpace(fieldEl, copyEl);
      return spaceRef.current;
    };

    let stars = [];
    let paintControls = controlsRef.current;
    let signature = "";
    let controlsKey = "";
    let alive = true;

    const mount = (nextStars) => {
      fieldEl.replaceChildren();
      for (const star of nextStars) {
        const el = document.createElement("span");
        el.style.left = `${star.x * 100}%`;
        el.style.top = `${star.y * 100}%`;
        fieldEl.appendChild(el);
        star.el = el;
      }
      stars = nextStars;
    };

    const sync = (forceSpace) => {
      if (!alive) return;
      const field = controlsRef.current.field;
      const depth = controlsRef.current.effects.some(
        (effect) => effect.id === "parallax" && effect.enabled
      );
      const key = `${field.shape}:${field.count}:${field.sizeMin}:${field.sizeMax}:${depth}`;
      if (!forceSpace && key === controlsKey && signature) return;
      controlsKey = key;

      const nextSpace = measure();
      const fit = resolveField(controlsRef.current, nextSpace);
      if (fit.signature === signature) return;
      signature = fit.signature;
      paintControls = fit.controls;
      mount(buildStars(fit.controls.field.count, nextSpace, fit.controls));
      const note = describeFit(fit.meta, stars.length);
      if (fitNoteRef.current !== note) {
        fitNoteRef.current = note;
        setFitNote(note);
      }
    };

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(fieldEl);
    observer.observe(copyEl);

    let elapsed = 0;
    let last = performance.now();
    let raf = 0;
    let stopped = false;

    const frame = (now) => {
      if (stopped) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const motionOk = !reduceRef.current || playAnywayRef.current;
      if (!document.hidden && motionOk) {
        elapsed += dt * controlsRef.current.field.masterSpeed;
      }
      if (!document.hidden) {
        sync();
        paintStars(stars, elapsed, paintControls, spaceRef.current);
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      stopped = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      fieldEl.replaceChildren();
    };
  }, [controls.field.count, layoutKey]);

  function patchField(key, value) {
    setControls((current) => ({
      ...current,
      field: { ...current.field, [key]: value },
    }));
  }

  function toggleEffect(id) {
    setControls((current) => ({
      ...current,
      effects: current.effects.map((effect) =>
        effect.id === id ? { ...effect, enabled: !effect.enabled } : effect
      ),
    }));
  }

  function patchParam(id, key, value) {
    setControls((current) => ({
      ...current,
      effects: current.effects.map((effect) => {
        if (effect.id !== id) return effect;
        return {
          ...effect,
          params: effect.params.map((param) =>
            param.key === key ? { ...param, value } : param
          ),
        };
      }),
    }));
  }

  function setEveryEffect(enabled) {
    setControls((current) => ({
      ...current,
      effects: current.effects.map((effect) => ({ ...effect, enabled })),
    }));
  }

  function savePreset() {
    writeStore(PRESET_KEY, controls);
    setHasPreset(true);
    setPresetNote("Preset saved. Load preset brings this mix back.");
  }

  function loadPreset() {
    const saved = readStore(PRESET_KEY);
    if (!saved) return;
    keepPresetNote.current = true;
    setControls(saved);
    setPresetNote("Preset loaded.");
  }

  async function copyPreset() {
    const text = JSON.stringify(packControls(controls), null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setJsonOpen(false);
      setPresetNote("Copied this mix as JSON. Paste it into a file to keep it.");
    } catch {
      setJsonDraft(text);
      setJsonOpen(true);
      setPresetNote("Clipboard was blocked. The JSON is in the box — select it and copy.");
    }
  }

  function applyPasted() {
    let saved = null;
    try {
      const parsed = JSON.parse(jsonDraft);
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object" || !parsed.field) {
        setPresetNote("That JSON is not a star preset. Paste one copied mix, not a list.");
        return;
      }
      saved = unpackControls(parsed);
    } catch {
      setPresetNote("That text is not valid JSON.");
      return;
    }
    if (!saved) {
      setPresetNote("That JSON is not a star preset.");
      return;
    }
    keepPresetNote.current = true;
    setControls(saved);
    setJsonOpen(false);
    setPresetNote("Pasted preset loaded.");
  }

  function applyScrapbook() {
    const next = scrapbookControls();
    writeStore(PRESET_KEY, next);
    setHasPreset(true);
    keepPresetNote.current = true;
    setControls(next);
    setPresetNote("Scrapbook preset saved. Load preset brings these stickers back.");
  }

  const active = controls.effects.filter((effect) => effect.enabled);
  const shape = SHAPES.find((item) => item.id === controls.field.shape) ?? SHAPES[0];
  const motionPaused = reduceMotion && !playAnyway;

  return (
    <div className="star-lab">
      <div className="star-stage">
        <div className="star-field" ref={fieldRef} aria-hidden="true" />
        <div className="star-sample">
          <div className="star-copy" ref={copyRef}>
            <p className="star-sample-kicker">Sample headline</p>
            <h2>Become the organisation government can&apos;t ignore</h2>
            <p>Tech and expertise to superpower your team</p>
          </div>
        </div>
      </div>

      <aside className="star-panel">
        <div className="star-panel-head">
          <h1>Star lab</h1>
          <p className="star-lead">
            Each button turns one effect on or off. They stack. Sliders under
            a button change that effect only. The mix you are looking at is
            kept in this browser as you change it.
          </p>
          <p className="star-status">
            {active.length === 0
              ? "All effects off. Stars sit at resting brightness."
              : `On: ${active.map((effect) => effect.label).join(", ")}`}
          </p>
          <div className="star-preset-row">
            <button type="button" onClick={applyScrapbook}>
              Scrapbook
            </button>
            <button type="button" onClick={() => setControls(cloneControls())}>
              Fade only
            </button>
            <button type="button" onClick={() => setEveryEffect(true)}>
              All on
            </button>
            <button type="button" onClick={() => setEveryEffect(false)}>
              All off
            </button>
            <button type="button" onClick={() => setLayoutKey((n) => n + 1)}>
              Shuffle
            </button>
            <button type="button" onClick={savePreset}>
              Save preset
            </button>
            <button type="button" onClick={loadPreset} disabled={!hasPreset}>
              Load preset
            </button>
            <button type="button" onClick={copyPreset}>
              Copy JSON
            </button>
            <button
              type="button"
              onClick={() => setJsonOpen((open) => !open)}
              aria-expanded={jsonOpen}
            >
              Paste JSON
            </button>
          </div>
          {jsonOpen && (
            <div className="star-json">
              <textarea
                value={jsonDraft}
                onChange={(event) => setJsonDraft(event.target.value)}
                rows={6}
                spellCheck={false}
                aria-label="Preset JSON"
                placeholder="Paste a copied preset here"
              />
              <button type="button" onClick={applyPasted}>
                Use this JSON
              </button>
            </div>
          )}
          <p className="slider-hint star-save-hint">
            Scrapbook sets big die-cut stickers and saves that mix.
            Save preset keeps one mix in this browser. Copy JSON puts the
            mix on screen onto your clipboard, so you can store many in a
            file. Paste JSON loads one back. Fade only returns to the
            starting mix.
            {presetNote ? ` ${presetNote}` : ""}
          </p>
          {motionPaused && (
            <p className="star-note">
              Your system is set to reduce motion, so the field is frozen.{" "}
              <button type="button" onClick={() => setPlayAnyway(true)}>
                Play animations anyway
              </button>
            </p>
          )}
        </div>

        <section className="star-group">
          <h2>Field</h2>
          <Slider
            label="Count"
            min={8}
            max={180}
            step={1}
            unit=""
            value={controls.field.count}
            onChange={(value) => patchField("count", value)}
          />
          {fitNote ? <p className="slider-hint">{fitNote}</p> : null}
          <Slider
            label="Smallest star"
            min={1}
            max={120}
            step={1}
            unit="px"
            value={controls.field.sizeMin}
            onChange={(value) => patchField("sizeMin", value)}
          />
          <Slider
            label="Largest star"
            min={1}
            max={160}
            step={1}
            unit="px"
            value={controls.field.sizeMax}
            onChange={(value) => patchField("sizeMax", value)}
          />
          <Slider
            label="Resting brightness"
            min={0}
            max={1}
            step={0.01}
            unit=""
            value={controls.field.resting}
            onChange={(value) => patchField("resting", value)}
          />
          <Slider
            label="Master speed"
            min={0}
            max={3}
            step={0.05}
            unit="×"
            value={controls.field.masterSpeed}
            onChange={(value) => patchField("masterSpeed", value)}
          />
          <p className="slider-hint">
            Resting brightness is used when Fade is off. Master speed scales
            every effect. 0 freezes the field.
          </p>

          <p className="shape-label">Shape</p>
          <div className="shape-row">
            {SHAPES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={controls.field.shape === item.id}
                onClick={() => patchField("shape", item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="slider-hint">{shape.note}</p>
        </section>

        {GROUPS.map((group) => (
          <section className="star-group" key={group}>
            <h2>{group}</h2>
            {controls.effects
              .filter((effect) => effect.group === group)
              .map((effect) => (
                <article
                  key={effect.id}
                  className={effect.enabled ? "effect is-on" : "effect"}
                >
                  <button
                    type="button"
                    className="effect-toggle"
                    aria-pressed={effect.enabled}
                    onClick={() => toggleEffect(effect.id)}
                  >
                    {effect.label}
                  </button>
                  <p>{effect.what}</p>
                  {effectNote(effect, controls) && (
                    <p className="effect-warn">{effectNote(effect, controls)}</p>
                  )}
                  {effect.params.map((param) =>
                    param.type === "choice" ? (
                      <div className="choice-row" key={param.key}>
                        <span>{param.label}</span>
                        {param.options.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={param.value === option.value}
                            onClick={() =>
                              patchParam(effect.id, param.key, option.value)
                            }
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Slider
                        key={param.key}
                        label={param.label}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        unit={param.unit}
                        value={param.value}
                        onChange={(value) =>
                          patchParam(effect.id, param.key, value)
                        }
                      />
                    )
                  )}
                </article>
              ))}
          </section>
        ))}

        <p className="star-foot">
          <a href="/">Back to the site</a>
          <span> This page is not in the header. Open it at /stars.</span>
        </p>
      </aside>
    </div>
  );
}

function Slider({ label, min, max, step, unit, value, onChange }) {
  const decimals = String(step).includes(".")
    ? String(step).split(".")[1].length
    : 0;
  const factor = 10 ** decimals;
  const shown = (Math.round(Number(value) * factor) / factor).toFixed(decimals);

  return (
    <label className="slider">
      <span className="slider-name">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="slider-value">
        {shown}
        {unit ? ` ${unit}` : ""}
      </span>
    </label>
  );
}

function effectNote(effect, controls) {
  if ((effect.id === "spin" || effect.id === "wobble" || effect.id === "twitch") && controls.field.shape === "dot") {
    return "This shape is a circle, so turning it looks still. Switch to Sparkle or Cross.";
  }

  if (effect.id === "flash") {
    const fade = controls.effects.find((item) => item.id === "fade");
    const brightest = fade?.params.find((param) => param.key === "max")?.value ?? 1;
    if (fade?.enabled && brightest > 0.9) {
      return "Fade already reaches full brightness, so this pop is easy to miss. Turn Fade off, or lower Fade's brightest.";
    }
  }

  if (effect.id === "parallax" && effect.enabled) {
    const moving = controls.effects.some(
      (item) =>
        item.group === "Move" && item.id !== "parallax" && item.enabled
    );
    if (!moving) {
      return "Size and brightness are split by depth. Turn on Drift, Wiggle, Orbit, or Jitter to see the far stars move less.";
    }
  }

  return null;
}
