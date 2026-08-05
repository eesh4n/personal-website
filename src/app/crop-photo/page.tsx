"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 340;
const EXPORT_SIZE = 680;

export default function CropPhotoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [src, setSrc] = useState("/about-photo.jpg");

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth) {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, [src]);

  function onImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSrc(URL.createObjectURL(file));
    setStatus("idle");
  }

  const baseScale = naturalSize ? Math.max(SIZE / naturalSize.w, SIZE / naturalSize.h) : 1;
  const effectiveScale = baseScale * zoom;

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }
  function onPointerUp() {
    setDragging(false);
  }

  async function handleSave() {
    const img = imgRef.current;
    if (!img || !naturalSize) return;
    setStatus("saving");

    const canvas = document.createElement("canvas");
    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const factor = EXPORT_SIZE / SIZE;
    const drawW = naturalSize.w * effectiveScale * factor;
    const drawH = naturalSize.h * effectiveScale * factor;
    const drawX = EXPORT_SIZE / 2 - drawW / 2 + pan.x * factor;
    const drawY = EXPORT_SIZE / 2 - drawH / 2 + pan.y * factor;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setStatus("error");
          return;
        }
        try {
          const res = await fetch("/api/save-about-photo", { method: "POST", body: blob });
          setStatus(res.ok ? "saved" : "error");
        } catch {
          setStatus("error");
        }
      },
      "image/jpeg",
      0.92
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--surface-page)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 40,
      }}
    >
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", margin: 0 }}>
        Crop about-photo
      </h1>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0, maxWidth: 380, textAlign: "center" }}>
        Drag to pan, use the slider to zoom. Save writes straight to public/about-photo.jpg — local dev only.
      </p>

      <input type="file" accept="image/*" onChange={onFileChange} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-secondary)" }} />

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
          border: "1px solid var(--border-strong)",
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "none",
          background: "var(--surface-inset)",
        }}
      >
        {naturalSize && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={src}
            alt="crop target"
            onLoad={onImgLoad}
            draggable={false}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: naturalSize.w * effectiveScale,
              height: naturalSize.h * effectiveScale,
              maxWidth: "none",
              maxHeight: "none",
              transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px))`,
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        )}
        {!naturalSize && (
          // eslint-disable-next-line @next/next/no-img-element
          <img ref={imgRef} src={src} alt="" onLoad={onImgLoad} style={{ display: "none" }} />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, width: SIZE }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>zoom</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{ flex: 1 }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!naturalSize || status === "saving"}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-wide)",
          padding: "10px 24px",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--text-primary)",
          background: "var(--text-primary)",
          color: "var(--void-000)",
          cursor: "pointer",
        }}
      >
        {status === "saving" ? "saving…" : "save crop"}
      </button>

      {status === "saved" && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--signal-green)" }}>
          saved to public/about-photo.jpg — refresh the site to see it.
        </p>
      )}
      {status === "error" && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--signal-red)" }}>
          save failed — check the terminal running `npm run dev` for the error.
        </p>
      )}
    </div>
  );
}
