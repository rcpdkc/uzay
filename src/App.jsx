import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const WORLD_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

const COUNTRIES = [
  { name: 'TÜRKİYE', lat: 39.0, lng: 35.0, region: 'MEA', target: true, hub: true, label: true },
  { name: 'ABD', lat: 39.2, lng: -98.5, region: 'AMERİKA', hub: true, label: true },
  { name: 'KANADA', lat: 57.0, lng: -106.0, region: 'AMERİKA', label: true },
  { name: 'MEKSİKA', lat: 23.6, lng: -102.5, region: 'AMERİKA', label: false },
  { name: 'BREZİLYA', lat: -10.8, lng: -52.9, region: 'AMERİKA', label: true },
  { name: 'ARJANTİN', lat: -38.4, lng: -63.6, region: 'AMERİKA', label: false },

  { name: 'ALMANYA', lat: 51.1, lng: 10.4, region: 'AVRUPA', hub: true, label: true },
  { name: 'İNGİLTERE', lat: 54.2, lng: -2.5, region: 'AVRUPA', label: true },
  { name: 'FRANSA', lat: 46.4, lng: 2.2, region: 'AVRUPA', label: true },
  { name: 'İSPANYA', lat: 40.3, lng: -3.7, region: 'AVRUPA', label: false },
  { name: 'İTALYA', lat: 42.8, lng: 12.5, region: 'AVRUPA', label: false },
  { name: 'HOLLANDA', lat: 52.2, lng: 5.3, region: 'AVRUPA', label: false },
  { name: 'İSVEÇ', lat: 62.0, lng: 15.0, region: 'AVRUPA', label: false },
  { name: 'POLONYA', lat: 52.1, lng: 19.4, region: 'AVRUPA', label: false },
  { name: 'RUSYA', lat: 61.5, lng: 90.0, region: 'AVRUPA', label: true },

  { name: 'BAE', lat: 24.3, lng: 54.3, region: 'MEA', hub: true, label: true },
  { name: 'MISIR', lat: 26.8, lng: 30.8, region: 'MEA', label: true },
  { name: 'SUUDİ ARABİSTAN', lat: 23.9, lng: 45.1, region: 'MEA', label: false },
  { name: 'GÜNEY AFRİKA', lat: -30.6, lng: 22.9, region: 'MEA', label: true },
  { name: 'NİJERYA', lat: 9.1, lng: 8.7, region: 'MEA', label: false },
  { name: 'KENYA', lat: 0.1, lng: 37.9, region: 'MEA', label: false },

  { name: 'SİNGAPUR', lat: 1.35, lng: 103.82, region: 'ASYA', hub: true, label: true },
  { name: 'ÇİN', lat: 35.9, lng: 104.2, region: 'ASYA', label: true },
  { name: 'HİNDİSTAN', lat: 22.6, lng: 79.0, region: 'ASYA', label: true },
  { name: 'JAPONYA', lat: 36.2, lng: 138.2, region: 'ASYA', label: true },
  { name: 'GÜNEY KORE', lat: 36.4, lng: 127.9, region: 'ASYA', label: false },
  { name: 'ENDONEZYA', lat: -2.5, lng: 118.0, region: 'ASYA', label: false },
  { name: 'TAYLAND', lat: 15.9, lng: 100.9, region: 'ASYA', label: false },

  { name: 'AVUSTRALYA', lat: -25.3, lng: 133.8, region: 'OKYANUSYA', hub: true, label: true },
  { name: 'YENİ ZELANDA', lat: -41.3, lng: 174.8, region: 'OKYANUSYA', label: false },
];

const FILTERS = [
  { id: 'TÜMÜ', label: 'TÜMÜ' },
  { id: 'AMERİKA', label: 'AMERİKA' },
  { id: 'AVRUPA', label: 'AVRUPA' },
  { id: 'MEA', label: 'ORTADOĞU & AFRİKA' },
  { id: 'ASYA', label: 'ASYA' },
  { id: 'OKYANUSYA', label: 'OKYANUSYA' },
  { id: 'HUBLAR', label: 'HUBLAR' },
];

const HUB_BY_REGION = {
  AMERİKA: 'ABD',
  AVRUPA: 'ALMANYA',
  MEA: 'BAE',
  ASYA: 'SİNGAPUR',
  OKYANUSYA: 'AVUSTRALYA',
};

function isTurkeyFeature(feature) {
  const name = String(feature?.properties?.name || '').toLowerCase();
  return name === 'turkey' || name.includes('türkiye');
}

function hashString(value = '') {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function SpaceBackdrop() {
  return (
    <div className="space-backdrop" aria-hidden="true">
      <div className="starfield starfield-a" />
      <div className="starfield starfield-b" />
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="nebula nebula-c" />

      <svg className="constellation constellation-orion" viewBox="0 0 260 220">
        <g className="const-lines">
          <path d="M54 46 L100 92 L130 105 L160 97 L207 43" />
          <path d="M100 92 L76 177" />
          <path d="M160 97 L190 184" />
        </g>
        {[ [54,46,3.2], [207,43,2.7], [100,92,2.4], [130,105,2.1], [160,97,2.6], [76,177,3.1], [190,184,3.4] ].map(([cx,cy,r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </svg>

      <svg className="constellation constellation-dipper" viewBox="0 0 300 170">
        <g className="const-lines">
          <path d="M42 86 L88 52 L138 68 L142 116 L91 126 L42 86" />
          <path d="M138 68 L206 48 L264 37" />
        </g>
        {[ [42,86,2.5], [88,52,3.2], [138,68,2.5], [142,116,2.2], [91,126,2.9], [206,48,2.6], [264,37,3.1] ].map(([cx,cy,r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </svg>

      <svg className="constellation constellation-cassiopeia" viewBox="0 0 270 130">
        <path className="const-lines" d="M24 43 L76 89 L134 31 L194 83 L246 40" />
        {[ [24,43,2.4], [76,89,3.1], [134,31,2.8], [194,83,2.5], [246,40,3.0] ].map(([cx,cy,r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </svg>

      <span className="shooting-star shooting-star-a" />
      <span className="shooting-star shooting-star-b" />
      <span className="shooting-star shooting-star-c" />
    </div>
  );
}

function FilterPanel({
  open,
  setOpen,
  activeFilter,
  setActiveFilter,
  labelScale,
  setLabelScale,
  nodeScale,
  setNodeScale,
  flowDensity,
  setFlowDensity,
}) {
  return (
    <div className="filter-wrap">
      <button className={`filter-button ${open ? 'active' : ''}`} onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        <span>FİLTRE</span>
      </button>

      {open && (
        <div className="filter-panel">
          <div className="filter-title">BÖLGE</div>
          <div className="region-grid">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                className={activeFilter === item.id ? 'selected' : ''}
                onClick={() => setActiveFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="control-row">
            <div className="control-head"><span>ÜLKE İSİMLERİ</span><b>{Math.round(labelScale * 100)}%</b></div>
            <input type="range" min="0.55" max="1.6" step="0.05" value={labelScale} onChange={(e) => setLabelScale(Number(e.target.value))} />
          </div>

          <div className="control-row">
            <div className="control-head"><span>NODE BOYUTU</span><b>{Math.round(nodeScale * 100)}%</b></div>
            <input type="range" min="0.6" max="1.6" step="0.05" value={nodeScale} onChange={(e) => setNodeScale(Number(e.target.value))} />
          </div>

          <div className="control-row">
            <div className="control-head"><span>AKIŞ YOĞUNLUĞU</span><b>{flowDensity}</b></div>
            <input type="range" min="1" max="5" step="1" value={flowDensity} onChange={(e) => setFlowDensity(Number(e.target.value))} />
          </div>

          <div className="legend-row">
            <span><i className="legend-dot normal" />NODE</span>
            <span><i className="legend-dot hub" />HUB</span>
            <span><i className="legend-dot core" />TÜRKİYE</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const hostRef = useRef(null);
  const globeRef = useRef(null);
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [geojson, setGeojson] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('TÜMÜ');
  const [labelScale, setLabelScale] = useState(1);
  const [nodeScale, setNodeScale] = useState(1);
  const [flowDensity, setFlowDensity] = useState(3);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.max(1, Math.floor(width)), height: Math.max(1, Math.floor(height)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    fetch(WORLD_URL)
      .then((r) => r.json())
      .then((data) => { if (active) setGeojson(data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const oceanMaterial = useMemo(() => new THREE.MeshPhongMaterial({
    color: '#082331',
    emissive: '#03121a',
    emissiveIntensity: 0.38,
    shininess: 26,
    specular: new THREE.Color('#2b7389'),
  }), []);

  useEffect(() => () => oceanMaterial.dispose(), [oceanMaterial]);

  const visibleCountries = useMemo(() => {
    if (activeFilter === 'TÜMÜ') return COUNTRIES;
    if (activeFilter === 'HUBLAR') return COUNTRIES.filter((c) => c.hub || c.target);
    return COUNTRIES.filter((c) => c.region === activeFilter || c.target);
  }, [activeFilter]);

  const arcs = useMemo(() => {
    const result = [];
    let idx = 0;

    if (activeFilter !== 'HUBLAR') {
      visibleCountries.forEach((country) => {
        if (country.target || country.hub) return;
        const hubName = HUB_BY_REGION[country.region];
        const hub = COUNTRIES.find((c) => c.name === hubName);
        if (!hub) return;
        result.push({
          id: `${country.name}-${hub.name}`,
          startLat: country.lat,
          startLng: country.lng,
          endLat: hub.lat,
          endLng: hub.lng,
          kind: 'edge',
          idx: idx++,
        });
      });
    }

    const visibleHubNames = new Set(visibleCountries.filter((c) => c.hub && !c.target).map((c) => c.name));
    COUNTRIES.filter((c) => c.hub && !c.target && visibleHubNames.has(c.name)).forEach((hub) => {
      const turkey = COUNTRIES[0];
      result.push({
        id: `${hub.name}-TÜRKİYE`,
        startLat: hub.lat,
        startLng: hub.lng,
        endLat: turkey.lat,
        endLng: turkey.lng,
        kind: 'backbone',
        idx: idx++,
      });
    });

    return result;
  }, [visibleCountries, activeFilter]);

  const rings = useMemo(
    () => visibleCountries.filter((c) => c.hub || c.target),
    [visibleCountries],
  );

  const labels = useMemo(
    () => visibleCountries.filter((c) => c.label || c.hub || c.target),
    [visibleCountries],
  );

  const polygons = geojson?.features || [];
  const landPalette = ['#19393a', '#1b3f3e', '#173536', '#204443'];

  const onGlobeReady = () => {
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.32;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;

    const ambient = new THREE.AmbientLight('#7fc7df', 1.1);
    const key = new THREE.DirectionalLight('#d6f4ff', 2.4);
    key.position.set(180, 110, 220);
    const rim = new THREE.DirectionalLight('#2d86b0', 1.0);
    rim.position.set(-180, -50, -160);
    globe.lights([ambient, key, rim]);

    globe.pointOfView({ lat: 22, lng: 28, altitude: 2.0 }, 900);
  };

  return (
    <main className="space-shell">
      <SpaceBackdrop />

      <div className="globe-host" ref={hostRef}>
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeOffset={[0, 0]}
          animateIn
          globeMaterial={oceanMaterial}
          showAtmosphere
          atmosphereColor="#49c9ef"
          atmosphereAltitude={0.11}
          showGraticules={false}
          polygonsData={polygons}
          polygonAltitude={(feature) => (isTurkeyFeature(feature) ? 0.012 : 0.005)}
          polygonCapColor={(feature) => {
            if (isTurkeyFeature(feature)) return '#8d2942';
            const name = String(feature?.properties?.name || '');
            return landPalette[hashString(name) % landPalette.length];
          }}
          polygonSideColor={() => '#071419'}
          polygonStrokeColor={(feature) => (isTurkeyFeature(feature) ? '#ff6f86' : '#4c8785')}
          polygonLabel={(feature) => feature?.properties?.name || ''}
          polygonsTransitionDuration={0}
          pointsData={visibleCountries}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={() => 0.001}
          pointRadius={(d) => {
            const base = d.target ? 0.16 : d.hub ? 0.12 : 0.065;
            return base * nodeScale;
          }}
          pointResolution={20}
          pointColor={(d) => (d.target ? '#ff4965' : d.hub ? '#e7b65f' : '#32f0a4')}
          pointLabel={(d) => d.name}
          pointsTransitionDuration={250}
          ringsData={rings}
          ringLat="lat"
          ringLng="lng"
          ringAltitude={() => 0.002}
          ringColor={(d) => (d.target ? '#ff4965' : '#e7b65f')}
          ringMaxRadius={(d) => (d.target ? 2.6 : 1.65)}
          ringPropagationSpeed={(d) => (d.target ? 1.0 : 0.72)}
          ringRepeatPeriod={(d) => (d.target ? 1250 : 1850)}
          arcsData={arcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor={(d) => (d.kind === 'backbone' ? ['#f2bf68', '#54f3cc'] : ['#2df0ad', '#2b6c76'])}
          arcAltitude={(d) => (d.kind === 'backbone' ? 0.24 : 0.13)}
          arcStroke={(d) => (d.kind === 'backbone' ? 0.62 : 0.28)}
          arcDashLength={() => 0.075 + flowDensity * 0.025}
          arcDashGap={() => Math.max(0.035, 0.14 - flowDensity * 0.015)}
          arcDashInitialGap={(d) => d.idx * 0.07}
          arcDashAnimateTime={(d) => (d.kind === 'backbone' ? 1600 : Math.max(1050, 2600 - flowDensity * 260))}
          arcsTransitionDuration={300}
          labelsData={labels}
          labelLat="lat"
          labelLng="lng"
          labelText="name"
          labelAltitude={(d) => (d.target ? 0.028 : d.hub ? 0.021 : 0.016)}
          labelColor={(d) => (d.target ? '#ff8292' : d.hub ? '#f1c978' : '#c8f8eb')}
          labelSize={(d) => {
            const base = d.target ? 0.72 : d.hub ? 0.52 : 0.36;
            return base * labelScale;
          }}
          labelResolution={3}
          labelIncludeDot={false}
          labelsTransitionDuration={250}
          onGlobeReady={onGlobeReady}
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
