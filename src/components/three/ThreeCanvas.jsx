import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

/**
 * Reusable wrapper for Three.js scenes with consistent styling.
 * 
 * @param {React.ReactNode} children - Three.js scene content
 * @param {number} [height=300] - Canvas height in px
 * @param {string} [bg='#0a0a0a'] - Background color
 * @param {Array} [cameraPosition=[0, 0, 6]] - Camera start position
 * @param {number} [fov=45] - Camera field of view
 * @param {boolean} [orbit=true] - Enable orbit controls
 * @param {boolean} [zoom=true] - Enable scroll zoom
 * @param {string} [hint] - Help text shown at bottom
 * @param {object} [style] - Additional container styles
 */
export default function ThreeCanvas({
  children,
  height = 300,
  bg = '#0a0a0a',
  cameraPosition = [0, 0, 6],
  fov = 45,
  orbit = true,
  zoom = true,
  hint,
  style,
}) {
  return (
    <div style={{
      width: '100%',
      height: `${height}px`,
      borderRadius: '8px',
      overflow: 'hidden',
      background: bg,
      border: '1px solid var(--border)',
      position: 'relative',
      ...style,
    }}>
      <Canvas
        camera={{ position: cameraPosition, fov }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={[bg]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.0} />
        <directionalLight position={[-3, -3, 2]} intensity={0.3} />
        {children}
        {orbit && (
          <OrbitControls
            enablePan={false}
            enableZoom={zoom}
            minDistance={2}
            maxDistance={12}
          />
        )}
      </Canvas>
      {hint && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '11px',
          color: '#555',
          fontWeight: 600,
          pointerEvents: 'none',
        }}>
          {hint}
        </div>
      )}
    </div>
  );
}
