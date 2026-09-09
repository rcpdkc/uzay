import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const R = 2.58;
const WORLD_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
const TURKEY = { name: 'TÜRKİYE', lat: 39.0, lon: 35.0, target: true, label: true };

const COUNTRIES = [
  { name: 'ABD', lat: 39.2, lon: -98.5, label: true, flow: true },
  { name: 'KANADA', lat: 57.0, lon: -106.0, label: true, flow: true },
  { name: 'BREZİLYA', lat: -10.8, lon: -52.9, label: true, flow: true },
  { name: 'ARJANTİN', lat: -38.4, lon: -63.6, flow: true },
  { name: 'İNGİLTERE', lat: 54.2, lon: -2.5, label: true, flow: true },
  { name: 'FRANSA', lat: 46.4, lon: 2.2, label: true, flow: true },
  { name: 'ALMANYA', lat: 51.1, lon: 10.4, label: true, flow: true },
  { name: 'İSPANYA', lat: 40.3, lon: -3.7, flow: true },
  { name: 'İTALYA', lat: 42.8, lon: 12.5, flow: true },
  { name: 'RUSYA', lat: 61.5, lon: 90.0, label: true, flow: true },
  TURKEY,
  { name: 'MISIR', lat: 26.8, lon: 30.8, label: true, flow: true },
  { name: 'BAE', lat: 24.3, lon: 54.3, label: true, flow: true },
  { name: 'GÜNEY AFRİKA', lat: -30.6, lon: 22.9, label: true, flow: true },
  { name: 'HİNDİSTAN', lat: 22.6, lon: 79.0, label: true, flow: true },
  { name: 'ÇİN', lat: 35.9, lon: 104.2, label: true, flow: true },
  { name: 'JAPONYA', lat: 36.2, lon: 138.2, label: true, flow: true },
  { name: 'GÜNEY KORE', lat: 36.4, lon: 127.9, flow: true },
  { name: 'SİNGAPUR', lat: 1.35, lon: 103.82, label: true, flow: true },
  { name: 'ENDONEZYA', lat: -2.5, lon: 118.0, flow: true },
  { name: 'AVUSTRALYA', lat: -25.3, lon: 133.8, label: true, flow: true },
].map((country, index) => ({ ...country, index }));

const FLOWS = COUNTRIES.filter((c) => c.flow && !c.target);

function latLonToVec3(lat, lon, radius = R) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function surfaceQuaternion(position) {
  return new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    position.clone().normalize(),
  );
}

function drawRingPath(ctx, ring, width, height) {
  if (!ring || ring.length < 2) return;
  let started = false;
  let prevLon = null;
  for (const [lon, lat] of ring) {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    if (!started || (prevLon !== null && Math.abs(lon - prevLon) > 180)) {
      ctx.moveTo(x, y);
      started = true;
    } else {
      ctx.lineTo(x, y);
    }
    prevLon = lon;
  }
  ctx.closePath();
}

function makeWorldTexture(geojson) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;

  const ocean = ctx.createLinearGradient(0, 0, width, height);
  ocean.addColorStop(0, '#031016');
  ocean.addColorStop(0.5, '#051b22');
  ocean.addColorStop(1, '#020c12');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, width, height);

  for (const feature of geojson.features) {
    if (!feature.geometry) continue;
    const name = feature.properties?.name || '';
    const isTurkey = /turkey|türkiye/i.test(name);
    const polygons = feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;

    polygons.forEach((polygon) => {
      ctx.beginPath();
      polygon.forEach((ring) => drawRingPath(ctx, ring, width, height));
      ctx.fillStyle = isTurkey ? '#b6223d' : '#0a3635';
      ctx.fill('evenodd');
      ctx.strokeStyle = isTurkey ? '#ff667a' : '#2a8580';
      ctx.lineWidth = isTurkey ? 2.8 : 1.15;
      ctx.stroke();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function useWorldTexture() {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    let active = true;
    fetch(WORLD_URL)
      .then((r) => r.json())
      .then((geojson) => {
        if (!active) return;
        setTexture(makeWorldTexture(geojson));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  return texture;
}

function buildGraticule() {
  const lines = [];
  for (let lat = -60; lat <= 60; lat += 20) {
    const points = [];
    for (let lon = -180; lon <= 180; lon += 4) points.push(latLonToVec3(lat, lon, R + 0.004));
    lines.push(points);
  }
  for (let lon = -180; lon < 180; lon += 20) {
    const points = [];
    for (let lat = -84; lat <= 84; lat += 4) points.push(latLonToVec3(lat, lon, R + 0.004));
    lines.push(points);
  }
  return lines;
}

function Graticule() {
  const lines = useMemo(buildGraticule, []);
  return lines.map((points, i) => (
    <Line key={i} points={points} color="#0c6268" lineWidth={0.22} transparent opacity={0.17} depthWrite={false} />
  ));
}

function makeLabelTexture(text, target = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 128);
  ctx.font = target ? '700 40px Arial' : '600 31px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = target ? 18 : 10;
  ctx.shadowColor = target ? '#ff304f' : '#23e6a1';
  ctx.fillStyle = target ? '#ff7082' : '#bfffea';
  ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function CountryLabel({ country }) {
  const position = useMemo(() => latLonToVec3(country.lat, country.lon, R + 0.105), [country]);
  const texture = useMemo(() => makeLabelTexture(country.name, country.target), [country.name, country.target]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={country.target ? [0.72, 0.18, 1] : [0.54, 0.135, 1]}>
      <spriteMaterial map={texture} transparent depthTest depthWrite={false} opacity={0.94} toneMapped={false} />
    </sprite>
  );
}

function CountryNode({ country }) {
  const ringRef = useRef();
  const position = useMemo(() => latLonToVec3(country.lat, country.lon, R + 0.012), [country]);
  const quaternion = useMemo(() => surfaceQuaternion(position), [position]);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const s = 1 + Math.sin(clock.getElapsedTime() * 2.4 + country.index * 0.55) * 0.16;
    ringRef.current.scale.setScalar(s);
  });

  const target = country.target;
  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <circleGeometry args={[target ? 0.048 : 0.018, 20]} />
        <meshBasicMaterial color={target ? '#ff2848' : '#24f09b'} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0, 0.004]}>
        <ringGeometry args={[target ? 0.07 : 0.028, target ? 0.095 : 0.042, 28]} />
        <meshBasicMaterial
          color={target ? '#ff4560' : '#2affe0'}
          transparent
          opacity={target ? 0.42 : 0.28}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function DataFlow({ country, index }) {
  const start = useMemo(() => latLonToVec3(country.lat, country.lon, R + 0.018), [country]);
  const end = useMemo(() => latLonToVec3(TURKEY.lat, TURKEY.lon, R + 0.024), []);
  const curve = useMemo(() => {
    const distance = start.distanceTo(end);
    const lift = 0.42 + Math.min(distance * 0.19, 1.05);
    const midpoint = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(R + lift);
    return new THREE.QuadraticBezierCurve3(start, midpoint, end);
  }, [start, end]);
  const points = useMemo(() => curve.getPoints(120), [curve]);
  const packets = [useRef(), useRef(), useRef(), useRef()];

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const speed = 0.095 + (index % 4) * 0.009;
    packets.forEach((ref, packetIndex) => {
      const t = (elapsed * speed + index * 0.057 + packetIndex * 0.21) % 1;
      if (ref.current) ref.current.position.copy(curve.getPoint(t));
    });
  });

  return (
    <group>
      <Line points={points} color="#0b7e75" lineWidth={1.1} transparent opacity={0.18} depthWrite={false} />
      <Line points={points} color="#22e9b1" lineWidth={0.48} transparent opacity={0.55} depthWrite={false} />
      <Line points={points} color="#a8ffe8" lineWidth={0.14} transparent opacity={0.85} depthWrite={false} />
      {packets.map((ref, packetIndex) => (
        <group ref={ref} key={packetIndex}>
          <mesh>
            <sphereGeometry args={[packetIndex === 0 ? 0.022 : 0.014, 10, 10]} />
            <meshBasicMaterial color={packetIndex === 0 ? '#eafff8' : '#2affba'} toneMapped={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[packetIndex === 0 ? 0.055 : 0.035, 8, 8]} />
            <meshBasicMaterial color="#20f0ac" transparent opacity={0.08} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const ORION = {
  points: [[-1,1.15,0],[1,1.05,0],[-.52,.18,0],[0,.1,0],[.52,.02,0],[-.82,-1.05,0],[.9,-1.15,0]],
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

function Constellation({ data, position, scale = 1, rotation = [0,0,0] }) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {data.links.map(([a,b], i) => (
        <Line key={`l-${i}`} points={[data.points[a], data.points[b]]} color="#7db8ff" lineWidth={0.32} transparent opacity={0.16} depthWrite={false} />
      ))}
      {data.points.map((p, i) => (
        <group key={`s-${i}`} position={p}>
          <mesh><sphereGeometry args={[i % 3 === 0 ? 0.04 : 0.025, 8, 8]} /><meshBasicMaterial color="#e5f3ff" toneMapped={false} /></mesh>
          <mesh><sphereGeometry args={[i % 3 === 0 ? 0.11 : 0.07, 8, 8]} /><meshBasicMaterial color="#6caaff" transparent opacity={0.055} depthWrite={false} toneMapped={false} /></mesh>
        </group>
      ))}
    </group>
  );
}

function DeepSpace() {
  return (
    <group>
      <Stars radius={140} depth={100} count={14000} factor={2.5} saturation={0.12} fade speed={0.035} />
      <Stars radius={65} depth={42} count={3200} factor={1.1} saturation={0} fade speed={0.015} />
      <Constellation data={ORION} position={[-8.2, 2.4, -10]} scale={1.05} rotation={[.1,.25,-.2]} />
      <Constellation data={BIG_DIPPER} position={[7.4, 3.1, -11]} scale={1.05} rotation={[-.1,-.3,.18]} />
      <Constellation data={CASSIOPEIA} position={[6.5, -3.5, -9]} scale={.9} rotation={[.2,.15,-.1]} />
    </group>
  );
}

function Globe() {
  const group = useRef();
  const worldTexture = useWorldTexture();

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.026;
  });

  return (
    <group ref={group} rotation={[0.08, -0.58, -0.02]}>
      <mesh>
        <sphereGeometry args={[R, 128, 128]} />
        <meshStandardMaterial
          map={worldTexture || null}
          color={worldTexture ? '#ffffff' : '#072328'}
          roughness={0.72}
          metalness={0.16}
          emissive="#001214"
          emissiveIntensity={0.55}
        />
      </mesh>

      <Graticule />
      {COUNTRIES.map((country) => <CountryNode key={country.name} country={country} />)}
      {FLOWS.map((country, index) => <DataFlow key={country.name} country={country} index={index} />)}
      {COUNTRIES.filter((c) => c.label).map((country) => <CountryLabel key={`label-${country.name}`} country={country} />)}

      <mesh>
        <sphereGeometry args={[R + 0.10, 96, 96]} />
        <meshBasicMaterial color="#0aa0b5" transparent opacity={0.026} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0.04, 7.25], fov: 40 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <fog attach="fog" args={["#02060b", 16, 45]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 6]} intensity={1.7} color="#c5efff" />
      <pointLight position={[-5, -1, 4]} intensity={16} distance={12} color="#0b61ff" />
      <pointLight position={[4, 2, -3]} intensity={11} distance={10} color="#00d69a" />
      <DeepSpace />
      <Globe />
      <OrbitControls
        enablePan={false}
        enableZoom
        enableRotate
        minDistance={4.65}
        maxDistance={10.5}
        rotateSpeed={0.52}
        zoomSpeed={0.58}
        dampingFactor={0.045}
        enableDamping
      />
    </Canvas>
  );
}

export default function App() {
  return (
    <main className="space-shell">
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="nebula nebula-c" />
      <div className="scene-layer"><Scene /></div>
      <div className="vignette" />
      <div className="grain" />
    </main>
  );
}
