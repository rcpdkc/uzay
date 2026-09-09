import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const WORLD_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

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
const LAND_PALETTE = ['#263f59', '#2b4864', '#314f6c', '#365773', '#29455f'];

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
  if (isTurkeyFeature(feature)) return '#a12f49';
  const raw = feature?.properties?.name || '';
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  return LAND_PALETTE[hash % LAND_PALETTE.length];
}

function rgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
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
          <div className="legend-row"><span><i className="legend-node normal" /> NODE</span><span><i className="legend-node hub" /> HUB</span><span><i className="legend-node turkey" /> TÜRKİYE</span></div>
        </div>
      )}
    </div>
  );
}

function SpaceBackdrop() {
  return (
    <div className="space-backdrop">
      <div className="space-dust space-dust-a" />
      <div className="space-dust space-dust-b" />
      <div className="starfield starfield-a" />
      <div className="starfield starfield-b" />
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="nebula nebula-c" />
      <svg className="constellation constellation-orion" viewBox="0 0 220 220" aria-hidden="true">
        <path className="const-lines" d="M44 28 L80 90 L110 102 L139 94 L178 31 M80 90 L60 180 M139 94 L166 182" />
        {[[44,28],[178,31],[80,90],[110,102],[139,94],[60,180],[166,182]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i===0||i===1?3:2}/>) }
      </svg>
      <svg className="constellation constellation-dipper" viewBox="0 0 280 170" aria-hidden="true">
        <path className="const-lines" d="M32 83 L71 48 L117 66 L114 111 L62 119 L32 83 M117 66 L174 45 L232 31" />
        {[[32,83],[71,48],[117,66],[114,111],[62,119],[174,45],[232,31]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i===2?3:2}/>) }
      </svg>
      <svg className="constellation constellation-cassiopeia" viewBox="0 0 240 110" aria-hidden="true">
        <path className="const-lines" d="M15 34 L62 74 L112 24 L164 68 L220 23" />
        {[[15,34],[62,74],[112,24],[164,68],[220,23]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i===2?3:2}/>) }
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
    visibleCountries.forEach((country, index) => {
      if (country.target) return;
      if (country.hub) {
        result.push({ from: country, to: byName.get('TÜRKİYE'), backbone: true, index });
      } else {
        const hub = byName.get(REGION_HUB[country.region]);
        if (hub) result.push({ from: country, to: hub, backbone: false, index });
      }
    });
    return result;
  }, [visibleCountries]);

  const hubs = useMemo(() => visibleCountries.filter((c) => c.hub || c.target), [visibleCountries]);
  const labels = useMemo(() => visibleCountries.filter((c) => c.label), [visibleCountries]);

  const onReady = () => {
    const globe = globeRef.current;
    if (!globe) return;

    const material = globe.globeMaterial?.();
    if (material) {
      material.color = new THREE.Color('#07182b');
      material.emissive = new THREE.Color('#020b16');
      material.emissiveIntensity = 0.46;
      material.roughness = 0.68;
      material.metalness = 0.18;
    }

    const scene = globe.scene?.();
    if (scene && !scene.userData.sgdbPremiumLights) {
      const key = new THREE.DirectionalLight('#b8ddff', 1.35);
      key.position.set(-180, 90, 240);
      const rim = new THREE.PointLight('#1a83ff', 8, 600);
      rim.position.set(220, -80, -180);
      const fill = new THREE.HemisphereLight('#6baee8', '#02050a', 0.42);
      scene.add(key, rim, fill);
      scene.userData.sgdbPremiumLights = true;
    }

    const controls = globe.controls?.();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.26;
      controls.enableDamping = true;
      controls.dampingFactor = 0.055;
      controls.minDistance = 165;
      controls.maxDistance = 520;
    }

    globe.pointOfView?.({ lat: 24, lng: 22, altitude: 2.08 }, 0);
  };

  return (
    <main className="space-shell">
      <SpaceBackdrop />
      <div className="globe-halo" />
      <div className="globe-host">
        <Globe
          ref={globeRef}
          width={width}
          height={height}
          onGlobeReady={onReady}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor="#5baeff"
          atmosphereAltitude={0.17}
          showGraticules={false}

          polygonsData={geojson.features}
          polygonCapColor={landColor}
          polygonSideColor={(d) => isTurkeyFeature(d) ? '#5a1426' : '#101c29'}
          polygonStrokeColor={(d) => isTurkeyFeature(d) ? 'rgba(255,129,150,.95)' : 'rgba(154,201,230,.30)'}
          polygonAltitude={(d) => isTurkeyFeature(d) ? 0.018 : 0.008}
          polygonTransitionDuration={350}

          pointsData={visibleCountries}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0.0015}
          pointRadius={(d) => (d.target ? 0.16 : d.hub ? 0.125 : 0.075) * nodeScale}
          pointColor={(d) => d.target ? '#ff4a66' : d.hub ? '#ffd36b' : '#4ff1b3'}
          pointsMerge={false}

          ringsData={hubs}
          ringLat="lat"
          ringLng="lng"
          ringAltitude={0.003}
          ringColor={(d) => (t) => rgba(d.target ? '#ff4967' : '#ffd16a', Math.max(0, 0.68 * (1 - t)))}
          ringMaxRadius={(d) => (d.target ? 2.6 : 1.55) * nodeScale}
          ringPropagationSpeed={(d) => d.target ? 1.05 : 0.72}
          ringRepeatPeriod={(d) => d.target ? 950 : 1450}

          arcsData={arcs}
          arcStartLat={(d) => d.from.lat}
          arcStartLng={(d) => d.from.lng}
          arcEndLat={(d) => d.to.lat}
          arcEndLng={(d) => d.to.lng}
          arcColor={(d) => d.backbone ? ['#8fffe7', '#ffd36b'] : ['#4df2b3', '#5caeff']}
          arcAltitudeAutoScale={(d) => d.backbone ? 0.32 : 0.22}
          arcStroke={(d) => d.backbone ? 0.46 : 0.24}
          arcDashLength={(d) => d.backbone ? 0.28 : 0.15}
          arcDashGap={(d) => d.backbone ? 0.08 : 0.1}
          arcDashInitialGap={(d) => (d.index % Math.max(1, flowDensity)) * 0.055}
          arcDashAnimateTime={(d) => d.backbone ? 1350 : 1850 - flowDensity * 90}

          labelsData={labels}
          labelLat="lat"
          labelLng="lng"
          labelText="name"
          labelAltitude={(d) => d.target ? 0.055 : 0.032}
          labelSize={(d) => (d.target ? 0.66 : d.hub ? 0.50 : 0.42) * labelScale}
          labelDotRadius={(d) => (d.target ? 0.10 : d.hub ? 0.075 : 0.052) * nodeScale}
          labelColor={(d) => d.target ? 'rgba(255,195,205,.95)' : d.hub ? 'rgba(255,225,157,.88)' : 'rgba(204,232,244,.78)'}
          labelResolution={2}
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
