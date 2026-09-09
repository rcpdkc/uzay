import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const R = 2.55;
const WORLD_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

const TURKEY = { name: 'TÜRKİYE', lat: 39.0, lon: 35.0, label: true, target: true };

const COUNTRIES = [
  { name: 'ABD', lat: 39.8, lon: -98.6, label: true, flow: true },
  { name: 'KANADA', lat: 57.0, lon: -106.0, label: true },
  { name: 'MEKSİKA', lat: 23.6, lon: -102.5 },
  { name: 'BREZİLYA', lat: -10.8, lon: -52.9, label: true, flow: true },
  { name: 'ARJANTİN', lat: -38.4, lon: -63.6 },
  { name: 'İNGİLTERE', lat: 54.2, lon: -2.5, label: true, flow: true },
  { name: 'FRANSA', lat: 46.4, lon: 2.2, label: true, flow: true },
  { name: 'ALMANYA', lat: 51.1, lon: 10.4, label: true, flow: true },
  { name: 'İSPANYA', lat: 40.3, lon: -3.7 },
  { name: 'İTALYA', lat: 42.8, lon: 12.5 },
  { name: 'HOLLANDA', lat: 52.2, lon: 5.3 },
  { name: 'İSVEÇ', lat: 62.0, lon: 15.0 },
  { name: 'NORVEÇ', lat: 61.5, lon: 9.0 },
  { name: 'POLONYA', lat: 52.1, lon: 19.4 },
  { name: 'RUSYA', lat: 61.5, lon: 90.0, label: true, flow: true },
  TURKEY,
  { name: 'MISIR', lat: 26.8, lon: 30.8, label: true, flow: true },
  { name: 'SUUDİ ARABİSTAN', lat: 23.9, lon: 45.1 },
  { name: 'BAE', lat: 24.3, lon: 54.3, label: true, flow: true },
  { name: 'GÜNEY AFRİKA', lat: -30.6, lon: 22.9, label: true, flow: true },
  { name: 'NİJERYA', lat: 9.1, lon: 8.7 },
  { name: 'KENYA', lat: 0.1, lon: 37.9 },
  { name: 'HİNDİSTAN', lat: 22.6, lon: 79.0, label: true, flow: true },
  { name: 'PAKİSTAN', lat: 30.4, lon: 69.4 },
  { name: 'ÇİN', lat: 35.9, lon: 104.2, label: true, flow: true },
  { name: 'JAPONYA', lat: 36.2, lon: 138.2, label: true, flow: true },
  { name: 'GÜNEY KORE', lat: 36.4, lon: 127.9, label: true },
  { name: 'TAYLAND', lat: 15.9, lon: 100.9 },
  { name: 'VİETNAM', lat: 16.2, lon: 107.8 },
  { name: 'SİNGAPUR', lat: 1.35, lon: 103.82, label: true, flow: true },
  { name: 'ENDONEZYA', lat: -2.5, lon: 118.0 },
  { name: 'FİLİPİNLER', lat: 12.8, lon: 121.8 },
  { name: 'AVUSTRALYA', lat: -25.3, lon: 133.8, label: true, flow: true },
  { name: 'YENİ ZELANDA', lat: -41.3, lon: 174.8 },
].map((country, index) => ({ ...country, index }));

const FLOW_COUNTRIES = COUNTRIES.filter((country) => country.flow && !country.target);

function latLonToVec3(lat, lon, radius = R) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function buildGraticule() {
  const lines = [];
  for (let lat = -60; lat <= 60; lat += 20) {
    const points = [];
    for (let lon = -180; lon <= 180; lon += 3) points.push(latLonToVec3(lat, lon, R + 0.006));
    lines.push(points);
  }
  for (let lon = -180; lon < 180; lon += 20) {
    const points = [];
    for (let lat = -85; lat <= 85; lat += 3) points.push(latLonToVec3(lat, lon, R + 0.006));
    lines.push(points);
  }
  return lines;
}

function CountryBorders() {
  const [rings, setRings] = useState([]);

  useEffect(() => {
    let active = true;
    fetch(WORLD_URL)
      .then((response) => response.json())
      .then((geojson) => {
        if (!active) return;
        const next = [];
        geojson.features.forEach((feature) => {
          const geometry = feature.geometry;
          if (!geometry) return;
          const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
          polygons.forEach((polygon) => {
            const outerRing = polygon?.[0];
            if (!outerRing || outerRing.length < 2) return;
            next.push(outerRing.map(([lon, lat]) => latLonToVec3(lat, lon, R + 0.018)));
          });
        });
        setRings(next);
      })
      .catch(() => setRings([]));
    return () => { active = false; };
  }, []);

  return (
    <group>
      {rings.map((points, index) => (
        <Line
          key={`border-${index}`}
          points={points}
          color="#59d8c4"
          lineWidth={0.42}
          transparent
          opacity={0.52}
          depthWrite={false}
        />
      ))}
    </group>
  );
}

function Graticule() {
  const lines = useMemo(buildGraticule, []);
  return (
    <group>
      {lines.map((points, index) => (
        <Line
          key={`grid-${index}`}
          points={points}
          color="#1b7181"
          lineWidth={0.28}
          transparent
          opacity={0.17}
          depthWrite={false}
        />
      ))}
    </group>
  );
}

function makeLabelTexture(text, target = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = target ? '700 42px Arial' : '600 34px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = target ? 22 : 14;
  ctx.shadowColor = target ? '#ff334f' : '#18f0a5';
  ctx.fillStyle = target ? '#ff7283' : '#c6fff0';
  ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

function CountryLabel({ country }) {
  const position = useMemo(
    () => latLonToVec3(country.lat, country.lon, R + (country.target ? 0.13 : 0.09)),
    [country.lat, country.lon, country.target],
  );
  const texture = useMemo(() => makeLabelTexture(country.name, country.target), [country.name, country.target]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite position={position} scale={country.target ? [0.88, 0.22, 1] : [0.66, 0.165, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        depthTest
        depthWrite={false}
        opacity={country.target ? 1 : 0.9}
        toneMapped={false}
      />
    </sprite>
  );
}

function CountryNode({ country }) {
  const ref = useRef();
  const position = useMemo(
    () => latLonToVec3(country.lat, country.lon, R + 0.038),
    [country.lat, country.lon],
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(clock.getElapsedTime() * 2.1 + country.index * 0.53) * 0.18;
    ref.current.scale.setScalar(pulse);
  });

  const target = country.target;
  return (
    <group position={position} ref={ref}>
      <mesh>
        <sphereGeometry args={[target ? 0.062 : 0.022, 14, 14]} />
        <meshBasicMaterial color={target ? '#ff2949' : '#31f5a2'} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[target ? 0.145 : 0.055, 14, 14]} />
        <meshBasicMaterial
          color={target ? '#ff2949' : '#28e99a'}
          transparent
          opacity={target ? 0.11 : 0.07}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function DataFlow({ country, index }) {
  const start = useMemo(() => latLonToVec3(country.lat, country.lon, R + 0.045), [country]);
  const end = useMemo(() => latLonToVec3(TURKEY.lat, TURKEY.lon, R + 0.055), []);
  const curve = useMemo(() => {
    const distance = start.distanceTo(end);
    const lift = 0.5 + Math.min(distance * 0.24, 1.25);
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(R + lift);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end]);
  const points = useMemo(() => curve.getPoints(92), [curve]);
  const packetA = useRef();
  const packetB = useRef();

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const speed = 0.07 + (index % 5) * 0.008;
    const t1 = (elapsed * speed + index * 0.071) % 1;
    const t2 = (t1 + 0.42) % 1;
    if (packetA.current) packetA.current.position.copy(curve.getPoint(t1));
    if (packetB.current) packetB.current.position.copy(curve.getPoint(t2));
  });

  return (
    <group>
      <Line points={points} color="#20d995" lineWidth={0.55} transparent opacity={0.24} depthWrite={false} />
      <Line points={points} color="#87ffe0" lineWidth={0.2} transparent opacity={0.68} depthWrite={false} />
      <mesh ref={packetA}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshBasicMaterial color="#e3fff7" toneMapped={false} />
      </mesh>
      <mesh ref={packetB}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color="#2effa7" toneMapped={false} />
      </mesh>
    </group>
  );
}

const ORION = {
  points: [[-1.0,1.15,0],[1.0,1.05,0],[-0.52,0.18,0],[0,0.1,0],[0.52,0.02,0],[-0.82,-1.05,0],[0.9,-1.15,0]],
  links: [[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]],
};
const BIG_DIPPER = {
  points: [[-1.3,.4,0],[-.55,.72,0],[.1,.35,0],[.05,-.38,0],[-.8,-.45,0],[-1.45,-.05,0],[.8,.58,0],[1.45,.72,0]],
  links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6],[6,7]],
};
const CASSIOPEIA = {
  points: [[-1.3,.35,0],[-.65,-.2,0],[0,.48,0],[.7,-.08,0],[1.35,.48,0]],
  links: [[0,1],[1,2],[2,3],[3,4]],
};

function Constellation({ data, position, scale = 1, rotation = [0, 0, 0] }) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {data.links.map(([a, b], index) => (
        <Line
          key={`const-line-${index}`}
          points={[data.points[a], data.points[b]]}
          color="#7bbcff"
          lineWidth={0.35}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      ))}
      {data.points.map((point, index) => (
        <group key={`const-star-${index}`} position={point}>
          <mesh>
            <sphereGeometry args={[index % 3 === 0 ? 0.045 : 0.027, 8, 8]} />
            <meshBasicMaterial color="#d9eeff" transparent opacity={0.86} toneMapped={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[index % 3 === 0 ? 0.12 : 0.075, 8, 8]} />
            <meshBasicMaterial color="#6caaff" transparent opacity={0.06} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function DeepSpace() {
  return (
    <group>
      <Stars radius={120} depth={86} count={10500} factor={2.5} saturation={0.12} fade speed={0.05} />
      <Stars radius={55} depth={34} count={2300} factor={1.15} saturation={0} fade speed={0.02} />
      <Constellation data={ORION} position={[-7.5, 2.6, -10]} scale={0.95} rotation={[0.1, 0.25, -0.2]} />
      <Constellation data={BIG_DIPPER} position={[7.2, 3.0, -11]} scale={1.05} rotation={[-0.1, -0.3, 0.18]} />
      <Constellation data={CASSIOPEIA} position={[6.2, -3.3, -9]} scale={0.85} rotation={[0.2, 0.15, -0.1]} />
    </group>
  );
}

function Globe() {
  const group = useRef();

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.035;
  });

  return (
    <group ref={group} rotation={[0.08, -0.58, -0.02]}>
      <mesh>
        <sphereGeometry args={[R, 96, 96]} />
        <meshStandardMaterial color="#06141c" roughness={0.78} metalness={0.28} />
      </mesh>

      <mesh>
        <sphereGeometry args={[R + 0.008, 72, 72]} />
        <meshBasicMaterial color="#071f28" transparent opacity={0.28} depthWrite={false} />
      </mesh>

      <Graticule />
      <CountryBorders />

      {COUNTRIES.map((country) => <CountryNode key={country.name} country={country} />)}
      {FLOW_COUNTRIES.map((country, index) => <DataFlow key={`flow-${country.name}`} country={country} index={index} />)}
      {COUNTRIES.filter((country) => country.label).map((country) => <CountryLabel key={`label-${country.name}`} country={country} />)}

      <mesh>
        <sphereGeometry args={[R + 0.12, 72, 72]} />
        <meshBasicMaterial
          color="#0b9bc1"
          transparent
          opacity={0.028}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 7.4], fov: 39 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["#000105"]} />
      <fog attach="fog" args={["#000105", 14, 40]} />

      <ambientLight intensity={0.42} />
      <directionalLight position={[5, 3, 6]} intensity={1.8} color="#bcecff" />
      <pointLight position={[-5, -1, 4]} intensity={18} distance={11} color="#0d5fff" />
      <pointLight position={[4, 2, -3]} intensity={12} distance={10} color="#00d69a" />

      <DeepSpace />
      <Globe />

      <OrbitControls
        enablePan={false}
        enableZoom
        enableRotate
        minDistance={4.7}
        maxDistance={11}
        rotateSpeed={0.48}
        zoomSpeed={0.55}
        dampingFactor={0.045}
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
