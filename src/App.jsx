import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const R = 2.58;
const WORLD_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

const COUNTRIES = [
  { name: 'ABD', lat: 39.2, lon: -98.5, region: 'AMERİKA', label: true, flow: true, hub: true },
  { name: 'KANADA', lat: 57.0, lon: -106.0, region: 'AMERİKA', label: true, flow: true },
  { name: 'BREZİLYA', lat: -10.8, lon: -52.9, region: 'AMERİKA', label: true, flow: true, hub: true },
  { name: 'ARJANTİN', lat: -38.4, lon: -63.6, region: 'AMERİKA', flow: true },
  { name: 'İNGİLTERE', lat: 54.2, lon: -2.5, region: 'AVRUPA', label: true, flow: true, hub: true },
  { name: 'FRANSA', lat: 46.4, lon: 2.2, region: 'AVRUPA', label: true, flow: true },
  { name: 'ALMANYA', lat: 51.1, lon: 10.4, region: 'AVRUPA', label: true, flow: true, hub: true },
  { name: 'İSPANYA', lat: 40.3, lon: -3.7, region: 'AVRUPA', flow: true },
  { name: 'İTALYA', lat: 42.8, lon: 12.5, region: 'AVRUPA', flow: true },
  { name: 'RUSYA', lat: 61.5, lon: 90.0, region: 'AVRUPA', label: true, flow: true },
  { name: 'TÜRKİYE', lat: 39.0, lon: 35.0, region: 'MEA', label: true, target: true, hub: true },
  { name: 'MISIR', lat: 26.8, lon: 30.8, region: 'MEA', label: true, flow: true },
  { name: 'BAE', lat: 24.3, lon: 54.3, region: 'MEA', label: true, flow: true, hub: true },
  { name: 'GÜNEY AFRİKA', lat: -30.6, lon: 22.9, region: 'MEA', label: true, flow: true },
  { name: 'HİNDİSTAN', lat: 22.6, lon: 79.0, region: 'ASYA', label: true, flow: true },
  { name: 'ÇİN', lat: 35.9, lon: 104.2, region: 'ASYA', label: true, flow: true },
  { name: 'JAPONYA', lat: 36.2, lon: 138.2, region: 'ASYA', label: true, flow: true, hub: true },
  { name: 'GÜNEY KORE', lat: 36.4, lon: 127.9, region: 'ASYA', flow: true },
  { name: 'SİNGAPUR', lat: 1.35, lon: 103.82, region: 'ASYA', label: true, flow: true, hub: true },
  { name: 'ENDONEZYA', lat: -2.5, lon: 118.0, region: 'ASYA', flow: true },
  { name: 'AVUSTRALYA', lat: -25.3, lon: 133.8, region: 'OKYANUSYA', label: true, flow: true, hub: true },
].map((country, index) => ({ ...country, index }));

const TURKEY = COUNTRIES.find((country) => country.target);
const FILTERS = ['TÜMÜ', 'AMERİKA', 'AVRUPA', 'MEA', 'ASYA', 'OKYANUSYA', 'HUBLAR'];

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

  const ocean = ctx.createRadialGradient(width * 0.45, height * 0.42, 30, width * 0.5, height * 0.5, width * 0.7);
  ocean.addColorStop(0, '#0a3340');
  ocean.addColorStop(0.45, '#072731');
  ocean.addColorStop(1, '#03131c');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.18;
  for (let y = 0; y < height; y += 36) {
    ctx.strokeStyle = '#2f7a8a';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + 18);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  geojson.features.forEach((feature, featureIndex) => {
    if (!feature.geometry) return;
    const name = feature.properties?.name || '';
    const isTurkey = /turkey|türkiye/i.test(name);
    const polygons = feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;

    polygons.forEach((polygon) => {
      ctx.beginPath();
      polygon.forEach((ring) => drawRingPath(ctx, ring, width, height));
      const alt = featureIndex % 4;
      ctx.fillStyle = isTurkey
        ? '#c92f4a'
        : ['#0b4a48', '#0b4143', '#0d5050', '#0b4547'][alt];
      ctx.fill('evenodd');
      ctx.strokeStyle = isTurkey ? '#ff8090' : '#4aa6a0';
      ctx.lineWidth = isTurkey ? 3.2 : 1.15;
      ctx.stroke();
    });
  });

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
    <Line key={i} points={points} color="#3b939c" lineWidth={0.22} transparent opacity={0.13} depthWrite={false} />
  ));
}

function makeLabelTexture(text, target = false, hub = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 128);
  ctx.font = target ? '700 40px Arial' : '600 31px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = target ? 18 : 10;
  ctx.shadowColor = target ? '#ff304f' : hub ? '#ffd76a' : '#23e6a1';
  ctx.fillStyle = target ? '#ff7a8c' : hub ? '#ffe7a4' : '#c6fff0';
  ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function CountryLabel({ country, labelScale }) {
  const position = useMemo(() => latLonToVec3(country.lat, country.lon, R + 0.105), [country]);
  const texture = useMemo(() => makeLabelTexture(country.name, country.target, country.hub), [country]);
  useEffect(() => () => texture.dispose(), [texture]);
  const base = country.target ? 0.72 : 0.54;
  return (
    <sprite position={position} scale={[base * labelScale, base * 0.25 * labelScale, 1]}>
      <spriteMaterial map={texture} transparent depthTest depthWrite={false} opacity={0.95} toneMapped={false} />
    </sprite>
  );
}

function CountryNode({ country, nodeScale }) {
  const ringRef = useRef();
  const beaconRef = useRef();
  const position = useMemo(() => latLonToVec3(country.lat, country.lon, R + 0.012), [country]);
  const quaternion = useMemo(() => surfaceQuaternion(position), [position]);

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.getElapsedTime() * 2.4 + country.index * 0.55) * 0.16;
    if (ringRef.current) ringRef.current.scale.setScalar(pulse);
    if (beaconRef.current) beaconRef.current.scale.z = 0.75 + Math.sin(clock.getElapsedTime() * 2 + country.index) * 0.18;
  });

  const target = country.target;
  const hub = country.hub && !target;
  const core = target ? '#ff2848' : hub ? '#ffd35f' : '#24f09b';
  const glow = target ? '#ff4560' : hub ? '#ffe58c' : '#2affe0';
  const baseRadius = target ? 0.048 : hub ? 0.026 : 0.018;

  return (
    <group position={position} quaternion={quaternion} scale={nodeScale}>
      <mesh>
        <circleGeometry args={[baseRadius, 24]} />
        <meshBasicMaterial color={core} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0, 0.004]}>
        <ringGeometry args={[baseRadius * 1.5, baseRadius * 2.25, 32]} />
        <meshBasicMaterial color={glow} transparent opacity={hub ? 0.45 : 0.28} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      {hub && (
        <mesh ref={beaconRef} position={[0, 0, 0.035]}>
          <cylinderGeometry args={[0.006, 0.014, 0.09, 8]} />
          <meshBasicMaterial color="#ffe799" transparent opacity={0.8} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

function DataFlow({ country, index, density }) {
  const start = useMemo(() => latLonToVec3(country.lat, country.lon, R + 0.018), [country]);
  const end = useMemo(() => latLonToVec3(TURKEY.lat, TURKEY.lon, R + 0.024), []);
  const curve = useMemo(() => {
    const distance = start.distanceTo(end);
    const lift = 0.42 + Math.min(distance * 0.19, 1.05);
    const midpoint = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(R + lift);
    return new THREE.QuadraticBezierCurve3(start, midpoint, end);
  }, [start, end]);
  const points = useMemo(() => curve.getPoints(120), [curve]);
  const packetRefs = useRef([]);
  const packetCount = Math.max(2, Math.min(7, density + 2));

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const speed = 0.095 + (index % 4) * 0.009;
    for (let packetIndex = 0; packetIndex < packetCount; packetIndex += 1) {
      const ref = packetRefs.current[packetIndex];
      if (!ref) continue;
      const t = (elapsed * speed + index * 0.057 + packetIndex / packetCount) % 1;
      ref.position.copy(curve.getPoint(t));
    }
  });

  return (
    <group>
      <Line points={points} color="#0a8179" lineWidth={1.15} transparent opacity={0.18 + density * 0.02} depthWrite={false} />
      <Line points={points} color="#22e9b1" lineWidth={0.5} transparent opacity={0.56} depthWrite={false} />
      <Line points={points} color="#b8ffed" lineWidth={0.14} transparent opacity={0.85} depthWrite={false} />
      {Array.from({ length: packetCount }).map((_, packetIndex) => (
        <group ref={(node) => { packetRefs.current[packetIndex] = node; }} key={packetIndex}>
          <mesh>
            <sphereGeometry args={[packetIndex === 0 ? 0.022 : 0.013, 10, 10]} />
            <meshBasicMaterial color={packetIndex === 0 ? '#effff9' : '#2affba'} toneMapped={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[packetIndex === 0 ? 0.055 : 0.032, 8, 8]} />
            <meshBasicMaterial color="#20f0ac" transparent opacity={0.08} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const ORION = {
  stars: [
    [-1.08, 1.08, 0, 0.052], [0.96, 1.18, 0, 0.045], [-0.58, 0.18, 0, 0.038],
    [0, 0.08, 0, 0.033], [0.56, 0.02, 0, 0.04], [-0.92, -1.05, 0, 0.049], [0.84, -1.16, 0, 0.044],
  ],
  links: [[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]],
};
const BIG_DIPPER = {
  stars: [
    [-1.35,.42,0,.045],[-.58,.73,0,.038],[.08,.37,0,.05],[.04,-.37,0,.041],
    [-.82,-.45,0,.039],[-1.48,-.05,0,.046],[.82,.6,0,.037],[1.5,.75,0,.05],
  ],
  links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6],[6,7]],
};
const CASSIOPEIA = {
  stars: [[-1.35,.35,0,.04],[-.68,-.2,0,.052],[0,.5,0,.038],[.72,-.08,0,.048],[1.38,.5,0,.043]],
  links: [[0,1],[1,2],[2,3],[3,4]],
};

function Constellation({ data, position, scale = 1, rotation = [0,0,0] }) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {data.links.map(([a,b], i) => (
        <Line key={`l-${i}`} points={[data.stars[a], data.stars[b]]} color="#8ebeff" lineWidth={0.24} transparent opacity={0.11} depthWrite={false} />
      ))}
      {data.stars.map(([x,y,z,size], i) => (
        <group key={`s-${i}`} position={[x,y,z]}>
          <mesh><sphereGeometry args={[size, 8, 8]} /><meshBasicMaterial color="#eef7ff" toneMapped={false} /></mesh>
          <mesh><sphereGeometry args={[size * 2.8, 8, 8]} /><meshBasicMaterial color="#6caaff" transparent opacity={0.05} depthWrite={false} toneMapped={false} /></mesh>
        </group>
      ))}
    </group>
  );
}

function ShootingStar({ start, end, period, delay, trail = 1 }) {
  const group = useRef();
  const direction = useMemo(() => new THREE.Vector3().subVectors(new THREE.Vector3(...end), new THREE.Vector3(...start)).normalize(), [start, end]);
  const tailPoint = useMemo(() => direction.clone().multiplyScalar(-trail).toArray(), [direction, trail]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const elapsed = clock.getElapsedTime() + delay;
    const cycle = (elapsed % period) / period;
    const activeLength = 0.16;
    if (cycle > activeLength) {
      group.current.visible = false;
      return;
    }
    group.current.visible = true;
    const t = cycle / activeLength;
    group.current.position.lerpVectors(new THREE.Vector3(...start), new THREE.Vector3(...end), t);
  });

  return (
    <group ref={group} visible={false}>
      <Line points={[[0,0,0], tailPoint]} color="#dcefff" lineWidth={0.65} transparent opacity={0.7} depthWrite={false} />
      <mesh><sphereGeometry args={[0.035, 8, 8]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      <mesh><sphereGeometry args={[0.11, 8, 8]} /><meshBasicMaterial color="#90c9ff" transparent opacity={0.08} depthWrite={false} toneMapped={false} /></mesh>
    </group>
  );
}

function DeepSpace() {
  return (
    <group>
      <Stars radius={150} depth={110} count={16000} factor={2.5} saturation={0.14} fade speed={0.025} />
      <Stars radius={70} depth={46} count={4200} factor={1.15} saturation={0} fade speed={0.012} />
      <Constellation data={ORION} position={[-8.5, 2.6, -11]} scale={1.08} rotation={[.1,.25,-.2]} />
      <Constellation data={BIG_DIPPER} position={[7.6, 3.2, -12]} scale={1.08} rotation={[-.1,-.3,.18]} />
      <Constellation data={CASSIOPEIA} position={[6.7, -3.6, -10]} scale={.92} rotation={[.2,.15,-.1]} />
      <ShootingStar start={[-7, 4, -4]} end={[5, -1, -7]} period={11} delay={1.5} trail={1.6} />
      <ShootingStar start={[8, 2.5, -8]} end={[-2, -2, -6]} period={17} delay={5.2} trail={1.2} />
      <ShootingStar start={[-3, 5, -10]} end={[7, 1, -9]} period={23} delay={9.5} trail={1.4} />
    </group>
  );
}

function Globe({ activeFilter, labelScale, nodeScale, flowDensity }) {
  const group = useRef();
  const worldTexture = useWorldTexture();

  const visibleCountries = useMemo(() => {
    if (activeFilter === 'TÜMÜ') return COUNTRIES;
    if (activeFilter === 'HUBLAR') return COUNTRIES.filter((c) => c.hub || c.target);
    return COUNTRIES.filter((c) => c.region === activeFilter || c.target);
  }, [activeFilter]);

  const visibleFlows = useMemo(
    () => visibleCountries.filter((c) => c.flow && !c.target),
    [visibleCountries],
  );

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.022;
  });

  return (
    <group ref={group} rotation={[0.08, -0.58, -0.02]}>
      <mesh>
        <sphereGeometry args={[R, 128, 128]} />
        <meshStandardMaterial
          map={worldTexture || null}
          color={worldTexture ? '#ffffff' : '#0b3338'}
          roughness={0.68}
          metalness={0.12}
          emissive="#062129"
          emissiveIntensity={0.38}
        />
      </mesh>
      <Graticule />
      {visibleCountries.map((country) => <CountryNode key={country.name} country={country} nodeScale={nodeScale} />)}
      {visibleFlows.map((country, index) => <DataFlow key={country.name} country={country} index={index} density={flowDensity} />)}
      {visibleCountries.filter((c) => c.label).map((country) => <CountryLabel key={`label-${country.name}`} country={country} labelScale={labelScale} />)}
      <mesh>
        <sphereGeometry args={[R + 0.105, 96, 96]} />
        <meshBasicMaterial color="#35c9e0" transparent opacity={0.035} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Scene({ activeFilter, labelScale, nodeScale, flowDensity }) {
  return (
    <Canvas
      camera={{ position: [0, 0.04, 7.25], fov: 40 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <fog attach="fog" args={["#02060b", 18, 52]} />
      <ambientLight intensity={0.72} />
      <hemisphereLight intensity={0.5} color="#9be7ff" groundColor="#021018" />
      <directionalLight position={[5, 3, 6]} intensity={2.15} color="#d0f4ff" />
      <pointLight position={[-5, -1, 4]} intensity={18} distance={13} color="#0b61ff" />
      <pointLight position={[4, 2, -3]} intensity={12} distance={11} color="#00d69a" />
      <DeepSpace />
      <Globe activeFilter={activeFilter} labelScale={labelScale} nodeScale={nodeScale} flowDensity={flowDensity} />
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

function FilterPanel({ open, setOpen, activeFilter, setActiveFilter, labelScale, setLabelScale, nodeScale, setNodeScale, flowDensity, setFlowDensity }) {
  return (
    <div className="filter-wrap">
      <button className={`filter-button ${open ? 'active' : ''}`} onClick={() => setOpen((v) => !v)} aria-label="Filtreleri aç">
        <span className="filter-icon">⌘</span>
        <span>FİLTRE</span>
      </button>

      {open && (
        <div className="filter-panel">
          <div className="filter-section-title">BÖLGE</div>
          <div className="region-grid">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? 'selected' : ''}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="control-row">
            <div className="control-label"><span>ÜLKE İSİMLERİ</span><b>{Math.round(labelScale * 100)}%</b></div>
            <input type="range" min="0.55" max="1.65" step="0.05" value={labelScale} onChange={(e) => setLabelScale(Number(e.target.value))} />
          </div>

          <div className="control-row">
            <div className="control-label"><span>NODE BOYUTU</span><b>{Math.round(nodeScale * 100)}%</b></div>
            <input type="range" min="0.65" max="1.7" step="0.05" value={nodeScale} onChange={(e) => setNodeScale(Number(e.target.value))} />
          </div>

          <div className="control-row">
            <div className="control-label"><span>AKIŞ YOĞUNLUĞU</span><b>{flowDensity}</b></div>
            <input type="range" min="1" max="5" step="1" value={flowDensity} onChange={(e) => setFlowDensity(Number(e.target.value))} />
          </div>

          <div className="hub-legend"><span className="hub-dot" /> HUB NODE</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('TÜMÜ');
  const [labelScale, setLabelScale] = useState(1);
  const [nodeScale, setNodeScale] = useState(1);
  const [flowDensity, setFlowDensity] = useState(3);

  return (
    <main className="space-shell">
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="nebula nebula-c" />
      <div className="scene-layer">
        <Scene activeFilter={activeFilter} labelScale={labelScale} nodeScale={nodeScale} flowDensity={flowDensity} />
      </div>
      <FilterPanel
        open={filterOpen}
        setOpen={setFilterOpen}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        labelScale={labelScale}
        setLabelScale={setLabelScale}
        nodeScale={nodeScale}
        setNodeScale={setNodeScale}
        flowDensity={flowDensity}
        setFlowDensity={setFlowDensity}
      />
      <div className="vignette" />
      <div className="grain" />
    </main>
  );
}
