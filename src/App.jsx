import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const WORLD_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
const SPACE_IMG = 'https://unpkg.com/three-globe/example/img/night-sky.png';

const COUNTRIES = [
  { name: 'TÜRKİYE', lat: 39.0, lng: 35.0, region: 'MEA', target: true, hub: true, label: true },
  { name: 'ABD', lat: 39.2, lng: -98.5, region: 'AMERİKA', hub: true, label: true },
  { name: 'KANADA', lat: 57.0, lng: -106.0, region: 'AMERİKA', label: true },
  { name: 'MEKSİKA', lat: 23.6, lng: -102.5, region: 'AMERİKA' },
  { name: 'BREZİLYA', lat: -10.8, lng: -52.9, region: 'AMERİKA', label: true },
  { name: 'ARJANTİN', lat: -38.4, lng: -63.6, region: 'AMERİKA' },
  { name: 'ALMANYA', lat: 51.1, lng: 10.4, region: 'AVRUPA', hub: true, label: true },
  { name: 'İNGİLTERE', lat: 54.2, lng: -2.5, region: 'AVRUPA', label: true },
  { name: 'FRANSA', lat: 46.4, lng: 2.2, region: 'AVRUPA', label: true },
  { name: 'İSPANYA', lat: 40.3, lng: -3.7, region: 'AVRUPA' },
  { name: 'İTALYA', lat: 42.8, lng: 12.5, region: 'AVRUPA' },
  { name: 'HOLLANDA', lat: 52.2, lng: 5.3, region: 'AVRUPA' },
  { name: 'İSVEÇ', lat: 62.0, lng: 15.0, region: 'AVRUPA' },
  { name: 'POLONYA', lat: 52.1, lng: 19.4, region: 'AVRUPA' },
  { name: 'RUSYA', lat: 61.5, lng: 90.0, region: 'AVRUPA', label: true },
  { name: 'BAE', lat: 24.3, lng: 54.3, region: 'MEA', hub: true, label: true },
  { name: 'MISIR', lat: 26.8, lng: 30.8, region: 'MEA', label: true },
  { name: 'SUUDİ ARABİSTAN', lat: 23.9, lng: 45.1, region: 'MEA' },
  { name: 'GÜNEY AFRİKA', lat: -30.6, lng: 22.9, region: 'MEA', label: true },
  { name: 'NİJERYA', lat: 9.1, lng: 8.7, region: 'MEA' },
  { name: 'KENYA', lat: 0.1, lng: 37.9, region: 'MEA' },
  { name: 'SİNGAPUR', lat: 1.35, lng: 103.82, region: 'ASYA', hub: true, label: true },
  { name: 'ÇİN', lat: 35.9, lng: 104.2, region: 'ASYA', label: true },
  { name: 'HİNDİSTAN', lat: 22.6, lng: 79.0, region: 'ASYA', label: true },
  { name: 'JAPONYA', lat: 36.2, lng: 138.2, region: 'ASYA', label: true },
  { name: 'GÜNEY KORE', lat: 36.4, lng: 127.9, region: 'ASYA' },
  { name: 'ENDONEZYA', lat: -2.5, lng: 118.0, region: 'ASYA' },
  { name: 'AVUSTRALYA', lat: -25.3, lng: 133.8, region: 'OKYANUSYA', hub: true, label: true },
  { name: 'YENİ ZELANDA', lat: -41.3, lng: 174.8, region: 'OKYANUSYA' },
];

const REGION_HUB = {
  AMERİKA: 'ABD',
  AVRUPA: 'ALMANYA',
  MEA: 'BAE',
  ASYA: 'SİNGAPUR',
  OKYANUSYA: 'AVUSTRALYA',
};

const FILTERS = ['TÜMÜ', 'AMERİKA', 'AVRUPA', 'MEA', 'ASYA', 'OKYANUSYA', 'HUBLAR'];

function normalizeName(value = '') {
  return value
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ü', 'u')
    .replaceAll('ö', 'o')
    .replaceAll('ş', 's')
    .replaceAll('ğ', 'g')
    .replaceAll('ç', 'c');
}

function isTurkeyFeature(feature) {
  const name = normalizeName(feature?.properties?.name || feature?.properties?.ADMIN || '');
  return name.includes('turkey') || name.includes('turkiye');
}

function landColor(feature) {
  if (isTurkeyFeature(feature)) return '#9f3045';
  const raw = feature?.properties?.name || '';
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  const palette = ['#263747', '#2c3d4d', '#314253', '#283b4b', '#334556'];
  return palette[hash % palette.length];
}

function useWindowSize() {
  const [size, setSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

function FilterPanel({ open, setOpen, activeFilter, setActiveFilter, labelScale, setLabelScale, nodeScale, setNodeScale, flowDensity, setFlowDensity }) {
  return (
    <div className="filter-wrap">
      <button className={`filter-button ${open ? 'active' : ''}`} onClick={() => setOpen((v) => !v)}>
        <span className="filter-icon">⌘</span><span>FİLTRE</span>
      </button>
      {open && (
        <div className="filter-panel">
          <div className="filter-section-title">BÖLGE</div>
          <div className="region-grid">
            {FILTERS.map((filter) => (
              <button key={filter} className={activeFilter === filter ? 'selected' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>
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

function ConstellationBackdrop() {
  return (
    <div className="space-backdrop">
      <div className="starfield starfield-a" />
      <div className="starfield starfield-b" />
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="nebula nebula-c" />
      <svg className="constellation constellation-orion" viewBox="0 0 220 220" aria-hidden="true">
        <path className="const-lines" d="M44 28 L80 90 L110 102 L139 94 L178 31 M80 90 L60 180 M139 94 L166 182" />
        {[ [44,28],[178,31],[80,90],[110,102],[139,94],[60,180],[166,182] ].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i===0||i===1?3:2}/>) }
      </svg>
      <svg className="constellation constellation-dipper" viewBox="0 0 280 170" aria-hidden="true">
        <path className="const-lines" d="M32 83 L71 48 L117 66 L114 111 L62 119 L32 83 M117 66 L174 45 L232 31" />
        {[ [32,83],[71,48],[117,66],[114,111],[62,119],[174,45],[232,31] ].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i===2?3:2}/>) }
      </svg>
      <svg className="constellation constellation-cassiopeia" viewBox="0 0 240 110" aria-hidden="true">
        <path className="const-lines" d="M15 34 L62 74 L112 24 L164 68 L220 23" />
        {[ [15,34],[62,74],[112,24],[164,68],[220,23] ].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i===2?3:2}/>) }
      </svg>
      <div className="shooting-star shooting-star-a" />
      <div className="shooting-star shooting-star-b" />
      <div className="shooting-star shooting-star-c" />
    </div>
  );
}

export default function App() {
  const globeRef = useRef();
  const { width, height } = useWindowSize();
  const [geojson, setGeojson] = useState({ features: [] });
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('TÜMÜ');
  const [labelScale, setLabelScale] = useState(1);
  const [nodeScale, setNodeScale] = useState(1);
  const [flowDensity, setFlowDensity] = useState(3);

  useEffect(() => {
    let active = true;
    fetch(WORLD_URL).then((r) => r.json()).then((data) => active && setGeojson(data)).catch(() => {});
    return () => { active = false; };
  }, []);

  const visibleCountries = useMemo(() => {
    if (activeFilter === 'TÜMÜ') return COUNTRIES;
    if (activeFilter === 'HUBLAR') return COUNTRIES.filter((c) => c.hub || c.target);
    return COUNTRIES.filter((c) => c.region === activeFilter || c.target);
  }, [activeFilter]);

  const arcs = useMemo(() => {
    const byName = new Map(COUNTRIES.map((c) => [c.name, c]));
    const result = [];
    visibleCountries.forEach((country) => {
      if (country.target) return;
      if (country.hub) {
        result.push({ from: country, to: byName.get('TÜRKİYE'), backbone: true });
      } else {
        const hub = byName.get(REGION_HUB[country.region]);
        if (hub) result.push({ from: country, to: hub, backbone: false });
      }
    });
    return result;
  }, [visibleCountries]);

  const labels = useMemo(() => visibleCountries.filter((c) => c.label), [visibleCountries]);
  const hubs = useMemo(() => visibleCountries.filter((c) => c.hub || c.target), [visibleCountries]);

  const onReady = () => {
    const globe = globeRef.current;
    if (!globe) return;
    const material = globe.globeMaterial?.();
    if (material) {
      material.color = new THREE.Color('#071a2d');
      material.emissive = new THREE.Color('#020914');
      material.emissiveIntensity = 0.42;
      material.roughness = 0.82;
      material.metalness = 0.12;
    }
    const controls = globe.controls?.();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.32;
      controls.enableDamping = true;
      controls.dampingFactor = 0.055;
    }
    globe.pointOfView?.({ lat: 24, lng: 24, altitude: 2.15 }, 0);
  };

  return (
    <main className="space-shell">
      <ConstellationBackdrop />
      <div className="globe-host">
        <Globe
          ref={globeRef}
          width={width}
          height={height}
          onGlobeReady={onReady}
          backgroundImageUrl={SPACE_IMG}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor="#4aa8ff"
          atmosphereAltitude={0.16}
          showGraticules
          polygonsData={geojson.features}
          polygonCapColor={landColor}
          polygonSideColor={(d) => isTurkeyFeature(d) ? '#551525' : '#111c27'}
          polygonStrokeColor={(d) => isTurkeyFeature(d) ? '#ff7188' : 'rgba(154,195,220,0.34)'}
          polygonAltitude={(d) => isTurkeyFeature(d) ? 0.012 : 0.004}
          polygonTransitionDuration={250}
          pointsData={visibleCountries}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0.007}
          pointRadius={(d) => (d.target ? 0.28 : d.hub ? 0.21 : 0.105) * nodeScale}
          pointColor={(d) => d.target ? '#ff3659' : d.hub ? '#ffc85c' : '#37f2a5'}
          pointsMerge={false}
          ringsData={hubs}
          ringLat="lat"
          ringLng="lng"
          ringAltitude={0.008}
          ringColor={(d) => () => d.target ? '#ff3659' : '#ffd16a'}
          ringMaxRadius={(d) => (d.target ? 2.2 : 1.35) * nodeScale}
          ringPropagationSpeed={0.7}
          ringRepeatPeriod={1200}
          arcsData={arcs}
          arcStartLat={(d) => d.from.lat}
          arcStartLng={(d) => d.from.lng}
          arcEndLat={(d) => d.to.lat}
          arcEndLng={(d) => d.to.lng}
          arcColor={(d) => d.backbone ? ['#7fffe0', '#ffcd69'] : ['#39efa8', '#73bfff']}
          arcAltitudeAutoScale={(d) => d.backbone ? 0.34 : 0.2}
          arcStroke={(d) => d.backbone ? 0.55 : 0.28}
          arcDashLength={(d) => d.backbone ? 0.22 : 0.14}
          arcDashGap={(d) => d.backbone ? 0.07 : 0.11}
          arcDashInitialGap={() => Math.random()}
          arcDashAnimateTime={(d) => Math.max(850, 2500 - flowDensity * 260 + (d.backbone ? -250 : 180))}
          labelsData={labels}
          labelLat="lat"
          labelLng="lng"
          labelText="name"
          labelColor={(d) => d.target ? '#ff8799' : d.hub ? '#ffe09a' : '#d8efff'}
          labelSize={(d) => (d.target ? 1.0 : d.hub ? 0.72 : 0.56) * labelScale}
          labelDotRadius={(d) => (d.target ? 0.2 : 0.11) * nodeScale}
          labelAltitude={0.018}
          labelResolution={3}
        />
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
      <div className="screen-vignette" />
    </main>
  );
}
