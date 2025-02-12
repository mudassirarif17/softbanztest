import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function Model({ onBodyPartClick }) {
  // Using a basic cylinder and sphere for the body model
  // In a production environment, you would use a proper human model
  const bodyRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [markers, setMarkers] = useState([]);

  const addMarker = (point) => {
    const worldPoint = point.clone();
    setMarkers([...markers, worldPoint]);
    if (onBodyPartClick) {
      onBodyPartClick(worldPoint);
    }
  };

  return (
    <group ref={bodyRef}>
      {/* Body */}
      <mesh
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          addMarker(e.point);
        }}
      >
        <cylinderGeometry args={[1, 1, 4, 32]} />
        <meshStandardMaterial
          color={hovered ? '#f0f0f0' : '#e0e0e0'}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Markers */}
      {markers.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="red" />
        </mesh>
      ))}
    </group>
  );
}

const BodyModel = ({ onMarkerPlaced }) => {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ background: '#f5f5f5' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Model onBodyPartClick={onMarkerPlaced} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  );
};

export default BodyModel;
