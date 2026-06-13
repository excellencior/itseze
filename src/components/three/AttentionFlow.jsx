import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import ThreeCanvas from './ThreeCanvas';

/**
 * Reusable 3D attention flow visualization.
 * Shows tokens as cards with bezier arcs representing attention weights.
 *
 * @param {Array} tokens - Array of token strings
 * @param {Function} [weightFn] - (row, col) => weight
 * @param {number} [height=280] - Canvas height
 * @param {number} [maxTokens=6] - Max tokens to display
 * @param {string} [hint] - Bottom hint text
 */

function TokenCard({ text, position, index }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + index * 0.5) * 0.03;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Card body */}
      <mesh>
        <boxGeometry args={[0.85, 0.42, 0.06]} />
        <meshStandardMaterial
          color="#1e1e3a"
          emissive="#2a2a5a"
          emissiveIntensity={0.3}
          roughness={0.3}
        />
      </mesh>
      {/* Border highlight */}
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[0.88, 0.45, 0.005]} />
        <meshBasicMaterial color="#4444aa" transparent opacity={0.3} />
      </mesh>
      {/* HTML label */}
      <Html position={[0, 0, 0.1]} center>
        <div style={{
          color: '#fff',
          fontSize: '13px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>
          {text}
        </div>
      </Html>
    </group>
  );
}

function AttentionArc({ from, to, weight, maxWeight }) {
  const n = weight / maxWeight;

  const points = useMemo(() => {
    const s = new THREE.Vector3(...from);
    const e = new THREE.Vector3(...to);
    const mid = new THREE.Vector3(
      (s.x + e.x) / 2,
      Math.max(s.y, e.y) + 0.3 + n * 0.9,
      (s.z + e.z) / 2 + 0.2
    );
    const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
    return curve.getPoints(24).map(p => [p.x, p.y, p.z]);
  }, [from, to, n]);

  const hue = 230 + n * 30;
  const color = `hsl(${hue}, 80%, ${50 + n * 20}%)`;

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1 + n * 2}
      transparent
      opacity={0.3 + n * 0.5}
    />
  );
}

function FlowScene({ tokens, weightFn }) {
  const spacing = 1.2;
  const totalWidth = (tokens.length - 1) * spacing;
  const startX = -totalWidth / 2;

  const defaultWeightFn = (row, col) => {
    if (col === row) return 0.6;
    return ((row * 0.1 + col * 0.05) % 0.3 + 0.05);
  };

  const wFn = weightFn || defaultWeightFn;

  const arcs = useMemo(() => {
    const result = [];
    for (let r = 0; r < tokens.length; r++) {
      for (let c = 0; c <= r; c++) {
        result.push({
          from: [startX + c * spacing, -0.35, 0],
          to: [startX + r * spacing, -0.35, 0],
          weight: wFn(r, c),
        });
      }
    }
    return result;
  }, [tokens, startX, spacing, wFn]);

  return (
    <group>
      {tokens.map((tok, i) => (
        <TokenCard key={i} text={tok} position={[startX + i * spacing, 0, 0]} index={i} />
      ))}
      {arcs.map((arc, i) => (
        <AttentionArc key={i} from={arc.from} to={arc.to} weight={arc.weight} maxWeight={0.6} />
      ))}
      <pointLight position={[0, 3, 2]} intensity={0.4} color="#6366f1" />
    </group>
  );
}

export default function AttentionFlow({
  tokens = [],
  weightFn,
  height = 280,
  maxTokens = 6,
  hint = 'Brighter arcs = stronger attention · Causal mask: no future connections',
}) {
  const displayTokens = tokens.length > 0 ? tokens.slice(0, maxTokens) : ['Data', 'viz', 'empowers', 'users'];

  return (
    <ThreeCanvas height={height} cameraPosition={[0, 1.5, 5]} fov={40} hint={hint}>
      <FlowScene tokens={displayTokens} weightFn={weightFn} />
    </ThreeCanvas>
  );
}
