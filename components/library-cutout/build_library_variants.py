"""Build greyscale smooth-frame library cutouts for each source photo."""
from __future__ import annotations

import importlib.util
import re
import subprocess
import sys
from io import BytesIO
from pathlib import Path

import base64

import numpy as np
from PIL import Image, ImageOps
from scipy.ndimage import gaussian_filter

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
ASSETS = Path("/Users/mr/.cursor/projects/Users-mr-Public-foresightgr-site/assets")
SKILL = Path.home() / ".cursor/skills/making-scrapbook-cutouts/scripts/rip_cutout.py"
FRAMES = Path("/tmp/make_uniform_frames.py")
PY = ROOT / ".venv-cutout/bin/python3"

VARIANTS = [
    {
        "id": "collage",
        "source": ASSETS / "image-38fa4ba5-2d1d-4c26-b22b-4d2b250149f4.jpg",
        "scale": 0.78,
        "dy": 58,
    },
    {
        "id": "crumpled",
        "source": ASSETS / "image-7d7fccb8-bc1b-4be6-b619-f7d43e6a3a54.jpg",
        "scale": 0.72,
        "dy": 48,
    },
    {
        "id": "illustration",
        "source": ASSETS / "image-86e90858-8ae5-4552-ad3b-c476e479fb2a.png",
        "scale": 0.88,
        "dy": 24,
    },
]


def load_modules():
    spec = importlib.util.spec_from_file_location("rip_cutout", SKILL)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    spec2 = importlib.util.spec_from_file_location("frames", FRAMES)
    frames = importlib.util.module_from_spec(spec2)
    spec2.loader.exec_module(frames)
    return mod, frames


def grey_rgb(path: Path, dest: Path) -> None:
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    grey = ImageOps.grayscale(im).convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    grey.save(dest, optimize=True)


def run_rip(grey_path: Path, rip_path: Path, preview_path: Path) -> None:
    subprocess.run(
        [
            str(PY),
            str(SKILL),
            str(grey_path),
            "-o",
            str(rip_path),
            "--preview",
            str(preview_path),
            "--model",
            "birefnet-general",
            "--fiber",
            "0",
            "--wobble",
            "0",
        ],
        check=True,
    )


def svg_rgba(path: Path) -> np.ndarray:
    text = path.read_text()
    match = re.search(r'href="data:image/png;base64,([^"]+)"', text)
    if not match:
        raise SystemExit(f"no embedded image in {path}")
    return np.asarray(Image.open(BytesIO(base64.b64decode(match.group(1)))).convert("RGBA"))


def framed_variant(
    mod,
    frames,
    rip_path: Path,
    frame_path: Path,
    preview_path: Path,
    scale: float,
    dy: int,
) -> None:
    rgba = svg_rgba(rip_path)
    alpha = rgba[..., 3]
    mask = alpha > 20
    ys, xs = np.nonzero(mask)
    y0 = int(ys.min())
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    y1 = int(ys.max()) + 1
    crop = rgba[y0:y1, x0:x1]
    ch, cw = crop.shape[:2]
    new_w = max(1, int(round(cw * scale)))
    new_h = max(1, int(round(ch * scale)))
    scaled = np.asarray(
        Image.fromarray(crop).resize((new_w, new_h), Image.Resampling.LANCZOS)
    )

    canvas_w, canvas_h = rgba.shape[1], rgba.shape[0]
    canvas = np.zeros((canvas_h, canvas_w, 4), dtype=np.uint8)
    x_off = (canvas_w - new_w) // 2
    y_off = min(canvas_h - new_h - 12, y0 + dy)
    canvas[y_off : y_off + new_h, x_off : x_off + new_w] = scaled

    sub_mask = canvas[..., 3].astype(np.float32) / 255.0
    sub_mask = gaussian_filter(sub_mask, 0.6) > 0.5
    sub_mask = mod.keep_large(sub_mask, 400)
    ys2, xs2 = np.nonzero(sub_mask)
    width = int(xs2.max() - xs2.min()) + 1
    border, card_scale = frames.border_for(width)
    sub_mask = frames.soften_mask(sub_mask, card_scale)
    sub_mask = mod.keep_large(sub_mask, 400)
    feather = np.clip(gaussian_filter(sub_mask.astype(np.float32), 0.8), 0, 1)
    canvas[..., 3] = np.clip(canvas[..., 3].astype(np.float32) * feather, 0, 255).astype(
        np.uint8
    )
    smooth = frames.SMOOTH_PX / card_scale
    cropped, loops = frames.frame(canvas, sub_mask, border, smooth)
    frames.write(frame_path, cropped, loops)
    # blue-card preview beside frame
    blue = frame_path.with_name(frame_path.stem + "-preview-blue.png")
    if preview_path != blue and blue.exists():
        pass
    print(f"  {frame_path.name} {cropped.shape[1]}x{cropped.shape[0]} y_off={y_off}")


def main() -> None:
    if not PY.is_file():
        raise SystemExit(f"missing venv python: {PY}")
    mod, frames = load_modules()
    tmp = OUT / ".build"
    tmp.mkdir(exist_ok=True)

    for v in VARIANTS:
        vid = v["id"]
        src = v["source"]
        if not src.is_file():
            raise SystemExit(f"missing source for {vid}: {src}")
        print(f"\n=== {vid} ===")
        grey_path = tmp / f"{vid}-grey.png"
        grey_rgb(src, grey_path)
        rip_path = OUT / f"library-rip-{vid}.svg"
        rip_preview = OUT / f"library-rip-{vid}-preview.png"
        run_rip(grey_path, rip_path, rip_preview)
        frame_path = OUT / f"library-frame-{vid}.svg"
        frame_preview = OUT / f"library-frame-{vid}-preview.png"
        framed_variant(
            mod,
            frames,
            rip_path,
            frame_path,
            frame_preview,
            v["scale"],
            v["dy"],
        )

    active = "illustration"
    for name in ("library-rip.svg", "library-frame.svg"):
        stem = name.replace(".svg", "")
        target = OUT / f"{stem}-{active}.svg"
        (OUT / name).write_bytes(target.read_bytes())
    for kind in ("rip", "frame"):
        for suffix in ("-preview.png", "-preview-blue.png"):
            src = OUT / f"library-{kind}-{active}{suffix}"
            if src.is_file():
                (OUT / f"library-{kind}{suffix}").write_bytes(src.read_bytes())

    print(f"\nActive on site: library-frame-{active}.svg (copied to library-frame.svg)")


if __name__ == "__main__":
    main()
