import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Interactive 2D function plotter using HTML Canvas.
 * Reusable for any mathematical function visualization.
 *
 * @param {Array} functions - Array of { fn: x => y, label, color, dash? }
 * @param {Array} [xRange=[-6, 6]] - X-axis domain
 * @param {Array} [yRange=[-2, 4]] - Y-axis range
 * @param {number} [height=280] - Canvas height
 * @param {boolean} [showGrid=true] - Show grid lines
 * @param {boolean} [showAxes=true] - Show axis lines
 * @param {boolean} [interactive=true] - Show crosshair on hover
 * @param {string} [title] - Chart title
 */
export default function FunctionPlot({
  functions = [],
  xRange = [-6, 6],
  yRange = [-2, 4],
  height = 280,
  showGrid = true,
  showAxes = true,
  interactive = true,
  title,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(600);

  // Responsive width
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(entry.contentRect.width);
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const toCanvasX = useCallback((x) => {
    return ((x - xRange[0]) / (xRange[1] - xRange[0])) * canvasWidth;
  }, [xRange, canvasWidth]);

  const toCanvasY = useCallback((y) => {
    return height - ((y - yRange[0]) / (yRange[1] - yRange[0])) * height;
  }, [yRange, height]);

  const fromCanvasX = useCallback((cx) => {
    return xRange[0] + (cx / canvasWidth) * (xRange[1] - xRange[0]);
  }, [xRange, canvasWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvasWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvasWidth, height);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      for (let x = Math.ceil(xRange[0]); x <= xRange[1]; x++) {
        const cx = toCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();
      }
      for (let y = Math.ceil(yRange[0]); y <= yRange[1]; y++) {
        const cy = toCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(canvasWidth, cy);
        ctx.stroke();
      }
    }

    // Axes
    if (showAxes) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      // X-axis
      const yZero = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(0, yZero);
      ctx.lineTo(canvasWidth, yZero);
      ctx.stroke();
      // Y-axis
      const xZero = toCanvasX(0);
      ctx.beginPath();
      ctx.moveTo(xZero, 0);
      ctx.lineTo(xZero, height);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = '#555';
      ctx.font = '11px "Iosevka Charon", sans-serif';
      for (let x = Math.ceil(xRange[0]); x <= xRange[1]; x++) {
        if (x === 0) continue;
        ctx.fillText(x.toString(), toCanvasX(x) - 4, yZero + 14);
      }
      for (let y = Math.ceil(yRange[0]); y <= yRange[1]; y++) {
        if (y === 0) continue;
        ctx.fillText(y.toString(), toCanvasX(0) + 6, toCanvasY(y) + 4);
      }
    }

    // Plot functions
    const step = (xRange[1] - xRange[0]) / canvasWidth;
    functions.forEach(({ fn, color, dash }) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      if (dash) ctx.setLineDash(dash);
      else ctx.setLineDash([]);

      ctx.beginPath();
      let started = false;
      for (let x = xRange[0]; x <= xRange[1]; x += step) {
        const y = fn(x);
        if (!isFinite(y) || Math.abs(y) > 100) {
          started = false;
          continue;
        }
        const cx = toCanvasX(x);
        const cy = toCanvasY(y);
        if (!started) {
          ctx.moveTo(cx, cy);
          started = true;
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Crosshair + values
    if (interactive && mousePos !== null) {
      const mx = mousePos;
      const xVal = fromCanvasX(mx);
      const cxLine = mx;

      // Vertical crosshair
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cxLine, 0);
      ctx.lineTo(cxLine, height);
      ctx.stroke();

      // Evaluate each function at x
      functions.forEach(({ fn, color, label }) => {
        const yVal = fn(xVal);
        if (!isFinite(yVal)) return;
        const cyDot = toCanvasY(yVal);

        // Dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cxLine, cyDot, 5, 0, Math.PI * 2);
        ctx.fill();

        // Ring
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cxLine, cyDot, 8, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Values tooltip
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      const tooltipX = mx < canvasWidth / 2 ? mx + 15 : mx - 150;
      const tooltipY = 12;
      const tooltipW = 135;
      const tooltipH = 20 + functions.length * 18;
      ctx.fillRect(tooltipX, tooltipY, tooltipW, tooltipH);

      ctx.fillStyle = '#888';
      ctx.font = '11px "Iosevka Charon", monospace';
      ctx.fillText(`x = ${xVal.toFixed(2)}`, tooltipX + 8, tooltipY + 15);

      functions.forEach(({ fn, color, label }, i) => {
        const yVal = fn(xVal);
        ctx.fillStyle = color;
        ctx.fillText(`${label}: ${yVal.toFixed(3)}`, tooltipX + 8, tooltipY + 33 + i * 18);
      });
    }

    // Legend — measure text to avoid overlaps
    ctx.font = '12px "Iosevka Charon", sans-serif';
    const legendPadRight = 16;
    let legendY = 20;
    ctx.textAlign = 'right';
    functions.forEach(({ label, color, dash }) => {
      const textW = ctx.measureText(label).width;
      const lineLen = 22;
      const gap = 8;
      const textX = canvasWidth - legendPadRight;
      const lineEndX = textX - textW - gap;
      const lineStartX = lineEndX - lineLen;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      if (dash) ctx.setLineDash(dash);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(lineStartX, legendY);
      ctx.lineTo(lineEndX, legendY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.font = '12px "Iosevka Charon", sans-serif';
      ctx.fillText(label, textX, legendY + 4);
      legendY += 20;
    });
    ctx.textAlign = 'left';

  }, [functions, xRange, yRange, height, canvasWidth, showGrid, showAxes, interactive, mousePos, toCanvasX, toCanvasY, fromCanvasX]);

  return (
    <div ref={containerRef} style={{ width: '100%', marginTop: '16px', marginBottom: '10px' }}>
      {title && (
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#333',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>{title}</div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: `${height}px`,
          borderRadius: '8px',
          border: '1px solid var(--border)',
          cursor: interactive ? 'crosshair' : 'default',
          display: 'block',
        }}
        onMouseMove={(e) => {
          if (!interactive) return;
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos(e.clientX - rect.left);
        }}
        onMouseLeave={() => setMousePos(null)}
      />
    </div>
  );
}
