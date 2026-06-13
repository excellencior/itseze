import React, { useRef, useEffect, useState } from 'react';

/**
 * GradientDecayViz — Shows how gradients decay through layers
 * for Sigmoid (max deriv 0.25) vs Tanh (max deriv 1.0).
 *
 * Uses a bar chart: each bar is the cumulative gradient after N layers.
 * Sigmoid: 0.25^n, Tanh: at a typical activation point (~0.65 per layer).
 */
export default function GradientDecayViz() {
  const canvasRef = useRef(null);
  const [layers, setLayers] = useState(6);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 480;
    const h = 260;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, w, h);

    const sigmoidMax = 0.25;
    const tanhTypical = 0.65; // typical gradient for a moderately activated tanh neuron
    const padLeft = 50;
    const padRight = 20;
    const padTop = 30;
    const padBottom = 40;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    // Axes
    ctx.strokeStyle = '#D4D4D4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + chartH);
    ctx.lineTo(padLeft + chartW, padTop + chartH);
    ctx.stroke();

    // Y-axis label
    ctx.save();
    ctx.fillStyle = '#888';
    ctx.font = '11px "Iosevka Charon", sans-serif';
    ctx.textAlign = 'center';
    ctx.translate(14, padTop + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Gradient strength', 0, 0);
    ctx.restore();

    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px "Iosevka Charon", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Gradient reaching each layer (backprop)', w / 2, 16);

    const barGroupW = chartW / layers;
    const barW = Math.min(barGroupW * 0.3, 24);
    const gap = 4;

    // We use a log scale for visibility since values get tiny
    // But we'll show actual values. Use linear scale capped at 1.0
    const maxVal = 1.0;

    for (let i = 0; i < layers; i++) {
      const sigVal = Math.pow(sigmoidMax, i + 1);
      const tanVal = Math.pow(tanhTypical, i + 1);

      const cx = padLeft + barGroupW * i + barGroupW / 2;

      // Sigmoid bar (amber)
      const sigH = Math.max(1, (sigVal / maxVal) * chartH);
      const sigX = cx - barW - gap / 2;
      const sigY = padTop + chartH - sigH;
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(sigX, sigY, barW, sigH);

      // Tanh bar (blue)
      const tanH = Math.max(1, (tanVal / maxVal) * chartH);
      const tanX = cx + gap / 2;
      const tanY = padTop + chartH - tanH;
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(tanX, tanY, barW, tanH);

      // Value labels
      ctx.font = '9px "Iosevka Charon", monospace';
      ctx.textAlign = 'center';

      // Sigmoid value
      ctx.fillStyle = '#B45309';
      const sigLabel = sigVal < 0.001 ? sigVal.toExponential(0) : sigVal.toFixed(3);
      ctx.fillText(sigLabel, sigX + barW / 2, sigY - 4);

      // Tanh value
      ctx.fillStyle = '#1D4ED8';
      const tanLabel = tanVal < 0.001 ? tanVal.toExponential(0) : tanVal.toFixed(3);
      ctx.fillText(tanLabel, tanX + barW / 2, tanY - 4);

      // Layer label
      ctx.fillStyle = '#888';
      ctx.font = '11px "Iosevka Charon", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`L${i + 1}`, cx, padTop + chartH + 16);
    }

    // Y-axis ticks
    ctx.fillStyle = '#AAA';
    ctx.font = '10px "Iosevka Charon", monospace';
    ctx.textAlign = 'right';
    [0, 0.25, 0.5, 0.75, 1.0].forEach(v => {
      const y = padTop + chartH - (v / maxVal) * chartH;
      ctx.fillText(v.toFixed(2), padLeft - 6, y + 3);
      ctx.strokeStyle = '#ECECEC';
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();
    });

    // Legend
    const legendY = padTop + chartH + 30;
    ctx.font = '11px "Iosevka Charon", sans-serif';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(padLeft + chartW / 2 - 100, legendY - 8, 10, 10);
    ctx.fillStyle = '#888';
    ctx.fillText('Sigmoid (0.25ⁿ)', padLeft + chartW / 2 - 86, legendY);

    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(padLeft + chartW / 2 + 30, legendY - 8, 10, 10);
    ctx.fillStyle = '#888';
    ctx.fillText('Tanh (~0.65ⁿ)', padLeft + chartW / 2 + 44, legendY);

  }, [layers]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', maxWidth: '480px', height: '260px', display: 'block', margin: '0 auto' }}
      />
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginRight: '10px' }}>
          Layers: <span style={{ color: 'var(--accent)' }}>{layers}</span>
        </label>
        <input
          type="range"
          min={2}
          max={12}
          value={layers}
          onChange={(e) => setLayers(Number(e.target.value))}
          style={{ width: '160px', accentColor: 'var(--accent)', verticalAlign: 'middle' }}
        />
      </div>
      <div style={{ marginTop: '14px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <p style={{ marginBottom: '8px' }}>
          After <strong>{layers} layers</strong>, the sigmoid gradient is{' '}
          <strong style={{ color: '#B45309' }}>
            {Math.pow(0.25, layers).toExponential(1)}
          </strong>{' '}
          while the tanh gradient is{' '}
          <strong style={{ color: '#1D4ED8' }}>
            {Math.pow(0.65, layers).toExponential(1)}
          </strong>.
          Tanh decays roughly <strong>{Math.round(Math.pow(0.65, layers) / Math.pow(0.25, layers))}× slower</strong>, but
          both still vanish in deep networks.
        </p>
      </div>
    </div>
  );
}
