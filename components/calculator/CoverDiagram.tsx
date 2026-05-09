"use client";

import { useId } from "react";
import type { CoverInput, CoverCalcOutput } from "@kdp/calc";
import { clsx } from "clsx";

type Props = {
  input: CoverInput;
  output: CoverCalcOutput;
  className?: string;
};

const SAGE = "#9CAF88";
const WARM = "#C97B5C";
const INK = "#1F2421";
const IVORY = "#FBF7EB";
const HINGE = "#C97B5C";

export function CoverDiagram({ input, output, className }: Props) {
  const { fullCoverWidthIn: W, fullCoverHeightIn: H, spineWidthIn: S, safeZones, barcodeBox } = output;
  const { format, trimWidthIn: tw } = input;

  const padding = 0.25;
  const vbW = W + padding * 2;
  const vbH = H + padding * 2;

  // Origin offset for the cover within the viewBox.
  const ox = padding;
  const oy = padding;

  // Edge inset for the actual content area (where spine sits).
  const edge = format === "paperback" ? 0.125 : 0.51;
  const back = { x: ox + edge, y: oy + edge, w: tw, h: H - 2 * edge };
  const spine = { x: back.x + tw, y: back.y, w: S, h: back.h };
  const front = { x: spine.x + S, y: back.y, w: tw, h: back.h };

  // Safe zone insets, drawn relative to the trim panels.
  const safeInset = format === "paperback" ? 0.125 : 0.635;

  const titleId = useId();
  const descId = useId();
  const description = `${format === "paperback" ? "Paperback" : "Hardcover"} cover layout. Trim ${input.trimWidthIn} by ${input.trimHeightIn} inches. Spine width ${output.spineWidthIn.toFixed(4)} inches (${output.spineWidthMm.toFixed(2)} mm). Full cover ${output.fullCoverWidthIn.toFixed(4)} by ${output.fullCoverHeightIn.toFixed(4)} inches. Diagram shows back panel, spine, front panel, safe-zone insets, and barcode placement on back cover.`;

  return (
    <svg
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      viewBox={`0 0 ${vbW} ${vbH}`}
      className={clsx("block w-full max-w-full rounded-md bg-sage-50", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={titleId}>Cover layout diagram</title>
      <desc id={descId}>{description}</desc>
      {/* Bleed / outer cover bounds */}
      <rect
        x={ox}
        y={oy}
        width={W}
        height={H}
        fill={IVORY}
        stroke={INK}
        strokeWidth={0.01}
      />

      {/* Hardcover wrap fold lines */}
      {format === "hardcover" && (
        <rect
          x={back.x}
          y={back.y}
          width={W - 2 * edge}
          height={back.h}
          fill="none"
          stroke={SAGE}
          strokeDasharray="0.06 0.06"
          strokeWidth={0.012}
        />
      )}

      {/* Back panel */}
      <rect x={back.x} y={back.y} width={back.w} height={back.h} fill="none" stroke={INK} strokeWidth={0.012} />
      {/* Spine */}
      <rect x={spine.x} y={spine.y} width={spine.w} height={spine.h} fill={SAGE} fillOpacity={0.15} stroke={INK} strokeWidth={0.012} />
      {/* Front panel */}
      <rect x={front.x} y={front.y} width={front.w} height={front.h} fill="none" stroke={INK} strokeWidth={0.012} />

      {/* Safe zones inside back & front */}
      <rect
        x={back.x + safeInset}
        y={back.y + safeInset}
        width={back.w - 2 * safeInset}
        height={back.h - 2 * safeInset}
        fill="none"
        stroke={WARM}
        strokeDasharray="0.04 0.04"
        strokeWidth={0.01}
      />
      <rect
        x={front.x + safeInset}
        y={front.y + safeInset}
        width={front.w - 2 * safeInset}
        height={front.h - 2 * safeInset}
        fill="none"
        stroke={WARM}
        strokeDasharray="0.04 0.04"
        strokeWidth={0.01}
      />

      {/* Hardcover hinge dead-zones */}
      {format === "hardcover" && safeZones.spineHinge > 0 && (
        <>
          <rect
            x={spine.x - safeZones.spineHinge}
            y={spine.y}
            width={safeZones.spineHinge}
            height={spine.h}
            fill={HINGE}
            fillOpacity={0.12}
          />
          <rect
            x={spine.x + spine.w}
            y={spine.y}
            width={safeZones.spineHinge}
            height={spine.h}
            fill={HINGE}
            fillOpacity={0.12}
          />
        </>
      )}

      {/* Barcode placement on back cover */}
      <rect
        x={ox + barcodeBox.x}
        y={oy + barcodeBox.y}
        width={barcodeBox.w}
        height={barcodeBox.h}
        fill={INK}
        fillOpacity={0.08}
        stroke={INK}
        strokeWidth={0.008}
      />
      <text
        x={ox + barcodeBox.x + barcodeBox.w / 2}
        y={oy + barcodeBox.y + barcodeBox.h / 2}
        fontSize={0.12}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={INK}
        fillOpacity={0.6}
      >
        Barcode
      </text>

      {/* Labels */}
      <text x={back.x + back.w / 2} y={back.y - 0.06} fontSize={0.13} textAnchor="middle" fill={INK} fillOpacity={0.7}>
        Back
      </text>
      <text x={front.x + front.w / 2} y={front.y - 0.06} fontSize={0.13} textAnchor="middle" fill={INK} fillOpacity={0.7}>
        Front
      </text>
      {S >= 0.25 && (
        <text
          x={spine.x + spine.w / 2}
          y={spine.y + spine.h / 2}
          fontSize={Math.min(0.11, spine.w * 0.45)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={INK}
          fillOpacity={0.75}
          transform={`rotate(-90 ${spine.x + spine.w / 2} ${spine.y + spine.h / 2})`}
        >
          Spine {output.spineWidthIn.toFixed(4)} in
        </text>
      )}

      <text
        x={ox + W / 2}
        y={oy + H + 0.18}
        fontSize={0.1}
        textAnchor="middle"
        fill={INK}
        fillOpacity={0.5}
      >
        Full cover {output.fullCoverWidthIn.toFixed(4)} × {output.fullCoverHeightIn.toFixed(4)} in
      </text>
    </svg>
  );
}
