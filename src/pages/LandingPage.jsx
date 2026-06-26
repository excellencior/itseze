import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ARCHITECTURES, CONCEPTS } from '../navigation';

/**
 * LandingPage — Interactive, minimal, animated home page.
 * 
 * Features:
 * - Animated typing hero tagline
 * - Floating topic cards that the user can browse
 * - Subtle particle canvas background
 * - Stats ribbon
 * - Full theme awareness
 */

/* ── Collect all ready pages for the card grid ── */
function getReadyPages() {
  const pages = [];

  ARCHITECTURES.forEach(item => {
    if (item.ready) {
      pages.push({ ...item, category: 'Architecture', icon: '🏗' });
    }
  });

  CONCEPTS.forEach(item => {
    if (item.children) {
      item.children.forEach(child => {
        if (child.ready) {
          pages.push({ ...child, category: item.name, icon: getCategoryIcon(item.name) });
        }
      });
    } else if (item.ready) {
      pages.push({ ...item, category: 'Concept', icon: getConceptIcon(item.name) });
    }
  });

  return pages;
}

function getCategoryIcon(name) {
  const map = {
    'Reasoning': '🧠',
    'Prompting': '💬',
  };
  return map[name] || '📐';
}

function getConceptIcon(name) {
  const map = {
    'Activation Functions': '⚡',
    'Attention (Self / Cross)': '👁',
    'Encoder (Transformer)': '🔄',
    'Speculative Decoding': '🚀',
    'State Space Models (SSMs)': '📊',
  };
  return map[name] || '📐';
}

/* ── Particle Canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0891B2';

    // Initialize particles
    const count = 40;
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.3 + 0.05,
        });
      }
    }

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = accent.startsWith('#')
          ? `${accent}${Math.round(p.alpha * 255).toString(16).padStart(2, '0')}`
          : `rgba(8, 145, 178, ${p.alpha})`;
        ctx.fill();
      });

      // Draw connections between nearby particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.08;
            ctx.strokeStyle = accent.startsWith('#')
              ? `${accent}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
              : `rgba(8, 145, 178, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    const resizeObs = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    resizeObs.observe(canvas);

    return () => {
      cancelAnimationFrame(animRef.current);
      resizeObs.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

/* ── Typing animation hook ── */
function useTyping(text, speed = 50, delay = 400) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayed, done };
}

/* ── Topic Card ── */
function TopicCard({ page, onNavigate, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onNavigate(page.route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--node-bg)',
        border: `1px solid ${hovered ? 'var(--accent-50)' : 'var(--border)'}`,
        borderRadius: '10px',
        padding: '16px 18px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-hover)' : 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        opacity: 0,
        animation: `fadeInUp 0.5s ease ${index * 40 + 300}ms forwards`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '20px' }}>{page.icon}</span>
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--accent)',
          background: 'var(--accent-08)',
          padding: '2px 8px',
          borderRadius: '4px',
        }}>
          {page.category}
        </span>
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: 700,
        color: 'var(--text-main)',
        letterSpacing: '-0.3px',
        lineHeight: 1.3,
      }}>
        {page.name}
      </div>
      <div style={{
        fontSize: '11px',
        color: hovered ? 'var(--accent)' : 'var(--text-light)',
        fontWeight: 500,
        transition: 'color 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        Explore
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.2s',
          transform: hovered ? 'translateX(3px)' : 'translateX(0)',
        }}>→</span>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════
 *  LandingPage
 * ═══════════════════════════════════════════ */
export default function LandingPage({ onNavigate }) {
  const pages = getReadyPages();
  const { displayed, done } = useTyping('Complex ideas, made visual.', 45, 500);

  // Count stats
  const totalReady = pages.length;
  const categories = new Set(pages.map(p => p.category)).size;

  return (
    <div style={{
      width: '80%',
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
      minHeight: '70vh',
    }}>
      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>

      {/* ── Hero Section ── */}
      <div style={{
        position: 'relative',
        padding: '60px 0 40px',
        overflow: 'hidden',
      }}>
        <ParticleCanvas />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Tagline */}
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: 'var(--text-main)',
            lineHeight: 1.15,
            marginBottom: '16px',
          }}>
            {displayed}
            {!done && (
              <span style={{
                display: 'inline-block',
                width: '3px',
                height: '0.9em',
                background: 'var(--accent)',
                marginLeft: '2px',
                verticalAlign: 'text-bottom',
                animation: 'blink 0.8s step-end infinite',
              }} />
            )}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(14px, 1.8vw, 17px)',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            maxWidth: '560px',
            marginBottom: '0',
            opacity: 0,
            animation: 'fadeInUp 0.6s ease 1.8s forwards',
          }}>
            Interactive, in-depth explorations of machine learning architectures,
            reasoning systems, and prompting techniques — built for visual learners.
          </p>

          {/* Stats ribbon */}
          <div style={{
            display: 'flex',
            gap: '32px',
            marginTop: '28px',
            opacity: 0,
            animation: 'fadeInUp 0.6s ease 2.1s forwards',
          }}>
            <Stat value={totalReady} label="Topics" />
            <Stat value={categories} label="Categories" />
            <Stat value="∞" label="Curiosity" />
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{
        height: '1px',
        background: 'var(--border)',
        margin: '8px 0 32px',
        opacity: 0,
        animation: 'fadeIn 0.5s ease 2.4s forwards',
      }} />

      {/* ── Section header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        opacity: 0,
        animation: 'fadeInUp 0.5s ease 2.5s forwards',
      }}>
        <div>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.3px',
            marginBottom: '4px',
          }}>
            Explore topics
          </h2>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-light)',
            margin: 0,
          }}>
            Each page is a self-contained, interactive deep dive.
          </p>
        </div>

        {/* Live dot */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-light)',
        }}>
          <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
            <span style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10B981',
            }} />
          </span>
          {totalReady} live
        </div>
      </div>

      {/* ── Card Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '14px',
        paddingBottom: '60px',
      }}>
        {pages.map((page, i) => (
          <TopicCard
            key={page.route}
            page={page}
            onNavigate={onNavigate}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Stat chip ── */
function Stat({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{
        fontSize: '22px',
        fontWeight: 900,
        color: 'var(--accent)',
        letterSpacing: '-0.03em',
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-light)',
        marginTop: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {label}
      </span>
    </div>
  );
}
