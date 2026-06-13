import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import ThreeCanvas from './ThreeCanvas';

/**
 * Reusable 3D scatter plot. Pass an array of labeled points with colors.
 *
 * @param {Array} points - Array of { label, position: [x,y,z], color }
 * @param {Array} [connections] - Array of [indexA, indexB] pairs to draw lines between
 * @param {number} [height=320] - Canvas height
 * @param {boolean} [autoRotate=true] - Slowly spin the scene
 * @param {string} [hint] - Bottom hint text
 */

function ScatterPoint({ label, position, color }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0] * 2) * 0.06;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {/* Glow */}
      <mesh>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      {/* HTML label - always renders reliably */}
      <Html position={[0, 0.4, 0]} center distanceFactor={6}>
        <div style={{
          color: '#fff',
          fontSize: '12px',
          fontWeight: 700,
          fontFamily: 'var(--font-main)',
          background: 'rgba(0,0,0,0.6)',
          padding: '2px 8px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

function ScatterScene({ points, connections, autoRotate }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <ScatterPoint key={i} label={p.label} position={p.position} color={p.color} />
      ))}
      {connections && connections.map(([a, b], i) => (
        <Line
          key={i}
          points={[points[a].position, points[b].position]}
          color={points[a].color}
          lineWidth={1}
          transparent
          opacity={0.25}
        />
      ))}
      <pointLight position={[-3, -3, 3]} intensity={0.5} color="#818cf8" />
    </group>
  );
}

export default function ScatterPlot3D({
  points = [],
  connections = [],
  height = 320,
  autoRotate = true,
  hint = 'Drag to rotate · Scroll to zoom',
}) {
  return (
    <ThreeCanvas height={height} cameraPosition={[0, 0, 6]} fov={45} hint={hint}>
      <ScatterScene points={points} connections={connections} autoRotate={autoRotate} />
    </ThreeCanvas>
  );
}
