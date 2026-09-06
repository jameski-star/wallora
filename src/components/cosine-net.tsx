"use client";

import { useEffect, useRef } from "react";

export interface CosineWaveNetProps {
  /** Height / intensity of the wave peaks (default: 26) */
  amplitude?: number;
  /** Speed of wave movement (default: 0.0016) */
  speed?: number;
  /** Line density across horizontal axis (default: 42) */
  cols?: number;
  /** Line density across vertical axis (default: 26) */
  rows?: number;
  /** Primary wireframe net color (default: CME Blue rgb 0, 110, 182) */
  baseColor?: string;
  /** Optional highlight accent color for peaks */
  peakColor?: string;
  /** Overall container opacity (default: 0.65) */
  opacity?: number;
  /** Mask style to make it faint in certain areas */
  fadePreset?: "center-faint" | "edges-faint" | "hero-spotlight" | "diagonal-subtle";
  className?: string;
}

export function CosineWaveNet({
  amplitude = 24,
  speed = 0.0016,
  cols = 40,
  rows = 24,
  baseColor = "0, 110, 182", // CME #006eb6
  peakColor = "56, 189, 248", // Cyan-400
  opacity = 0.6,
  fadePreset = "hero-spotlight",
  className = "",
}: CosineWaveNetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let dpr = 1;

    // Detect device pixel ratio for crisp rendering on Retina / 4K
    const updateDimensions = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      const w = rect.width || 800;
      const h = rect.height || 500;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);

    // Stop requestAnimationFrame when scrolled out of view to save 100% CPU
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const render = () => {
      if (isVisibleRef.current) {
        if (!prefersReducedMotion) {
          time += speed;
        }

        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const stepX = width / cols;
        const stepY = height / rows;

        // Compute 3D sinusoidal mesh coordinates:
        // Z(x, y) = sin(x * freqX + t) * cos(y * freqY + t) * amplitude
        const grid: { x: number; y: number; zNorm: number }[][] = [];

        for (let r = 0; r <= rows; r++) {
          grid[r] = [];
          for (let c = 0; c <= cols; c++) {
            const rawX = c * stepX;
            const rawY = r * stepY;

            // Two interfering harmonic cosine & sine waves
            const w1 =
              Math.sin(c * 0.24 + time * 1.8) *
              Math.cos(r * 0.22 + time * 1.4);
            const w2 =
              Math.cos(c * 0.12 - time * 1.1) *
              Math.sin((r + c) * 0.08 + time * 0.9);

            const combinedWave = (w1 * 0.75 + w2 * 0.25) * amplitude;

            // Normalized height [-1, 1] for peak illumination
            const zNorm = Math.max(
              -1,
              Math.min(1, combinedWave / (amplitude || 1))
            );

            // 2D projection with wave displacement
            grid[r][c] = {
              x: rawX,
              y: rawY + combinedWave,
              zNorm,
            };
          }
        }

        ctx.lineWidth = 1;

        // 1. Draw horizontal undulating contour lines
        for (let r = 0; r <= rows; r++) {
          ctx.beginPath();
          for (let c = 0; c <= cols; c++) {
            const pt = grid[r][c];
            if (c === 0) {
              ctx.moveTo(pt.x, pt.y);
            } else {
              // Smooth bezier curve through points
              const prev = grid[r][c - 1];
              const midX = (prev.x + pt.x) / 2;
              const midY = (prev.y + pt.y) / 2;
              ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
            }
          }

          // Subtle gradient based on row depth
          const rowProgress = r / rows;
          const alpha = (0.12 + Math.sin(rowProgress * Math.PI) * 0.18).toFixed(
            2
          );
          ctx.strokeStyle = `rgba(${baseColor}, ${alpha})`;
          ctx.stroke();
        }

        // 2. Draw vertical connecting ribs that form the "net"
        for (let c = 0; c <= cols; c++) {
          ctx.beginPath();
          for (let r = 0; r <= rows; r++) {
            const pt = grid[r][c];
            if (r === 0) {
              ctx.moveTo(pt.x, pt.y);
            } else {
              const prev = grid[r - 1][c];
              const midX = (prev.x + pt.x) / 2;
              const midY = (prev.y + pt.y) / 2;
              ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
            }
          }

          const colProgress = c / cols;
          const alpha = (0.08 + Math.sin(colProgress * Math.PI) * 0.12).toFixed(
            2
          );
          ctx.strokeStyle = `rgba(${baseColor}, ${alpha})`;
          ctx.stroke();
        }

        // 3. Optional faint glowing vertex nodes at wave peaks
        for (let r = 2; r < rows; r += 2) {
          for (let c = 2; c < cols; c += 2) {
            const pt = grid[r][c];
            if (pt.zNorm > 0.65) {
              const nodeAlpha = ((pt.zNorm - 0.65) * 0.8).toFixed(2);
              ctx.fillStyle = `rgba(${peakColor}, ${nodeAlpha})`;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [amplitude, speed, cols, rows, baseColor, peakColor]);

  // Mask presets to make the net faint in specific target zones
  const getMaskStyle = () => {
    switch (fadePreset) {
      case "hero-spotlight":
        // Faint in the center (where hero text and mockup sit), more visible towards top-right and lower flanks
        return {
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.65) 65%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.65) 65%, transparent 100%)",
        };
      case "center-faint":
        // Completely faint in middle, framing the page
        return {
          maskImage:
            "radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,0.4) 60%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,0.4) 60%, transparent 95%)",
        };
      case "edges-faint":
        // Soft vignette in center fading to nothing at borders
        return {
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 65%, transparent 95%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 65%, transparent 95%)",
        };
      case "diagonal-subtle":
        // Slanted falloff across the canvas
        return {
          maskImage:
            "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 90%)",
          WebkitMaskImage:
            "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 90%)",
        };
      default:
        return undefined;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        opacity,
        ...getMaskStyle(),
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
