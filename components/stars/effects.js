/**
 * Star lab — what each effect does, and how they combine.
 *
 * The page at /stars writes this data. You can also change the defaults
 * below: `enabled` is the on/off switch, and each `value` is the starting
 * position of that slider.
 *
 * Units
 * - cycles/s: how many back-and-forth loops happen each second.
 *   1 means a full cycle every second. 0.5 means one cycle every two seconds.
 * - px: pixels of movement from the star's home point.
 * - deg/s: degrees of rotation per second. 360 is one full turn per second.
 *
 * How a frame is built (this order, every star):
 * 1. Move effects ADD into one x/y offset (drift + wiggle + orbit + jitter).
 * 2. Scale sets the size pulse. Squash then stretches width and height
 *    in opposite directions on top of that.
 * 3. Spin adds a continuous angle. Wobble adds a back-and-forth angle.
 *    Twitch snaps to a new angle and holds it, the way Jitter snaps position.
 * 4. Light starts at Resting brightness.
 *    Fade REPLACES that with a smooth wave between dimmest and brightest.
 *    Flicker MULTIPLIES it (irregular).
 *    Blink MULTIPLIES it (hard on/off).
 *    Flash lifts the star toward full brightness for a short pop.
 *    Depth, when on, then multiplies brightness and size, and scales
 *    whatever movement is already happening.
 * 5. Colour mixes white toward the chosen colour. Glow draws a halo
 *    whose size follows the star's current brightness.
 *
 * A round dot does not show spin, wobble, or twitch. Sparkle, cross,
 * the drawn star, and the sticker do.
 *
 * Fitting the stage
 * The sliders keep the full-size mix. resolveField decides what this
 * screen shows. Little stars keep the density of an 880×800 stage, so a
 * phone shows fewer. Stickers are capped at a fifth of the shorter side,
 * then any star that cannot keep its gap is left out. Homes are a random
 * spread: each star stays clear of the headline and of the other stars.
 *
 * The lab page stores the live mix in this browser as it changes, and
 * can keep one preset separately. Those saved mixes win over the
 * defaults below until you press Fade only.
 */

export const FIELD = {
  count: 64,
  sizeMin: 4,
  sizeMax: 12,
  /** Brightness used when Fade is off. 0 is invisible, 1 is solid white. */
  resting: 0.8,
  /** Multiplies every effect's speed. 0 freezes the field. */
  masterSpeed: 1,
  /** "dot" | "sparkle" | "cross" | "sketched" | "sticker" */
  shape: "sparkle",
};

export const SHAPES = [
  {
    id: "dot",
    label: "Dot",
    note: "A round point. Spin and wobble will not show, because a circle looks the same when it turns.",
  },
  {
    id: "sparkle",
    label: "Sparkle",
    note: "A four-point star. Rotation is easy to see.",
  },
  {
    id: "cross",
    label: "Cross",
    note: "A plus sign. Rotation is easy to see.",
  },
  {
    id: "sketched",
    label: "Drawn star",
    note: "A hand-drawn five-point star. Each one is a little different. Rotation is easy to see.",
  },
  {
    id: "sticker",
    label: "Sticker",
    note: "A die-cut scrapbook sticker: a yellow star on a white margin, tilted, with a shadow. Colour does not tint this shape.",
  },
];

/**
 * Far / middle / near. Used only while Depth is on.
 * motion scales x/y travel. brightness scales opacity. size scales the star.
 */
const LAYERS = [
  { motion: 0.35, brightness: 0.4, size: 0.6 },
  { motion: 1, brightness: 0.78, size: 1 },
  { motion: 1.65, brightness: 1, size: 1.4 },
];

export const EFFECTS = [
  {
    id: "drift",
    group: "Move",
    label: "Drift",
    what: "Slow wander. Each star leaves its home point and comes back on a lazy loop.",
    enabled: false,
    params: [
      { key: "distance", label: "Distance", min: 0, max: 80, step: 1, unit: "px", value: 22 },
      { key: "speed", label: "Speed", min: 0.05, max: 2, step: 0.05, unit: "cycles/s", value: 0.2 },
    ],
  },
  {
    id: "wiggleX",
    group: "Move",
    label: "Wiggle sideways",
    what: "Slides left and right around the home point.",
    enabled: false,
    params: [
      { key: "distance", label: "Distance", min: 0, max: 60, step: 1, unit: "px", value: 10 },
      { key: "speed", label: "Speed", min: 0.1, max: 4, step: 0.1, unit: "cycles/s", value: 1.4 },
    ],
  },
  {
    id: "wiggleY",
    group: "Move",
    label: "Wiggle up",
    what: "Slides up and down. Use a different speed from sideways so the path is not a circle.",
    enabled: false,
    params: [
      { key: "distance", label: "Distance", min: 0, max: 60, step: 1, unit: "px", value: 10 },
      { key: "speed", label: "Speed", min: 0.1, max: 4, step: 0.1, unit: "cycles/s", value: 0.8 },
    ],
  },
  {
    id: "orbit",
    group: "Move",
    label: "Orbit",
    what: "Walks a small circle around the home point.",
    enabled: false,
    params: [
      { key: "radius", label: "Radius", min: 0, max: 48, step: 1, unit: "px", value: 12 },
      { key: "speed", label: "Speed", min: 0.05, max: 3, step: 0.05, unit: "cycles/s", value: 0.45 },
    ],
  },
  {
    id: "jitter",
    group: "Move",
    label: "Jitter",
    what: "Tiny random steps, like the star is shivering. Interval is how long it holds still between steps.",
    enabled: false,
    params: [
      { key: "distance", label: "Distance", min: 0, max: 30, step: 1, unit: "px", value: 8 },
      { key: "interval", label: "Hold", min: 0.03, max: 1, step: 0.01, unit: "s", value: 0.14 },
    ],
  },
  {
    id: "parallax",
    group: "Move",
    label: "Depth",
    what: "Splits the field into far, middle, and near stars. Far ones are smaller, dimmer, and travel less.",
    enabled: false,
    params: [],
  },
  {
    id: "scale",
    group: "Shape",
    label: "Grow and shrink",
    what: "Pulses between a smallest and largest size.",
    enabled: false,
    params: [
      { key: "min", label: "Smallest", min: 0.15, max: 2, step: 0.05, unit: "×", value: 0.45 },
      { key: "max", label: "Largest", min: 0.15, max: 3, step: 0.05, unit: "×", value: 1.35 },
      { key: "speed", label: "Speed", min: 0.1, max: 4, step: 0.1, unit: "cycles/s", value: 0.7 },
    ],
  },
  {
    id: "spin",
    group: "Shape",
    label: "Spin",
    what: "Turns continuously in one direction. Invisible on a dot.",
    enabled: false,
    params: [
      { key: "speed", label: "Speed", min: -360, max: 360, step: 5, unit: "deg/s", value: 40 },
    ],
  },
  {
    id: "wobble",
    group: "Shape",
    label: "Wobble",
    what: "Rocks forward and back by a set angle, then returns. Invisible on a dot.",
    enabled: false,
    params: [
      { key: "degrees", label: "Angle", min: 0, max: 90, step: 1, unit: "deg", value: 32 },
      { key: "speed", label: "Speed", min: 0.1, max: 4, step: 0.1, unit: "cycles/s", value: 0.7 },
    ],
  },
  {
    id: "twitch",
    group: "Shape",
    label: "Twitch",
    what: "Jitter for the angle. Snaps to a new rotation and holds it, then snaps again. Angle is how far it can turn either way. Invisible on a dot.",
    enabled: false,
    params: [
      { key: "degrees", label: "Angle", min: 0, max: 60, step: 1, unit: "deg", value: 16 },
      { key: "interval", label: "Hold", min: 0.03, max: 1, step: 0.01, unit: "s", value: 0.16 },
    ],
  },
  {
    id: "squash",
    group: "Shape",
    label: "Squash",
    what: "Stretches width and height in opposite directions, so the star breathes. Amount is how far from square. 0 is no squash.",
    enabled: false,
    params: [
      { key: "amount", label: "Amount", min: 0, max: 0.85, step: 0.05, unit: "", value: 0.4 },
      { key: "speed", label: "Speed", min: 0.1, max: 4, step: 0.1, unit: "cycles/s", value: 0.8 },
    ],
  },
  {
    id: "fade",
    group: "Light",
    label: "Fade",
    what: "Smooth brightness wave. This is the usual twinkle. It replaces Resting brightness while it is on.",
    enabled: true,
    params: [
      { key: "min", label: "Dimmest", min: 0, max: 1, step: 0.01, unit: "", value: 0.12 },
      { key: "max", label: "Brightest", min: 0, max: 1, step: 0.01, unit: "", value: 1 },
      { key: "speed", label: "Speed", min: 0.05, max: 4, step: 0.05, unit: "cycles/s", value: 0.55 },
    ],
  },
  {
    id: "flicker",
    group: "Light",
    label: "Flicker",
    what: "Irregular brightness, closer to a real star than a smooth fade. Amount is how wild the variation is. 0 is steady.",
    enabled: false,
    params: [
      { key: "amount", label: "Amount", min: 0, max: 1, step: 0.05, unit: "", value: 0.85 },
      { key: "speed", label: "Speed", min: 0.2, max: 8, step: 0.1, unit: "cycles/s", value: 1.6 },
    ],
  },
  {
    id: "blink",
    group: "Light",
    label: "Blink",
    what: "Hard on and off. Duty is the fraction of each cycle spent lit. 0.5 is even. Off brightness is how visible it stays while 'off'.",
    enabled: false,
    params: [
      { key: "duty", label: "Time lit", min: 0.05, max: 0.95, step: 0.05, unit: "", value: 0.4 },
      { key: "off", label: "Off brightness", min: 0, max: 1, step: 0.01, unit: "", value: 0.05 },
      { key: "speed", label: "Speed", min: 0.1, max: 6, step: 0.1, unit: "cycles/s", value: 1.1 },
    ],
  },
  {
    id: "flash",
    group: "Light",
    label: "Flash",
    what: "Mostly leaves the star as it is, then pops it to full brightness once per cycle. Sharpness: higher is a shorter pop.",
    enabled: false,
    params: [
      { key: "sharpness", label: "Sharpness", min: 1, max: 16, step: 0.5, unit: "", value: 7 },
      { key: "speed", label: "Speed", min: 0.1, max: 4, step: 0.1, unit: "cycles/s", value: 0.4 },
    ],
  },
  {
    id: "glow",
    group: "Light",
    label: "Glow",
    what: "A soft halo. Its size follows the star's current brightness, so pair it with Fade or Flicker to see it pulse.",
    enabled: false,
    params: [
      { key: "min", label: "Dim halo", min: 0, max: 30, step: 1, unit: "px", value: 0 },
      { key: "max", label: "Bright halo", min: 0, max: 40, step: 1, unit: "px", value: 14 },
    ],
  },
  {
    id: "colour",
    group: "Light",
    label: "Colour",
    what: "Shifts from white toward another colour and back. Amount is how far it gets. 1 reaches the chosen colour.",
    enabled: false,
    params: [
      {
        key: "target",
        label: "Toward",
        type: "choice",
        value: "#c5d0ff",
        options: [
          { value: "#c5d0ff", label: "Pale blue" },
          { value: "#fef66a", label: "Yellow" },
          { value: "#d7fff4", label: "Pale green" },
        ],
      },
      { key: "amount", label: "Amount", min: 0, max: 1, step: 0.05, unit: "", value: 1 },
      { key: "speed", label: "Speed", min: 0.05, max: 3, step: 0.05, unit: "cycles/s", value: 0.35 },
    ],
  },
];

/** Air between a star's edge and the sample headline, in pixels. */
export const TEXT_GAP = 18;

/** Air between the edges of two stars, before the spread pushes them further apart. */
const TOUCH_GAP = 16;

/** Desktop lab stage. A smaller stage shows fewer little stars so this density holds. */
const FULL_STAGE_AREA = 880 * 800;

export function cloneControls() {
  return {
    field: structuredClone(FIELD),
    effects: structuredClone(EFFECTS),
  };
}

/** Big die-cut stickers, still, sitting around the headline. */
export function scrapbookControls() {
  const next = cloneControls();
  next.field.count = 10;
  next.field.sizeMin = 64;
  next.field.sizeMax = 108;
  next.field.resting = 1;
  next.field.masterSpeed = 1;
  next.field.shape = "sticker";
  for (const effect of next.effects) effect.enabled = false;
  return next;
}

/** Compact copy of the live mix, for localStorage. */
export function packControls(controls) {
  return {
    version: 1,
    field: { ...controls.field },
    effects: controls.effects.map((effect) => ({
      id: effect.id,
      enabled: effect.enabled,
      params: Object.fromEntries(effect.params.map((param) => [param.key, param.value])),
    })),
  };
}

/**
 * Turn a saved mix back into a full controls object.
 * Unknown or broken values are ignored, so an older save still loads
 * after the effect list changes. Returns null when the data is unusable.
 */
export function unpackControls(raw) {
  if (!raw || typeof raw !== "object") return null;
  const next = cloneControls();
  const field = raw.field;
  if (field && typeof field === "object") {
    for (const key of ["count", "sizeMin", "sizeMax", "resting", "masterSpeed"]) {
      const value = field[key];
      if (typeof value === "number" && Number.isFinite(value)) next.field[key] = value;
    }
    if (SHAPES.some((shape) => shape.id === field.shape)) next.field.shape = field.shape;
  }
  next.field.count = clamp(Math.round(next.field.count), 8, 180);
  next.field.sizeMin = clamp(next.field.sizeMin, 1, 120);
  next.field.sizeMax = clamp(next.field.sizeMax, 1, 160);
  next.field.resting = clamp(next.field.resting, 0, 1);
  next.field.masterSpeed = clamp(next.field.masterSpeed, 0, 3);

  const stored = new Map((Array.isArray(raw.effects) ? raw.effects : []).map((effect) => [effect.id, effect]));
  for (const effect of next.effects) {
    const saved = stored.get(effect.id);
    if (!saved) continue;
    if (typeof saved.enabled === "boolean") effect.enabled = saved.enabled;
    const params = saved.params && typeof saved.params === "object" ? saved.params : {};
    for (const param of effect.params) {
      const value = params[param.key];
      if (param.type === "choice") {
        if (param.options.some((option) => option.value === value)) param.value = value;
      } else if (typeof value === "number" && Number.isFinite(value)) {
        param.value = clamp(value, param.min, param.max);
      }
    }
  }
  return next;
}

/**
 * What this stage should show. Slider values stay on `controls`.
 * `meta` describes any count or sticker-size change.
 */
export function resolveField(controls, space) {
  const q = quantizeSpace(space);
  const fit = fitField(controls, q);
  const hole = q.hole;
  const depth = controls.effects.some((effect) => effect.id === "parallax" && effect.enabled);
  const signature = [
    fit.controls.field.shape,
    fit.controls.field.count,
    fit.controls.field.sizeMin,
    fit.controls.field.sizeMax,
    depth ? "d" : "s",
    q.width,
    q.height,
    hole ? hole.left : "-",
    hole ? hole.top : "-",
    hole ? hole.right : "-",
    hole ? hole.bottom : "-",
  ].join(":");
  return { ...fit, signature };
}

export function describeFit(meta, shown) {
  const parts = [];
  if (shown < meta.authoredCount) {
    parts.push(`This screen shows ${shown} of ${meta.authoredCount}.`);
  }
  if (meta.shownSizeMax < meta.authoredSizeMax - 0.5) {
    const kind = meta.capped ? "Stickers are" : "Stars are";
    parts.push(`${kind} capped at ${meta.shownSizeMax}px so they fit this stage.`);
  }
  return parts.join(" ");
}

export function buildStars(count, space, controls) {
  const total = Math.max(0, Math.round(count));
  const depthOn = controls.effects.some((effect) => effect.id === "parallax" && effect.enabled);
  const pending = [];

  for (let i = 0; i < total; i++) {
    const size01 = Math.random();
    const layer = LAYERS[i % LAYERS.length];
    pending.push({
      size01,
      layer,
      reach: starReach(size01, controls) * (depthOn ? layer.size : 1),
      sketch: i % 3,
    });
  }

  pending.sort((a, b) => b.reach - a.reach);
  const placed = spreadStars(pending, space);

  return placed.map((star) => ({
    x: star.x,
    y: star.y,
    size01: star.size01,
    phase: Math.random() * Math.PI * 2,
    phase01: Math.random(),
    seed: Math.random() * 100,
    layer: star.layer,
    sketch: star.sketch,
    tilt: (Math.random() - 0.5) * 28,
    jitterX: Math.random() * 2 - 1,
    jitterY: Math.random() * 2 - 1,
    jitterNext: 0,
    twitchAngle: (Math.random() * 2 - 1) * 16,
    twitchNext: 0,
    color: "",
    px: -1,
    glowOn: false,
    cls: "",
    el: null,
  }));
}

/** Union of the sample headline, kicker, and subcopy, in field pixels. */
export function measureTextHole(fieldEl, copyEl) {
  const field = fieldEl.getBoundingClientRect();
  const nodes = copyEl.querySelectorAll("h2, p");
  if (!nodes.length || field.width === 0 || field.height === 0) return null;

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  }

  return {
    left: left - field.left,
    top: top - field.top,
    right: right - field.left,
    bottom: bottom - field.top,
  };
}

export function readFieldSpace(fieldEl, copyEl) {
  const rect = fieldEl.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    hole: copyEl ? measureTextHole(fieldEl, copyEl) : null,
  };
}

export function starReach(size01, controls) {
  const lo = Math.min(controls.field.sizeMin, controls.field.sizeMax);
  const hi = Math.max(controls.field.sizeMin, controls.field.sizeMax);
  return (lo + size01 * (hi - lo)) / 2;
}

function quantizeSpace(space) {
  const q = (n) => Math.round((n || 0) / 4) * 4;
  const hole = space?.hole;
  return {
    width: q(space?.width),
    height: q(space?.height),
    hole: hole
      ? { left: q(hole.left), top: q(hole.top), right: q(hole.right), bottom: q(hole.bottom) }
      : null,
  };
}

function freeArea(space) {
  const width = Math.max(0, space?.width || 0);
  const height = Math.max(0, space?.height || 0);
  let area = width * height;
  const hole = space?.hole;
  if (hole) {
    area -= Math.max(0, hole.right - hole.left) * Math.max(0, hole.bottom - hole.top);
  }
  return Math.max(1, area);
}

function fitField(controls, space) {
  const width = Math.max(0, space?.width || 0);
  const height = Math.max(0, space?.height || 0);
  const authored = controls.field;
  let sizeMin = Math.min(authored.sizeMin, authored.sizeMax);
  let sizeMax = Math.max(authored.sizeMin, authored.sizeMax);
  const authoredSizeMax = sizeMax;
  let capped = false;

  if (width > 0 && height > 0) {
    const short = Math.min(width, height);
    let cap = short - 16;
    if (authored.shape === "sticker") cap = Math.min(cap, Math.max(28, short * 0.2));
    if (sizeMax > cap && cap > 8) {
      const scale = cap / sizeMax;
      sizeMax = Math.round(cap);
      sizeMin = Math.max(8, Math.round(sizeMin * scale));
      capped = authored.shape === "sticker";
    }
  }

  let count = Math.max(1, Math.round(authored.count));
  if (width > 0 && height > 0 && authored.shape !== "sticker") {
    const ratio = (width * height) / FULL_STAGE_AREA;
    count = Math.max(1, Math.round(authored.count * Math.min(1, ratio)));
  }

  const avg = (sizeMin + sizeMax) / 2;
  const cell = Math.max(8, avg + TOUCH_GAP);
  const capacity = Math.max(1, Math.floor(freeArea(space) / (cell * cell)));
  count = Math.min(count, capacity, Math.max(1, Math.round(authored.count)));

  return {
    controls: {
      ...controls,
      field: { ...authored, count, sizeMin, sizeMax },
    },
    meta: {
      authoredCount: Math.round(authored.count),
      capped,
      shownSizeMax: sizeMax,
      authoredSizeMax,
    },
  };
}

function spreadStars(pending, space) {
  const width = space?.width || 0;
  const height = space?.height || 0;
  if (width < 8 || height < 8 || pending.length === 0) return [];

  let minCenter = Math.sqrt(freeArea(space) / pending.length) * 0.75;
  let best = [];

  for (let pass = 0; pass < 4; pass++) {
    const placed = [];
    for (const star of pending) {
      const spot = findSpot(space, star.reach, placed, minCenter);
      if (spot) placed.push({ ...star, ...spot });
    }
    if (placed.length > best.length) best = placed;
    if (placed.length === pending.length) break;
    minCenter *= 0.72;
  }

  return best;
}

function findSpot(space, reach, placed, minCenter) {
  const width = space.width;
  const height = space.height;
  const edge = Math.max(4, reach + 2);
  if (width <= edge * 2 || height <= edge * 2) return null;

  for (let attempt = 0; attempt < 100; attempt++) {
    const px = edge + Math.random() * (width - edge * 2);
    const py = edge + Math.random() * (height - edge * 2);
    if (overlapsText(px, py, reach, space.hole)) continue;
    let blocked = false;
    for (const other of placed) {
      const need = Math.max(minCenter, reach + other.reach + TOUCH_GAP);
      const dx = px - other.px;
      const dy = py - other.py;
      if (dx * dx + dy * dy < need * need) {
        blocked = true;
        break;
      }
    }
    if (blocked) continue;
    return { x: px / width, y: py / height, px, py };
  }

  return null;
}

function overlapsText(px, py, reach, hole) {
  if (!hole) return false;
  const left = hole.left - reach - TEXT_GAP;
  const right = hole.right + reach + TEXT_GAP;
  const top = hole.top - reach - TEXT_GAP;
  const bottom = hole.bottom + reach + TEXT_GAP;
  return px > left && px < right && py > top && py < bottom;
}

/** Slide a star's pixel offset back to the edge of the headline gap. */
function pushOutOfText(homeX, homeY, dx, dy, radius, hole) {
  let cx = homeX + dx;
  let cy = homeY + dy;
  const reach = radius + TEXT_GAP;
  const left = hole.left - reach;
  const right = hole.right + reach;
  const top = hole.top - reach;
  const bottom = hole.bottom + reach;
  if (cx <= left || cx >= right || cy <= top || cy >= bottom) {
    return { x: dx, y: dy };
  }

  const toLeft = cx - left;
  const toRight = right - cx;
  const toTop = cy - top;
  const toBottom = bottom - cy;
  const nearest = Math.min(toLeft, toRight, toTop, toBottom);
  if (nearest === toLeft) cx = left;
  else if (nearest === toRight) cx = right;
  else if (nearest === toTop) cy = top;
  else cy = bottom;
  return { x: cx - homeX, y: cy - homeY };
}

export function paintStars(stars, t, controls, space) {
  const fx = indexEffects(controls.effects);
  const { sizeMin, sizeMax, resting, shape } = controls.field;
  const depthOn = fx.parallax.enabled;
  const loSize = Math.min(sizeMin, sizeMax);
  const hiSize = Math.max(sizeMin, sizeMax);

  for (const star of stars) {
    const motion = depthOn ? star.layer.motion : 1;

    if (fx.jitter.enabled && t >= star.jitterNext) {
      star.jitterX = Math.random() * 2 - 1;
      star.jitterY = Math.random() * 2 - 1;
      star.jitterNext = t + Math.max(0.03, fx.jitter.interval);
    }
    if (fx.twitch.enabled && t >= star.twitchNext) {
      star.twitchAngle = (Math.random() * 2 - 1) * fx.twitch.degrees;
      star.twitchNext = t + Math.max(0.03, fx.twitch.interval);
    }

    let x = 0;
    let y = 0;

    if (fx.drift.enabled) {
      const w = t * fx.drift.speed * Math.PI * 2 + star.phase;
      x += Math.sin(w) * fx.drift.distance * motion;
      y += Math.cos(w * 0.73) * fx.drift.distance * 0.65 * motion;
    }
    if (fx.wiggleX.enabled) {
      const w = t * fx.wiggleX.speed * Math.PI * 2 + star.phase;
      x += Math.sin(w) * fx.wiggleX.distance * motion;
    }
    if (fx.wiggleY.enabled) {
      const w = t * fx.wiggleY.speed * Math.PI * 2 + star.phase * 1.7;
      y += Math.sin(w) * fx.wiggleY.distance * motion;
    }
    if (fx.orbit.enabled) {
      const w = t * fx.orbit.speed * Math.PI * 2 + star.phase;
      x += Math.cos(w) * fx.orbit.radius * motion;
      y += Math.sin(w) * fx.orbit.radius * motion;
    }
    if (fx.jitter.enabled) {
      x += star.jitterX * fx.jitter.distance * motion;
      y += star.jitterY * fx.jitter.distance * motion;
    }

    let scale = 1;
    if (fx.scale.enabled) {
      const wave = wave01(t * fx.scale.speed, star.phase);
      const lo = Math.min(fx.scale.min, fx.scale.max);
      const hi = Math.max(fx.scale.min, fx.scale.max);
      scale = lo + (hi - lo) * wave;
    }

    let scaleX = scale;
    let scaleY = scale;
    if (fx.squash.enabled) {
      const s = Math.sin(t * fx.squash.speed * Math.PI * 2 + star.phase);
      scaleX *= 1 + s * fx.squash.amount;
      scaleY *= 1 - s * fx.squash.amount;
    }
    if (depthOn) {
      scaleX *= star.layer.size;
      scaleY *= star.layer.size;
    }
    scaleX = Math.max(0.05, scaleX);
    scaleY = Math.max(0.05, scaleY);

    let angle = shape === "sticker" ? star.tilt : 0;
    if (fx.spin.enabled) angle += t * fx.spin.speed;
    if (fx.wobble.enabled) {
      angle += Math.sin(t * fx.wobble.speed * Math.PI * 2 + star.phase) * fx.wobble.degrees;
    }
    if (fx.twitch.enabled) angle += star.twitchAngle;

    let opacity = clamp(resting, 0, 1);
    if (fx.fade.enabled) {
      const wave = wave01(t * fx.fade.speed, star.phase);
      const lo = Math.min(fx.fade.min, fx.fade.max);
      const hi = Math.max(fx.fade.min, fx.fade.max);
      opacity = lo + (hi - lo) * wave;
    }
    if (fx.flicker.enabled) {
      const n = flicker01(t * fx.flicker.speed, star.seed);
      opacity *= 1 - fx.flicker.amount + fx.flicker.amount * n;
    }
    if (fx.blink.enabled) {
      const cycle = (t * fx.blink.speed + star.phase01) % 1;
      opacity *= cycle < fx.blink.duty ? 1 : fx.blink.off;
    }
    if (fx.flash.enabled) {
      const cycle = (t * fx.flash.speed + star.phase01) % 1;
      const dist = Math.min(cycle, 1 - cycle);
      const sharp = dist * fx.flash.sharpness;
      const peak = Math.exp(-(sharp * sharp));
      opacity = Math.max(opacity, peak);
    }
    if (depthOn) opacity *= star.layer.brightness;
    opacity = clamp(opacity, 0, 1);

    let color = "#fff";
    if (fx.colour.enabled) {
      const wave = wave01(t * fx.colour.speed, star.phase);
      color = mixHex("#ffffff", fx.colour.target, wave * fx.colour.amount);
    }

    const el = star.el;
    const cls = shape === "sketched"
      ? `star star-sketched star-sketched-${star.sketch}`
      : shape === "sticker"
        ? `star star-sticker star-sticker-${star.sketch}`
        : `star star-${shape}`;
    if (star.cls !== cls) {
      star.cls = cls;
      el.className = cls;
    }

    const px = Math.round((loSize + star.size01 * (hiSize - loSize)) * 10) / 10;
    if (star.px !== px) {
      star.px = px;
      el.style.width = `${px}px`;
      el.style.height = `${px}px`;
    }

    if (star.color !== color) {
      star.color = color;
      el.style.color = color;
    }

    if (fx.glow.enabled) {
      const radius = fx.glow.min + (fx.glow.max - fx.glow.min) * opacity;
      el.style.boxShadow = `0 0 ${radius}px ${radius * 0.45}px ${color}`;
      star.glowOn = true;
    } else if (star.glowOn) {
      el.style.boxShadow = "";
      star.glowOn = false;
    }

    if (space?.hole && space.width > 0 && space.height > 0) {
      const radius = (px * Math.max(scaleX, scaleY)) / 2;
      const pushed = pushOutOfText(
        star.x * space.width,
        star.y * space.height,
        x,
        y,
        radius,
        space.hole
      );
      x = pushed.x;
      y = pushed.y;
    }

    el.style.opacity = String(opacity);
    el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
  }
}

function indexEffects(effects) {
  const map = {};
  for (const effect of effects) {
    const values = { enabled: effect.enabled };
    for (const param of effect.params) values[param.key] = param.value;
    map[effect.id] = values;
  }
  return map;
}

function wave01(cycles, phase) {
  return 0.5 + 0.5 * Math.sin(cycles * Math.PI * 2 + phase);
}

/** A few uneven sine waves, so flicker does not look like a steady pulse. */
function flicker01(cycles, seed) {
  const n =
    Math.sin(cycles * Math.PI * 2 + seed) +
    Math.sin(cycles * Math.PI * 2 * 2.37 + seed * 1.7) +
    Math.sin(cycles * Math.PI * 2 * 5.13 + seed * 3.1);
  return clamp(n / 3 * 0.5 + 0.5, 0, 1);
}

function mixHex(from, to, amount) {
  const a = hexRgb(from);
  const b = hexRgb(to);
  const u = clamp(amount, 0, 1);
  const r = Math.round(a[0] + (b[0] - a[0]) * u);
  const g = Math.round(a[1] + (b[1] - a[1]) * u);
  const bl = Math.round(a[2] + (b[2] - a[2]) * u);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}
