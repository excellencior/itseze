import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import ThreeCanvas from './ThreeCanvas';

/**
 * Reusable animated 3D bar chart.
 *
 * @param {Array} data - Array of { label, value (0-1), color }
 * @param {number} [height=280] - Canvas height
 * @param {number} [barWidth=0.5] - Width of each bar
 * @param {number} [maxBarHeight=3] - Max bar height in 3D units
 * @param {string} [hint] - Bottom hint text
 * @param {boolean} [showValues=true] - Show value labels on bars
 * @param {string} [valueFormat='percent'] - 'percent' or 'raw'
 */

function Bar({ label, value, color, position, barWidth, maxBarHeight, showValue, valueFormat }) {
  const meshRef = useRef();
  const targetHeight = Math.max(0.05, value * maxBarHeight);

  useFrame(() => {
    if (meshRef.current) {
      const current = meshRef.current.scale.y;
      const next = current + (targetHeight - current) * 0.08;
      meshRef.current.scale.y = Math.max(0.01, next);
      meshRef.current.position.y = next * 0.5;
    }
  });

  const displayValue = valueFormat === 'percent'
    ? `${Math.round(value * 100)}%`
    : value.toFixed(2);

  return (
    <group position={position}>
      {/* Bar mesh */}
      <mesh ref={meshRef} position={[0, targetHeight * 0.5, 0]}>
        <boxGeometry args={[barWidth, 1, barWidth * 0.6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Value label on top */}
      {showValue && (
        <Html position={[0, targetHeight + 0.3, 0]} center distanceFactor={5}>
          <div style={{
            color: '#fff',
            fontSize: '13px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}>
            {displayValue}
          </div>
        </Html>
      )}
      {/* Label below */}
      <Html position={[0, -0.25, 0]} center distanceFactor={5}>
        <div style={{
          color: '#888',
          fontSize: '11px',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

function BarScene({ data, barWidth, maxBarHeight, showValues, valueFormat }) {
  const spacing = barWidth + 0.5;
  const totalWidth = (data.length - 1) * spacing;
  const startX = -totalWidth / 2;

  return (
    <group position={[0, -0.8, 0]}>
      {data.map((d, i) => (
        <Bar
          key={d.label + i}
          label={d.label}
          value={d.value}
          color={d.color}
          position={[startX + i * spacing, 0, 0]}
          barWidth={barWidth}
          maxBarHeight={maxBarHeight}
          showValue={showValues}
          valueFormat={valueFormat}
        />
      ))}
      {/* Ground plane */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[totalWidth + 3, 2.5]} />
        <meshBasicMaterial color="#151515" transparent opacity={0.5} />
      </mesh>
      <pointLight position={[-2, 4, 3]} intensity={0.4} color="#6366f1" />
      <pointLight position={[2, 4, -3]} intensity={0.3} color="#f59e0b" />
    </group>
  );
}

export default function BarChart3D({
  data = [],
  height = 280,
  barWidth = 0.5,
  maxBarHeight = 3,
  showValues = true,
  valueFormat = 'percent',
  hint = 'Values animate in real-time',
}) {
  return (
    <ThreeCanvas height={height} cameraPosition={[0, 2, 5.5]} fov={40} hint={hint}>
      <BarScene
        data={data}
        barWidth={barWidth}
        maxBarHeight={maxBarHeight}
        showValues={showValues}
        valueFormat={valueFormat}
      />
    </ThreeCanvas>
  );
}
