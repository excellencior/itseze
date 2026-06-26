import React, { useRef, useEffect, useState } from 'react';
import Latex from '../Latex';
import { useSettings } from '../../SettingsContext';

/**
 * Visualizes how stacked linear layers collapse into one.
 * Shows a multi-layer network, then animates it collapsing into a single layer.
 * Theme-aware canvas rendering — uses the user's accent color.
 */

const CANVAS_PALETTES = {
  light: {
    bg: '#F5F3EE',
    nodeFill: '#FFFFFF',
    nodeStroke: '#5C5C5C',
    nodeStrokeFaded: (opacity) => `rgba(150, 150, 150, ${opacity})`,
    nodeFillFaded: (opacity) => `rgba(255, 255, 255, ${opacity})`,
    connectionDefault: (opacity) => `rgba(180, 180, 180, ${0.3 * opacity})`,
    labelColor: '#5C5C5C',
    labelFaded: (opacity) => `rgba(100, 100, 100, ${opacity})`,
  },
  dark: {
    bg: '#1A1A1A',
    nodeFill: '#2A2A2A',
    nodeStroke: '#A0A0A0',
    nodeStrokeFaded: (opacity) => `rgba(150, 150, 150, ${opacity})`,
    nodeFillFaded: (opacity) => `rgba(42, 42, 42, ${opacity})`,
    connectionDefault: (opacity) => `rgba(100, 100, 100, ${0.3 * opacity})`,
    labelColor: '#A0A0A0',
    labelFaded: (opacity) => `rgba(140, 140, 140, ${opacity})`,
  },
};

export default function LinearCollapseViz() {
  const canvasRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [progress, setProgress] = useState(0);
  const animRef = useRef(null);
  const { settings, resolvedTheme } = useSettings();

  const palette = CANVAS_PALETTES[resolvedTheme] || CANVAS_PALETTES.light;
  const accent = settings.accent || '#0891B2';

  // Parse accent to rgba helper
  const accentR = parseInt(accent.slice(1, 3), 16);
  const accentG = parseInt(accent.slice(3, 5), 16);
  const accentB = parseInt(accent.slice(5, 7), 16);
  const accentRgba = (alpha) => `rgba(${accentR}, ${accentG}, ${accentB}, ${alpha})`;

  useEffect(() => {
    let start = null;
    const duration = 600;

    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress(collapsed ? eased : 1 - eased);
      if (t < 1) animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [collapsed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 340;
    const h = 280;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const nodeR = 12;

    const layers = [
      { x: 60,  nodes: 3, label: 'Input' },
      { x: 130, nodes: 4, label: 'W₁' },
      { x: 200, nodes: 4, label: 'W₂' },
      { x: 270, nodes: 2, label: 'Output' },
    ];

    const getLayerX = (i) => {
      if (i === 0) return layers[0].x;
      if (i === 3) return layers[3].x;
      const center = (layers[1].x + layers[2].x) / 2;
      const original = layers[i].x;
      return original + (center - original) * progress;
    };

    const getLayerOpacity = (i) => {
      if (i === 0 || i === 3) return 1;
      return 1 - progress * 0.7;
    };

    const getNodeY = (layerIdx, nodeIdx, totalNodes) => {
      const spacing = 45;
      const startY = (h / 2) - ((totalNodes - 1) * spacing) / 2;
      return startY + nodeIdx * spacing;
    };

    // Draw connections
    for (let l = 0; l < layers.length - 1; l++) {
      const fromLayer = layers[l];
      const toLayer = layers[l + 1];
      const fromX = getLayerX(l);
      const toX = getLayerX(l + 1);
      const opacity = Math.min(getLayerOpacity(l), getLayerOpacity(l + 1));

      for (let i = 0; i < fromLayer.nodes; i++) {
        for (let j = 0; j < toLayer.nodes; j++) {
          const y1 = getNodeY(l, i, fromLayer.nodes);
          const y2 = getNodeY(l + 1, j, toLayer.nodes);

          ctx.strokeStyle = progress > 0.5 && (l === 0 || l === 2)
            ? accentRgba(0.25 * opacity)
            : palette.connectionDefault(opacity);
          ctx.lineWidth = progress > 0.5 && (l === 0 || l === 2) ? 1.5 : 1;
          ctx.beginPath();
          ctx.moveTo(fromX, y1);
          ctx.lineTo(toX, y2);
          ctx.stroke();
        }
      }
    }

    // Draw direct connections when collapsed
    if (progress > 0.3) {
      const fromLayer = layers[0];
      const toLayer = layers[3];
      ctx.strokeStyle = accentRgba(progress * 0.6);
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i < fromLayer.nodes; i++) {
        for (let j = 0; j < toLayer.nodes; j++) {
          const y1 = getNodeY(0, i, fromLayer.nodes);
          const y2 = getNodeY(3, j, toLayer.nodes);
          ctx.beginPath();
          ctx.moveTo(getLayerX(0), y1);
          ctx.lineTo(getLayerX(3), y2);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }

    // Draw nodes
    layers.forEach((layer, l) => {
      const lx = getLayerX(l);
      const opacity = getLayerOpacity(l);

      for (let i = 0; i < layer.nodes; i++) {
        const ny = getNodeY(l, i, layer.nodes);

        ctx.beginPath();
        ctx.arc(lx, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = (l === 0 || l === 3)
          ? palette.nodeFill
          : palette.nodeFillFaded(opacity);
        ctx.fill();
        ctx.strokeStyle = (l === 0 || l === 3)
          ? palette.nodeStroke
          : palette.nodeStrokeFaded(opacity);
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Layer label
      ctx.fillStyle = (l === 0 || l === 3)
        ? palette.labelColor
        : palette.labelFaded(opacity);
      ctx.font = '11px "Iosevka Charon", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(layer.label, lx, h - 10);
    });

    // Collapsed label
    if (progress > 0.5) {
      const cx = (getLayerX(1) + getLayerX(2)) / 2;
      ctx.fillStyle = accentRgba((progress - 0.5) * 2);
      ctx.font = 'bold 13px "Iosevka Charon", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("W' = W₂·W₁", cx, h - 10);
    }

  }, [progress, palette, accent, accentR, accentG, accentB]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Sequence Indicator */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '24px',
        height: '24px',
        borderRadius: '12px',
        background: 'var(--accent)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        fontFamily: 'var(--font-main)',
        boxShadow: `0 2px 4px ${accentRgba(0.2)}`,
        zIndex: 10,
        transition: 'all 0.3s ease',
      }}>
        {collapsed ? '2' : '1'}
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', maxWidth: '340px', height: '280px', display: 'block', margin: '0 auto' }}
      />
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            padding: '3px 14px',
            fontSize: '12px',
            fontWeight: 600,
            border: '1px solid var(--accent)',
            background: collapsed ? 'var(--accent-20)' : 'transparent',
            color: 'var(--accent)',
            cursor: 'pointer',
            borderRadius: '3px',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          {collapsed ? 'Show Layers' : 'Collapse Layers'}
        </button>
      </div>

      {/* Equation */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'var(--bg-subtle)',
        borderRadius: '4px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
          {collapsed ? 'Collapses to:' : 'Two linear layers:'}
        </div>
        {collapsed ? (
          <Latex math={"y = W'x + b' \\quad \\text{where } W' = W_2 W_1"} block />
        ) : (
          <Latex math={"y = W_2(W_1 x + b_1) + b_2"} block />
        )}
      </div>

      {/* Explanation */}
      <div style={{ marginTop: '14px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        {collapsed ? (
          <>
            <p style={{ marginBottom: '8px' }}>
              By the associative property of matrix multiplication, <Latex math={"W_2(W_1x) = (W_2W_1)x"} />. 
              Letting <Latex math={"W' = W_2W_1"} /> and <Latex math={"b' = W_2b_1 + b_2"} />, the entire depth of the network simplifies to <Latex math={"y = W'x + b'"} />.
            </p>
            <p style={{ marginBottom: '0' }}>
              Mathematically, the composition of multiple affine transformations is exactly equivalent to a single affine transformation. Without a nonlinear activation function <Latex math={"\\sigma(x)"} /> separating the layers, the extra weights provide absolutely no additional representational capacity.
            </p>
          </>
        ) : (
          <>
            <p style={{ marginBottom: '8px' }}>
              Consider a simple feed-forward network with two linear layers. The first layer applies <Latex math={"W_1x + b_1"} />, and the second layer applies <Latex math={"W_2"} /> and <Latex math={"b_2"} /> to that result.
            </p>
            <p style={{ marginBottom: '0' }}>
              Because there is no activation function <Latex math={"\\sigma"} /> inserted between <Latex math={"W_1"} /> and <Latex math={"W_2"} />, these operations are strictly algebraic. Click <em>Collapse Layers</em> to see the mathematical consequence of this design.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
