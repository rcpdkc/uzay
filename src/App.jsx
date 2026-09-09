import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

const WORLD_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
const EARTH_IMG = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
const EARTH_BUMP = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
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

function isTurkeyFeature(feature) {
  const name = String(feature?.properties?.name || feature?.properties?.ADMIN || '').toLowerCase();
  return name === 'turkey' || name === 'türkiye' || name.includes('turkey');
}

function buildArcs(countries) {
  const visibleNames = new Set(countries.map((c) => c.name));
  const arcs = [];

  Object.entries(REGION_HUB).forEach(([region, hubName]) => {
    const hub = COUNTRIES.find((c) => c.name === hubName);
    if (!hub) return;

    const regionMembers = countries.filter((c) => c.region === region && !c.target && c.name !== hubName);
    regionMembers.forEach((country) => {
      arcs.push({
        startLat: country.lat,
        startLng: country.lng,
        endLat: hub.lat,
        endLng: hub.lng,
        type: 'edge',
      });
    });

    if (visibleNames.has(hubName) || regionMembers.length) {
      const turkey = COUNTRIES[0];
      arcs.push({
        startLat: hub.lat,
        startLng: hub.lng,
        endLat: turkey.lat,
        endLng: turkey.lng,
        type: 'backbone',
      });
    }
  });

  return arcs;
}

function Constellations() {
  return (
    <div className="constellation-layer" aria-hidden="true">
      <svg className="constellation constellation-orion" viewBox="0 0 220 260">
        <g className="const-lines">
          <path d="M51 31 L84 100 L105 128 L128 102 L171 34" />
          <path d="M84 100 L54 218" />
          <path d="M128 102 L171 220" />
        </g>
        {[['51','31',3.4],['171','34',3],['84','100',2.4],['105','128',2.8],['128','102',2.4],['54','218',3.2],['171','220',3.5]].map(([cx,cy,r],i)=><circle key={i} cx={cx} cy={cy} r={r}/>) }
      </svg>

      <svg className="constellation constellation-dipper" viewBox="0 0 300 180">
        <g className="const-lines"><path d="M24 85 L76 52 L127 78 L122 123 L69 128 L24 85 L183 54 L259 39" /></g>
        {[['24','85',3],['76','52',2.6],['127','78',2.4],['122','123',2.5],['69','128',2.5],['183','54',2.7],['259','39',3.1]].map(([cx,cy,r],i)=><circle key={i} cx={cx} cy={cy} r={r}/>) }
      </svg>

      <svg className="constellation constellation-cassiopeia" viewBox="0 0 260 130">
        <g className="const-lines"><path d="M14 39 L66 91 L121 27 L180 81 L242 25" /></g>
        {[['14','39',2.7],['66','91',3],['121','27',2.8],['180','81',2.6],['242','25',3.2]].map(([cx,cy,r],i)=><circle key={i} cx={cx} cy={cy} r={r}/>) }
      </svg>
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
        <span className="filter-glyph">◈</span>
        <span>FİLTRE</span>
      </button>

      {open && (
        <div className="filter-panel">
          <div className="filter-title">BÖLGE</div>
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
            <input type="range" min="0.6" max="1.7" step="0.05" value={nodeScale} onChange={(e) => setNodeScale(Number(e.target.value))} />
          </div>

          <div className="control-row">
            <div className="control-label"><span>AKIŞ YOĞUNLUĞU</span><b>{flowDensity}</b></div>
            <input type="range" min="1" max="5" step="1" value={flowDensity} onChange={(e) => setFlowDensity(Number(e.target.value))} />
          </div>

          <div className="legend-row">
            <span><i className="legend-dot normal" /> NODE</span>
            <span><i className="legend-dot hub" /> HUB</span>
            <span><i className="legend-dot turkey" /> TÜRKİYE</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const globeRef = useRef();
  const [world, setWorld] = useState([]);
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('TÜMÜ');
  const [labelScale, setLabelScale] = useState(1);
  const [nodeScale, setNodeScale] = useState(1);
  const [flowDensity, setFlowDensity] = useState(3);

  useEffect(() => {
    fetch(WORLD_URL)
      .then((r) => r.json())
      .then((geojson) => setWorld(geojson.features || []))
      .catch(() => setWorld([]));
  }, []);

  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.22;
    controls.enableDamping = true;
    controls.dampingFactor = 0.035;
    controls.minDistance = 145;
    controls.maxDistance = 500;
  }, [size.width, size.height]);

  const visibleCountries = useMemo(() => {
    if (activeFilter === 'TÜMÜ') return COUNTRIES;
    if (activeFilter === 'HUBLAR') return COUNTRIES.filter((c) => c.hub || c.target);
    return COUNTRIES.filter((c) => c.region === activeFilter || c.target);
  }, [activeFilter]);

  const labels = useMemo(() => visibleCountries.filter((c) => c.label), [visibleCountries]);
  const arcs = useMemo(() => {
    const base = buildArcs(visibleCountries);
    if (flowDensity <= 1) return base.filter((_, i) => i % 3 === 0);
    if (flowDensity === 2) return base.filter((_, i) => i % 2 === 0 || i < 5);
    return base;
  }, [visibleCountries, flowDensity]);

  const rings = useMemo(() => visibleCountries.filter((c) => c.hub || c.target), [visibleCountries]);

  return (
    <main className="space-shell">
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="nebula nebula-c" />
      <Constellations />
      <div className="shooting-star shooting-star-a" />
      <div className="shooting-star shooting-star-b" />
      <div className="shooting-star shooting-star-c" />

      <div className="globe-host">
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          backgroundImageUrl={SPACE_IMG}
          globeImageUrl={EARTH_IMG}
          bumpImageUrl={EARTH_BUMP}
          showAtmosphere
          atmosphereColor="#6eb7ff"
          atmosphereAltitude={0.14}
          polygonsData={world}
          polygonAltitude={(d) => (isTurkeyFeature(d) ? 0.008 : 0.0015)}
          polygonCapColor={(d) => (isTurkeyFeature(d) ? 'rgba(205, 18, 45, 0.62)' : 'rgba(0,0,0,0)')}
          polygonSideColor={(d) => (isTurkeyFeature(d) ? 'rgba(120, 8, 28, 0.28)' : 'rgba(0,0,0,0)')}
          polygonStrokeColor={(d) => (isTurkeyFeature(d) ? 'rgba(255,126,142,0.95)' : 'rgba(211,232,255,0.18)')}
          polygonsTransitionDuration={0}
          lineHoverPrecision={0}

          pointsData={visibleCountries}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={(d) => (d.target ? 0.014 : d.hub ? 0.011 : 0.006)}
          pointRadius={(d) => (d.target ? 0.26 : d.hub ? 0.20 : 0.095) * nodeScale}
          pointColor={(d) => (d.target ? '#ff3858' : d.hub ? '#ffd76a' : '#3dff9d')}
          pointsMerge

          ringsData={rings}
          ringLat="lat"
          ringLng="lng"
          ringAltitude={0.012}
          ringColor={(d) => () => (d.target ? 'rgba(255,56,88,0.85)' : 'rgba(255,215,106,0.75)')}
          ringMaxRadius={(d) => (d.target ? 3.2 : 2.1) * nodeScale}
          ringPropagationSpeed={(d) => (d.target ? 2.1 : 1.4)}
          ringRepeatPeriod={(d) => (d.target ? 1050 : 1750)}

          arcsData={arcs}
          arcColor={(d) => (d.type === 'backbone' ? ['#ffd76a', '#ff3858'] : ['#35ff9c', '#77f6ff'])}
          arcAltitudeAutoScale={(d) => (d.type === 'backbone' ? 0.34 : 0.22)}
          arcStroke={(d) => (d.type === 'backbone' ? 0.34 : 0.18)}
          arcDashLength={(d) => (d.type === 'backbone' ? 0.36 : 0.22)}
          arcDashGap={(d) => (d.type === 'backbone' ? 0.18 : 0.14)}
          arcDashInitialGap={() => Math.random()}
          arcDashAnimateTime={(d) => (d.type === 'backbone' ? 1150 : Math.max(1450, 2550 - flowDensity * 180))}

          labelsData={labels}
          labelLat="lat"
          labelLng="lng"
          labelText="name"
          labelColor={(d) => (d.target ? '#ff9aab' : d.hub ? '#ffe7a2' : '#d8fff1')}
          labelSize={(d) => (d.target ? 0.72 : d.hub ? 0.58 : 0.48) * labelScale}
          labelDotRadius={(d) => (d.target ? 0.16 : 0.08) * nodeScale}
          labelAltitude={(d) => (d.target ? 0.027 : 0.018)}
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
