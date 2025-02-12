import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function Model({ onBodyClick }) {
  const handleClick = (event) => {
    event.stopPropagation();
    if (onBodyClick) {
      onBodyClick(event.point);
    }
  };

  const material = React.useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    metalness: 0.2,
    roughness: 0.7,
    transparent: true,
    opacity: 0.95,
  }), []);

  return (
    <group onClick={handleClick} position={[0, -0.2, 0]} scale={0.8}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow material={material}>
        <sphereGeometry args={[0.12, 32, 32]} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 1.45, 0]} castShadow receiveShadow material={material}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 32]} />
      </mesh>
      
      {/* Torso */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow material={material}>
        <cylinderGeometry args={[0.2, 0.15, 0.5, 32]} />
      </mesh>
      
      {/* Left Arm */}
      <group position={[-0.3, 1.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <mesh castShadow receiveShadow material={material}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 32]} />
        </mesh>
      </group>
      
      {/* Right Arm */}
      <group position={[0.3, 1.3, 0]} rotation={[0, 0, Math.PI / 6]}>
        <mesh castShadow receiveShadow material={material}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 32]} />
        </mesh>
      </group>
      
      {/* Left Leg */}
      <group position={[-0.1, 0.7, 0]}>
        <mesh castShadow receiveShadow material={material}>
          <cylinderGeometry args={[0.07, 0.07, 0.5, 32]} />
        </mesh>
      </group>
      
      {/* Right Leg */}
      <group position={[0.1, 0.7, 0]}>
        <mesh castShadow receiveShadow material={material}>
          <cylinderGeometry args={[0.07, 0.07, 0.5, 32]} />
        </mesh>
      </group>
    </group>
  );
}

function Marker({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.015, 32, 32]} />
      <meshStandardMaterial
        color="red"
        emissive="#ff0000"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function Scene({ markers = [], onBodyClick }) {
  const { camera } = useThree();
  
  // Set initial camera position
  React.useEffect(() => {
    camera.position.set(0, 1.5, 2);
    camera.lookAt(0, 1, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />
      <hemisphereLight intensity={0.3} groundColor={new THREE.Color(0x080820)} />
      <color attach="background" args={['#f5f5f5']} />
      <Model onBodyClick={onBodyClick} />
      {markers.map((marker, index) => (
        <Marker key={index} position={marker.position} />
      ))}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1.2}
        maxDistance={4}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI * 3/4}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

const BodyModel3D = ({ markers = [], onMarkerPlaced }) => {
  console.log('BodyModel3D rendering with markers:', markers);
  const handleBodyClick = (point) => {
    if (onMarkerPlaced) {
      onMarkerPlaced(point);
    }
  };

  return (
    <Canvas
      style={{ height: '100%', width: '100%' }}
      camera={{ position: [0, 1.2, 1.8], fov: 40 }}
      shadows
      dpr={[1, 2]}
    >
      <Scene markers={markers} onBodyClick={handleBodyClick} />
    </Canvas>
  );
};

export default BodyModel3D;
