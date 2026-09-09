import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Line, OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const R = 2.2;
const target = { name: 'TÜRKİYE', lat: 39.0, lon: 35.0 };
const sources = [
  ['ABD', 38.9, -77], ['BREZİLYA', -15.8, -47.9], ['İNGİLTERE', 51.5, -0.1],
  ['ALMANYA', 52.5, 13.4], ['FRANSA', 48.9, 2.35], ['HOLLANDA', 52.37, 4.9],
  ['BAE', 24.45, 54.38], ['HİNDİSTAN', 28.61, 77.21], ['SİNGAPUR', 1.35, 103.82],
  ['JAPONYA', 35.68, 139.69], ['AVUSTRALYA', -35.28, 149.13], ['GÜNEY AFRİKA', -25.75, 28.19],
].map(([name, lat, lon]) => ({ name, lat, lon }));

function latLonToVec3(lat, lon, radius = R) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function Flow({ source, index }) {
  const start = useMemo(() => latLonToVec3(source.lat, source.lon, R + 0.04), [source]);
  const end = useMemo(() => latLonToVec3(target.lat, target.lon, R + 0.04), []);
  const curve = useMemo(() => {
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(R + 1.2 + (index % 3) * 0.18);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end, index]);
  const points = useMemo(() => curve.getPoints(80), [curve]);
  const packet = useRef();

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * (0.13 + (index % 4) * 0.02) + index * 0.09) % 1;
    if (packet.current) packet.current.position.copy(curve.getPoint(t));
  });

  return (
    <group>
      <Line points={points} color="#1a7cff" lineWidth={1.2} transparent opacity={0.45} />
      <Line points={points} color="#76d7ff" lineWidth={0.45} transparent opacity={0.9} />
      <mesh ref={packet}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshBasicMaterial color="#b9f3ff" />
      </mesh>
      <mesh position={start}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color="#2ba6ff" />
      </mesh>
    </group>
  );
}

function Globe() {
  const group = useRef();
  const texture = useTexture('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
  const turkey = useMemo(() => latLonToVec3(target.lat, target.lon, R + 0.06), []);

  useFrame(() => {
    if (group.current) group.current.rotation.y += 0.00045;
  });

  return (
    <group ref={group} rotation={[0.02, -0.6, 0]}>
      <mesh>
        <sphereGeometry args={[R, 96, 96]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh>
        <sphereGeometry args={[R + 0.045, 64, 64]} />
        <meshBasicMaterial color="#0b61ff" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[R + 0.12, 64, 64]} />
        <meshBasicMaterial color="#3ac8ff" transparent opacity={0.035} side={THREE.BackSide} />
      </mesh>

      {sources.map((source, i) => <Flow key={source.name} source={source} index={i} />)}

      <mesh position={turkey}>
        <sphereGeometry args={[0.105, 20, 20]} />
        <meshBasicMaterial color="#ff334d" />
      </mesh>
      <Html position={turkey.clone().multiplyScalar(1.12)} center distanceFactor={7}>
        <div className="turkey-label">
          <strong>★ TÜRKİYE</strong>
          <span>GLOBAL DATA HUB</span>
        </div>
      </Html>
    </group>
  );
}

function Scene() {
  return (
    <Canvas camera={{ position: [0, 0.15, 6.6], fov: 42 }} dpr={[1, 1.8]}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 3, 5]} intensity={2.2} />
      <pointLight position={[-4, -2, 3]} intensity={35} distance={8} color="#124dff" />
      <Stars radius={90} depth={45} count={3500} factor={3} saturation={0} fade speed={0.35} />
      <Suspense fallback={null}><Globe /></Suspense>
      <OrbitControls enablePan={false} minDistance={4.8} maxDistance={9} autoRotate autoRotateSpeed={0.22} />
    </Canvas>
  );
}

export default function App() {
  return (
    <main className="app-shell">
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <header className="topbar">
        <div>
          <div className="brand">SGDB</div>
          <div className="department">CYBER SECURITY DEPARTMENT</div>
        </div>
        <div className="live"><span /> LIVE GLOBAL TRAFFIC</div>
      </header>

      <section className="hero-copy">
        <div className="eyebrow">GLOBAL CYBER NETWORK</div>
        <h1>DATA HAS<br /><em>NO BORDERS.</em></h1>
        <p>Dünyanın farklı noktalarından gelen veri akışı Türkiye'deki güvenli merkezde birleşiyor.</p>
        <div className="stats">
          <div><b>{sources.length}</b><span>AKTİF KAYNAK</span></div>
          <div><b>TR</b><span>GÜVENLİ MERKEZ</span></div>
          <div><b>24/7</b><span>VERİ AKIŞI</span></div>
        </div>
      </section>

      <section className="globe-stage"><Scene /></section>

      <aside className="nodes-panel">
        <div className="panel-title">INBOUND NODES</div>
        {sources.slice(0, 7).map((source, i) => (
          <div className="node-row" key={source.name}>
            <span className="node-dot" />
            <span>{source.name}</span>
            <b>{93 - i * 3}%</b>
          </div>
        ))}
      </aside>

      <footer>SECURE CONNECTION&nbsp;&nbsp;•&nbsp;&nbsp;CONTINUOUS FLOW&nbsp;&nbsp;•&nbsp;&nbsp;TÜRKİYE</footer>
      <div className="scanlines" />
    </main>
  );
}
