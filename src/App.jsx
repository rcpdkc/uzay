import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const R = 2.45;
const target = { lat: 39.0, lon: 35.0 };

const sources = [
  [40.7, -74.0], [34.0, -118.2], [19.4, -99.1], [-23.5, -46.6], [-34.6, -58.4],
  [51.5, -0.1], [48.9, 2.35], [52.5, 13.4], [52.37, 4.9], [41.9, 12.5],
  [40.4, -3.7], [59.3, 18.1], [55.7, 37.6], [30.0, 31.2], [-1.3, 36.8],
  [-26.2, 28.0], [24.45, 54.38], [28.61, 77.21], [13.75, 100.5], [1.35, 103.82],
  [22.3, 114.2], [35.68, 139.69], [37.56, 126.97], [-33.87, 151.2], [-37.8, 144.9],
  [-6.2, 106.8], [14.6, 121.0], [3.14, 101.69], [25.0, 121.5], [31.2, 121.5],
].map(([lat, lon], index) => ({ lat, lon, index }));

const minorNodes = [
  [43.7,-79.4],[45.5,-73.6],[25.8,-80.2],[32.8,-96.8],[47.6,-122.3],[37.8,-122.4],
  [-12.0,-77.0],[-33.45,-70.7],[-22.9,-43.2],[-34.9,-56.2],[53.3,-6.3],[50.1,8.7],
  [47.4,8.5],[45.5,9.2],[50.8,4.4],[48.2,16.4],[52.2,21.0],[50.4,30.5],[41.0,29.0],
  [32.1,34.8],[25.3,55.3],[24.7,46.7],[33.3,44.4],[35.7,51.4],[23.6,58.4],[15.5,32.6],
  [6.5,3.4],[5.6,-0.2],[-4.3,15.3],[-1.9,30.1],[9.0,38.7],[-33.9,18.4],
  [19.1,72.9],[12.97,77.6],[13.1,80.3],[17.4,78.5],[23.0,72.6],[22.6,88.4],[27.7,85.3],
  [23.8,90.4],[24.9,67.0],[31.5,74.3],[33.7,73.1],[4.2,73.5],[6.9,79.9],[16.8,96.2],
  [21.0,105.8],[10.8,106.6],[11.6,104.9],[17.97,102.6],[18.8,98.98],[22.0,96.1],
  [34.7,135.5],[35.2,136.9],[43.1,141.3],[33.6,130.4],[37.5,127.0],[35.2,129.1],
  [39.9,116.4],[22.5,113.9],[23.1,113.3],[30.6,104.1],[29.6,106.5],[34.3,108.9],
  [-6.9,107.6],[-7.3,112.7],[-8.65,115.2],[1.5,110.3],[5.4,100.3],[-27.5,153.0],
  [-31.95,115.86],[-36.85,174.76],[-41.3,174.8],[-17.7,178.1]
].map(([lat, lon]) => ({ lat, lon }));

function latLonToVec3(lat, lon, radius = R) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function DataFlow({ source, index }) {
  const start = useMemo(() => latLonToVec3(source.lat, source.lon, R + 0.025), [source]);
  const end = useMemo(() => latLonToVec3(target.lat, target.lon, R + 0.035), []);
  const curve = useMemo(() => {
    const distance = start.distanceTo(end);
    const lift = 0.5 + Math.min(distance * 0.22, 1.15);
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(R + lift);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end]);
  const points = useMemo(() => curve.getPoints(72), [curve]);
  const packetA = useRef();
  const packetB = useRef();

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const speed = 0.085 + (index % 5) * 0.008;
    const t1 = (elapsed * speed + index * 0.071) % 1;
    const t2 = (t1 + 0.46) % 1;
    if (packetA.current) packetA.current.position.copy(curve.getPoint(t1));
    if (packetB.current) packetB.current.position.copy(curve.getPoint(t2));
  });

  return (
    <group>
      <Line points={points} color="#23f1a4" lineWidth={0.62} transparent opacity={0.25} />
      <Line points={points} color="#8ffff0" lineWidth={0.22} transparent opacity={0.72} />
      <mesh ref={packetA}>
        <sphereGeometry args={[0.021, 10, 10]} />
        <meshBasicMaterial color="#d7fff3" toneMapped={false} />
      </mesh>
      <mesh ref={packetB}>
        <sphereGeometry args={[0.014, 8, 8]} />
        <meshBasicMaterial color="#38ffb0" toneMapped={false} />
      </mesh>
    </group>
  );
}

function PulsingNode({ lat, lon, major = false, index = 0 }) {
  const ref = useRef();
  const position = useMemo(() => latLonToVec3(lat, lon, R + 0.03), [lat, lon]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(clock.getElapsedTime() * 2.2 + index * 0.6) * 0.22;
    ref.current.scale.setScalar(pulse);
  });

  return (
    <group position={position} ref={ref}>
      <mesh>
        <sphereGeometry args={[major ? 0.036 : 0.018, 12, 12]} />
        <meshBasicMaterial color="#38ff97" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[major ? 0.075 : 0.04, 12, 12]} />
        <meshBasicMaterial color="#23e98d" transparent opacity={major ? 0.11 : 0.07} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Globe() {
  const group = useRef();
  const texture = useTexture('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
  const turkey = useMemo(() => latLonToVec3(target.lat, target.lon, R + 0.045), []);

  useFrame(() => {
    if (group.current) group.current.rotation.y += 0.00018;
  });

  return (
    <group ref={group} rotation={[0.08, -0.66, -0.02]}>
      <mesh>
        <sphereGeometry args={[R, 112, 112]} />
        <meshStandardMaterial map={texture} roughness={0.9} metalness={0.02} />
      </mesh>

      <mesh>
        <sphereGeometry args={[R + 0.018, 80, 80]} />
        <meshBasicMaterial color="#041729" transparent opacity={0.22} />
      </mesh>

      <mesh>
        <sphereGeometry args={[R + 0.11, 72, 72]} />
        <meshBasicMaterial color="#19a8ff" transparent opacity={0.035} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {minorNodes.map((node, i) => <PulsingNode key={`n-${i}`} {...node} index={i} />)}
      {sources.map((source, i) => <PulsingNode key={`s-${i}`} {...source} major index={i} />)}
      {sources.map((source, i) => <DataFlow key={`f-${i}`} source={source} index={i} />)}

      <group position={turkey}>
        <mesh>
          <sphereGeometry args={[0.06, 20, 20]} />
          <meshBasicMaterial color="#ff274d" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshBasicMaterial color="#ff244a" transparent opacity={0.10} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

function Scene() {
  return (
    <Canvas camera={{ position: [0, 0.05, 7.15], fov: 40 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
      <color attach="background" args={["#000105"]} />
      <fog attach="fog" args={["#000105", 10, 28]} />
      <ambientLight intensity={0.26} />
      <directionalLight position={[5, 2.5, 5]} intensity={2.5} />
      <pointLight position={[-5, -1, 4]} intensity={22} distance={10} color="#0a53ff" />
      <pointLight position={[4, 2, -4]} intensity={13} distance={9} color="#00d69a" />

      <Stars radius={110} depth={72} count={9800} factor={2.6} saturation={0.15} fade speed={0.08} />
      <Stars radius={52} depth={28} count={1800} factor={1.2} saturation={0} fade speed={0.03} />

      <Suspense fallback={null}>
        <Globe />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={4.5}
        maxDistance={10.5}
        autoRotate
        autoRotateSpeed={0.08}
        dampingFactor={0.035}
        enableDamping
      />
    </Canvas>
  );
}

export default function App() {
  return (
    <main className="space-shell">
      <div className="deep-space-glow deep-space-glow-a" />
      <div className="deep-space-glow deep-space-glow-b" />
      <div className="scene-layer"><Scene /></div>
      <div className="vignette" />
      <div className="grain" />
    </main>
  );
}
