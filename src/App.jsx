import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const WORLD_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
const EARTH_NIGHT = 'https://unpkg.com/three-globe/example/img/earth-night.jpg';
const EARTH_BUMP = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
const SPACE_IMG = 'https://unpkg.com/three-globe/example/img/night-sky.png';

const TURKEY = { name: 'TÜRKİYE', lat: 39.0, lng: 35.0, region: 'MEA', target: true, hub: true, label: true };

const NODES = [
  TURKEY,
  { name: 'ABD', lat: 40.71, lng: -74.0, region: 'AMERİKA', hub: true, label: true },
  { name: 'ABD', lat: 34.05, lng: -118.24, region: 'AMERİKA' },
  { name: 'ABD', lat: 37.77, lng: -122.42, region: 'AMERİKA' },
  { name: 'ABD', lat: 41.88, lng: -87.63, region: 'AMERİKA' },
  { name: 'ABD', lat: 29.76, lng: -95.37, region: 'AMERİKA' },
  { name: 'KANADA', lat: 43.65, lng: -79.38, region: 'AMERİKA', label: true },
  { name: 'KANADA', lat: 49.28, lng: -123.12, region: 'AMERİKA' },
  { name: 'MEKSİKA', lat: 19.43, lng: -99.13, region: 'AMERİKA' },
  { name: 'BREZİLYA', lat: -23.55, lng: -46.63, region: 'AMERİKA', label: true },
  { name: 'BREZİLYA', lat: -22.91, lng: -43.17, region: 'AMERİKA' },
  { name: 'ARJANTİN', lat: -34.60, lng: -58.38, region: 'AMERİKA' },
  { name: 'ŞİLİ', lat: -33.45, lng: -70.67, region: 'AMERİKA' },
  { name: 'PERU', lat: -12.05, lng: -77.04, region: 'AMERİKA' },

  { name: 'ALMANYA', lat: 50.11, lng: 8.68, region: 'AVRUPA', hub: true, label: true },
  { name: 'ALMANYA', lat: 52.52, lng: 13.40, region: 'AVRUPA' },
  { name: 'İNGİLTERE', lat: 51.51, lng: -0.13, region: 'AVRUPA', label: true },
  { name: 'FRANSA', lat: 48.86, lng: 2.35, region: 'AVRUPA', label: true },
  { name: 'HOLLANDA', lat: 52.37, lng: 4.90, region: 'AVRUPA' },
  { name: 'BELÇİKA', lat: 50.85, lng: 4.35, region: 'AVRUPA' },
  { name: 'İSPANYA', lat: 40.42, lng: -3.70, region: 'AVRUPA' },
  { name: 'İTALYA', lat: 41.90, lng: 12.50, region: 'AVRUPA' },
  { name: 'İSVİÇRE', lat: 47.38, lng: 8.54, region: 'AVRUPA' },
  { name: 'POLONYA', lat: 52.23, lng: 21.01, region: 'AVRUPA' },
  { name: 'İSVEÇ', lat: 59.33, lng: 18.07, region: 'AVRUPA' },
  { name: 'NORVEÇ', lat: 59.91, lng: 10.75, region: 'AVRUPA' },
  { name: 'RUSYA', lat: 55.76, lng: 37.62, region: 'AVRUPA', label: true },

  { name: 'BAE', lat: 25.20, lng: 55.27, region: 'MEA', hub: true, label: true },
  { name: 'MISIR', lat: 30.04, lng: 31.24, region: 'MEA', label: true },
  { name: 'SUUDİ ARABİSTAN', lat: 24.71, lng: 46.68, region: 'MEA' },
  { name: 'İSRAİL', lat: 32.09, lng: 34.78, region: 'MEA' },
  { name: 'KATAR', lat: 25.29, lng: 51.53, region: 'MEA' },
  { name: 'NİJERYA', lat: 6.52, lng: 3.38, region: 'MEA' },
  { name: 'KENYA', lat: -1.29, lng: 36.82, region: 'MEA' },
  { name: 'ETİYOPYA', lat: 9.03, lng: 38.74, region: 'MEA' },
  { name: 'GÜNEY AFRİKA', lat: -26.20, lng: 28.05, region: 'MEA', label: true },
  { name: 'GÜNEY AFRİKA', lat: -33.92, lng: 18.42, region: 'MEA' },

  { name: 'SİNGAPUR', lat: 1.35, lng: 103.82, region: 'ASYA', hub: true, label: true },
  { name: 'ÇİN', lat: 39.90, lng: 116.40, region: 'ASYA', label: true },
  { name: 'ÇİN', lat: 31.23, lng: 121.47, region: 'ASYA' },
  { name: 'ÇİN', lat: 22.54, lng: 114.06, region: 'ASYA' },
  { name: 'HONG KONG', lat: 22.32, lng: 114.17, region: 'ASYA' },
  { name: 'JAPONYA', lat: 35.68, lng: 139.69, region: 'ASYA', label: true },
  { name: 'GÜNEY KORE', lat: 37.57, lng: 126.98, region: 'ASYA' },
  { name: 'HİNDİSTAN', lat: 28.61, lng: 77.21, region: 'ASYA', label: true },
  { name: 'HİNDİSTAN', lat: 19.08, lng: 72.88, region: 'ASYA' },
  { name: 'HİNDİSTAN', lat: 12.97, lng: 77.59, region: 'ASYA' },
  { name: 'TAYLAND', lat: 13.76, lng: 100.50, region: 'ASYA' },
  { name: 'VİETNAM', lat: 21.03, lng: 105.85, region: 'ASYA' },
  { name: 'ENDONEZYA', lat: -6.21, lng: 106.85, region: 'ASYA' },
  { name: 'MALEZYA', lat: 3.14, lng: 101.69, region: 'ASYA' },
  { name: 'FİLİPİNLER', lat: 14.60, lng: 120.98, region: 'ASYA' },

  { name: 'AVUSTRALYA', lat: -33.87, lng: 151.21, region: 'OKYANUSYA', hub: true, label: true },
  { name: 'AVUSTRALYA', lat: -37.81, lng: 144.96, region: 'OKYANUSYA' },
  { name: 'AVUSTRALYA', lat: -27.47, lng: 153.03, region: 'OKYANUSYA' },
  { name: 'YENİ ZELANDA', lat: -36.85, lng: 174.76, region: 'OKYANUSYA' },
];

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

function isAntarcticaFeature(feature) {
  const name = normalizeName(feature?.properties?.name || feature?.properties?.ADMIN || '');
  return name.includes('antarctica') || name.includes('antarktika');
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
      <button
        className={`filter-button icon-only ${open ? 'active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Filtreleri aç veya kapat"
      >
        <span className="filter-icon-glyph" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 6h14M8 12h8M10.5 18h3" />
            <circle cx="8" cy="6" r="1.7" />
            <circle cx="15.5" cy="12" r="1.7" />
            <circle cx="12.5" cy="18" r="1.7" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="filter-panel">
          <div className="filter-title-row"><span>GÖRÜNÜM</span><i /></div>
          <div className="region-grid">
            {FILTERS.map((filter) => (
              <button key={filter} className={activeFilter === filter ? 'selected' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>
            ))}
          </div>
          <div className="control-row">
            <div className="control-label"><span>Ülke isim boyutu</span><b>{Math.round(labelScale * 100)}%</b></div>
            <input type="range" min="0.55" max="1.6" step="0.05" value={labelScale} onChange={(e) => setLabelScale(Number(e.target.value))} />
          </div>
          <div className="control-row">
            <div className="control-label"><span>Node boyutu</span><b>{Math.round(nodeScale * 100)}%</b></div>
            <input type="range" min="0.65" max="1.65" step="0.05" value={nodeScale} onChange={(e) => setNodeScale(Number(e.target.value))} />
          </div>
          <div className="control-row">
            <div className="control-label"><span>Veri akış yoğunluğu</span><b>{flowDensity * 20}%</b></div>
            <input type="range" min="1" max="5" step="1" value={flowDensity} onChange={(e) => setFlowDensity(Number(e.target.value))} />
          </div>
          <div className="legend-row">
            <span><i className="legend-node normal" /> NODE</span>
            <span><i className="legend-node hub" /> HUB</span>
            <span><i className="legend-node turkey" /> TÜRKİYE</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SpaceBackdrop() {
  return (
    <div className="space-backdrop">
      <div className="milky-way milky-way-a" />
      <div className="milky-way milky-way-b" />
      <div className="starfield starfield-a" />
      <div className="starfield starfield-b" />
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="nebula nebula-c" />

      <svg className="constellation constellation-ursa" viewBox="0 0 290 180" aria-hidden="true">
        <path className="const-lines" d="M28 91 L69 54 L118 71 L115 116 L62 123 L28 91 M118 71 L178 47 L243 32" />
        {[[28,91],[69,54],[118,71],[115,116],[62,123],[178,47],[243,32]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i===2?3.2:2}/>) }
      </svg>
      <span className="const-name const-name-ursa">URSA MAJOR</span>

      <svg className="constellation constellation-orion" viewBox="0 0 220 220" aria-hidden="true">
        <path className="const-lines" d="M44 28 L80 90 L110 102 L139 94 L178 31 M80 90 L60 180 M139 94 L166 182" />
        {[[44,28],[178,31],[80,90],[110,102],[139,94],[60,180],[166,182]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i===0||i===1?3:2}/>) }
      </svg>
      <span className="const-name const-name-orion">ORION</span>

      <svg className="constellation constellation-scorpius" viewBox="0 0 240 180" aria-hidden="true">
        <path className="const-lines" d="M25 34 C65 20, 92 43, 104 70 C116 96, 144 99, 158 119 C170 138, 184 151, 218 151" />
        {[[25,34],[62,30],[96,61],[112,88],[143,101],[165,128],[195,148],[218,151]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i===4?3:2}/>) }
      </svg>
      <span className="const-name const-name-scorpius">SCORPIUS</span>

      <svg className="constellation constellation-sagittarius" viewBox="0 0 250 170" aria-hidden="true">
        <path className="const-lines" d="M30 86 L73 54 L117 72 L151 42 L183 79 L219 61 M117 72 L130 117 L177 128 L183 79" />
        {[[30,86],[73,54],[117,72],[151,42],[183,79],[219,61],[130,117],[177,128]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i===2?3:2}/>) }
      </svg>
      <span className="const-name const-name-sagittarius">SAGITTARIUS</span>

      <div className="shooting-star shooting-star-a" />
      <div className="shooting-star shooting-star-b" />
      <div className="shooting-star shooting-star-c" />
      <div className="planet planet-left" />
      <div className="planet planet-right" />
    </div>
  );
}

function createHtmlLabel(label) {
  const el = document.createElement('div');
  el.textContent = label.name;
  el.style.pointerEvents = 'none';
  el.style.whiteSpace = 'nowrap';
  el.style.userSelect = 'none';
  el.style.fontFamily = 'Inter, "Segoe UI", Arial, sans-serif';
  el.style.fontWeight = label.target ? '800' : label.hub ? '700' : '600';
  el.style.fontSize = `${(label.target ? 14 : label.hub ? 11 : 9.5) * label.scale}px`;
  el.style.letterSpacing = label.target ? '.02em' : '.025em';
  el.style.color = label.target ? '#fff2f4' : label.hub ? '#fff0c8' : '#dceffc';
  el.style.textShadow = label.target
    ? '0 0 5px #ff3659, 0 0 14px rgba(255,54,89,.65)'
    : label.hub
      ? '0 0 8px rgba(255,200,90,.7)'
      : '0 0 7px rgba(75,170,255,.55)';
  el.style.transform = 'translate(-50%, -115%)';
  el.style.transition = 'opacity .12s linear';
  return el;
}

function setHtmlLabelVisibility(el, isVisible) {
  el.style.opacity = isVisible ? '1' : '0';
}

function toUnit(lat, lng) {
  const phi = THREE.MathUtils.degToRad(lat);
  const lambda = THREE.MathUtils.degToRad(lng);
  return new THREE.Vector3(
    Math.cos(phi) * Math.cos(lambda),
    Math.sin(phi),
    Math.cos(phi) * Math.sin(lambda),
  );
}

function fromUnit(vector) {
  const v = vector.clone().normalize();
  return {
    lat: THREE.MathUtils.radToDeg(Math.asin(THREE.MathUtils.clamp(v.y, -1, 1))),
    lng: THREE.MathUtils.radToDeg(Math.atan2(v.z, v.x)),
  };
}

function buildRoutePath(arc) {
  const start = toUnit(arc.from.lat, arc.from.lng);
  const end = toUnit(arc.to.lat, arc.to.lng);
  const dot = THREE.MathUtils.clamp(start.dot(end), -1, 1);
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega);
  const maxAlt = arc.hub ? 0.36 : 0.28;
  const points = [];

  for (let i = 0; i <= 96; i += 1) {
    const t = i / 96;
    let vector;
    if (Math.abs(sinOmega) < 1e-6) {
      vector = start.clone().lerp(end, t).normalize();
    } else {
      const a = Math.sin((1 - t) * omega) / sinOmega;
      const b = Math.sin(t * omega) / sinOmega;
      vector = start.clone().multiplyScalar(a).add(end.clone().multiplyScalar(b)).normalize();
    }
    const pos = fromUnit(vector);
    points.push({ ...pos, alt: Math.sin(Math.PI * t) * maxAlt });
  }
  return points;
}


function projectFlat(lat, lng) {
  const lambda = THREE.MathUtils.degToRad(lng);
  const phi = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(lat, -89.5, 89.5));
  const phi2 = phi * phi;
  const phi4 = phi2 * phi2;

  const xRaw = lambda * (
    0.8707
    - 0.131979 * phi2
    + phi4 * (-0.013791 + phi4 * (0.003971 * phi2 - 0.001529 * phi4))
  );

  const yRaw = phi * (
    1.007226
    + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 0.005916 * phi4))
  );

  const scale = 162;
  return {
    x: 500 + xRaw * scale,
    y: 280 - yRaw * scale,
  };
}

function ringToPath(ring = []) {
  if (!ring.length) return '';
  let d = '';
  let lastX = null;
  ring.forEach((coord, index) => {
    const [lng, lat] = coord;
    const { x, y } = projectFlat(lat, lng);
    const jump = lastX !== null && Math.abs(x - lastX) > 430;
    d += `${index === 0 || jump ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
    lastX = x;
  });
  return d + 'Z';
}

function featureToPath(feature) {
  const geometry = feature?.geometry;
  if (!geometry) return '';
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map(ringToPath).join(' ');
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flatMap((polygon) => polygon.map(ringToPath)).join(' ');
  }
  return '';
}

function projectedPath(points) {
  return points.map(([lat, lng], index) => {
    const p = projectFlat(lat, lng);
    return `${index === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }).join(' ');
}

function buildFlatGraticule() {
  const lines = [];

  [-60, -30, 0, 30, 60].forEach((lat) => {
    const points = [];
    for (let lng = -180; lng <= 180; lng += 5) points.push([lat, lng]);
    lines.push(projectedPath(points));
  });

  [-120, -60, 0, 60, 120].forEach((lng) => {
    const points = [];
    for (let lat = -85; lat <= 85; lat += 5) points.push([lat, lng]);
    lines.push(projectedPath(points));
  });

  return lines;
}

function buildFlatRoutePath(arc) {
  const start = toUnit(arc.from.lat, arc.from.lng);
  const end = toUnit(arc.to.lat, arc.to.lng);
  const dot = THREE.MathUtils.clamp(start.dot(end), -1, 1);
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega);

  let path = '';
  let lastX = null;

  for (let i = 0; i <= 72; i += 1) {
    const t = i / 72;
    let vector;

    if (Math.abs(sinOmega) < 1e-6) {
      vector = start.clone().lerp(end, t).normalize();
    } else {
      const a = Math.sin((1 - t) * omega) / sinOmega;
      const b = Math.sin(t * omega) / sinOmega;
      vector = start.clone().multiplyScalar(a).add(end.clone().multiplyScalar(b)).normalize();
    }

    const geo = fromUnit(vector);
    const point = projectFlat(geo.lat, geo.lng);
    const jump = lastX !== null && Math.abs(point.x - lastX) > 430;

    path += `${i === 0 || jump ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)} `;
    lastX = point.x;
  }

  return path.trim();
}

function FlatMap({ geojson, nodes, arcs, labelScale, nodeScale }) {
  const svgRef = useRef();
  const worldRef = useRef();
  const dragRef = useRef(null);
  const viewportRef = useRef({ scale: 1, x: 0, y: 0 });
  const rafRef = useRef(null);

  const graticule = useMemo(() => buildFlatGraticule(), []);
  const flatRoutes = useMemo(
    () => arcs.map((arc) => ({ ...arc, d: buildFlatRoutePath(arc) })),
    [arcs]
  );

  const countries = useMemo(
    () => geojson.features.filter((feature) => !isAntarcticaFeature(feature)),
    [geojson]
  );

  const labels = useMemo(() => {
    const unique = new Map();
    nodes.filter((node) => node.label).forEach((node) => {
      if (!unique.has(node.name)) unique.set(node.name, node);
    });
    return [...unique.values()];
  }, [nodes]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const applyViewport = () => {
    const world = worldRef.current;
    if (!world) return;
    const { scale, x, y } = viewportRef.current;
    world.setAttribute('transform', `translate(${x} ${y}) scale(${scale})`);
  };

  const scheduleViewport = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applyViewport();
    });
  };

  const clampViewport = (next) => {
    const scale = THREE.MathUtils.clamp(next.scale, 1, 4.2);
    const maxX = 475 * (scale - 1);
    const maxY = 265 * (scale - 1);

    return {
      scale,
      x: THREE.MathUtils.clamp(next.x, -maxX, maxX),
      y: THREE.MathUtils.clamp(next.y, -maxY, maxY),
    };
  };

  const handleWheel = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const current = viewportRef.current;
    const pointerX = ((event.clientX - rect.left) / rect.width) * 1000;
    const pointerY = ((event.clientY - rect.top) / rect.height) * 560;
    const factor = event.deltaY < 0 ? 1.10 : 0.91;
    const nextScale = THREE.MathUtils.clamp(current.scale * factor, 1, 4.2);

    if (Math.abs(nextScale - current.scale) < 0.001) return;

    const ratio = nextScale / current.scale;
    viewportRef.current = clampViewport({
      scale: nextScale,
      x: pointerX - (pointerX - current.x) * ratio,
      y: pointerY - (pointerY - current.y) * ratio,
    });

    scheduleViewport();
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const current = viewportRef.current;
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: current.x,
      y: current.y,
    };
    svgRef.current?.classList.add('dragging');
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dx = (event.clientX - drag.clientX) * (1000 / rect.width);
    const dy = (event.clientY - drag.clientY) * (560 / rect.height);
    const current = viewportRef.current;

    viewportRef.current = clampViewport({
      scale: current.scale,
      x: drag.x + dx,
      y: drag.y + dy,
    });

    scheduleViewport();
  };

  const stopDragging = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    event.currentTarget.releasePointerCapture?.(drag.pointerId);
    dragRef.current = null;
    svgRef.current?.classList.remove('dragging');
  };

  const resetViewport = () => {
    viewportRef.current = { scale: 1, x: 0, y: 0 };
    scheduleViewport();
  };

  return (
    <div className="flat-map-layer" aria-hidden="true">
      <div className="flat-map-frame">
        <div className="flat-map-ambient flat-map-ambient-a" />
        <div className="flat-map-ambient flat-map-ambient-b" />

        <svg
          ref={svgRef}
          className="flat-map-svg"
          viewBox="0 0 1000 560"
          preserveAspectRatio="xMidYMid meet"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onDoubleClick={resetViewport}
        >
          <defs>
            <radialGradient id="flatOcean" cx="50%" cy="45%" r="70%">
              <stop offset="0%" stopColor="#0a2038" />
              <stop offset="48%" stopColor="#051526" />
              <stop offset="100%" stopColor="#010610" />
            </radialGradient>

            <linearGradient id="flatLand" x1="0" x2="0.85" y1="0" y2="1">
              <stop offset="0%" stopColor="#42627f" />
              <stop offset="42%" stopColor="#29465f" />
              <stop offset="100%" stopColor="#172f45" />
            </linearGradient>

            <linearGradient id="flatTurkey" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#ff4b69" />
              <stop offset="52%" stopColor="#c42843" />
              <stop offset="100%" stopColor="#741226" />
            </linearGradient>

            <filter id="flatNodeGlow" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="2.1" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width="1000" height="560" fill="url(#flatOcean)" />

          <g ref={worldRef} className="flat-map-world">
            <g className="flat-graticule">
              {graticule.map((d, index) => <path key={index} d={d} />)}
            </g>

            <g className="flat-countries">
              {countries.map((feature, index) => (
                <path
                  key={feature.id || feature.properties?.name || index}
                  d={featureToPath(feature)}
                  className={isTurkeyFeature(feature) ? 'flat-country turkey' : 'flat-country'}
                />
              ))}
            </g>

            <g className="flat-routes">
              {flatRoutes.map((arc, index) => (
                <g
                  key={`route-${index}`}
                  className={arc.hub ? 'flat-route-group hub' : 'flat-route-group'}
                >
                  <path d={arc.d} pathLength="100" className="flat-route-glow" />
                  <path d={arc.d} pathLength="100" className="flat-route-base" />
                  <path
                    d={arc.d}
                    pathLength="100"
                    className="flat-route-packet"
                    style={{ animationDelay: `-${(index * 0.61).toFixed(2)}s` }}
                  />
                </g>
              ))}
            </g>

            <g className="flat-nodes">
              {nodes.map((node, index) => {
                const p = projectFlat(node.lat, node.lng);
                const radius = (node.target ? 5.1 : node.hub ? 3.9 : 2.15) * nodeScale;
                const cls = node.target ? 'flat-node turkey' : node.hub ? 'flat-node hub' : 'flat-node';

                return (
                  <g key={`node-${index}`} className={cls}>
                    {(node.target || node.hub) && (
                      <>
                        <circle cx={p.x} cy={p.y} r={radius * 3.0} className="flat-node-aura" />
                        <circle cx={p.x} cy={p.y} r={radius * 2.0} className="flat-node-ring" />
                      </>
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={radius}
                      className="flat-node-core"
                      filter={node.target || node.hub ? 'url(#flatNodeGlow)' : undefined}
                    />
                  </g>
                );
              })}
            </g>

            <g className="flat-labels">
              {labels.map((node) => {
                const p = projectFlat(node.lat, node.lng);
                return (
                  <text
                    key={node.name}
                    x={p.x}
                    y={p.y - (node.target ? 13 : 9)}
                    className={node.target ? 'flat-label turkey' : node.hub ? 'flat-label hub' : 'flat-label'}
                    style={{ fontSize: `${(node.target ? 11.2 : node.hub ? 8.5 : 7.4) * labelScale}px` }}
                  >
                    {node.name}
                  </text>
                );
              })}
            </g>
          </g>
        </svg>

        <div className="flat-map-scan" />
        <div className="flat-map-sheen" />
      </div>
    </div>
  );
}

export default function App() {
  const globeRef = useRef();
  const { width, height } = useWindowSize();
  const [geojson, setGeojson] = useState({ features: [] });
  const [filterOpen, setFilterOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('TÜMÜ');
  const [labelScale, setLabelScale] = useState(1);
  const [nodeScale, setNodeScale] = useState(1);
  const [flowDensity, setFlowDensity] = useState(3);
  const [modePhase, setModePhase] = useState('globe');
  const modeTimerRef = useRef(null);
  const flatMode = modePhase === 'flat' || modePhase === 'to-flat';

  useEffect(() => () => {
    if (modeTimerRef.current) clearTimeout(modeTimerRef.current);
  }, []);

  useEffect(() => {
    let active = true;
    fetch(WORLD_URL)
      .then((r) => r.json())
      .then((data) => active && setGeojson(data))
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const visibleNodes = useMemo(() => {
    if (activeFilter === 'TÜMÜ') return NODES;
    if (activeFilter === 'HUBLAR') return NODES.filter((node) => node.hub || node.target);
    return NODES.filter((node) => node.region === activeFilter || node.target);
  }, [activeFilter]);

  const flowNodes = useMemo(() => {
    const candidates = visibleNodes.filter((node) => !node.target);
    const ratio = Math.min(1, flowDensity / 5);
    const limit = Math.max(1, Math.round(candidates.length * ratio));
    return candidates.slice(0, limit);
  }, [visibleNodes, flowDensity]);

  const arcs = useMemo(() => flowNodes.map((node, index) => ({
    from: node,
    to: TURKEY,
    hub: Boolean(node.hub),
    index,
  })), [flowNodes]);

  const fixedRoutes = useMemo(() => arcs.map((arc) => ({
    ...arc,
    points: buildRoutePath(arc),
  })), [arcs]);

  const hubs = useMemo(() => visibleNodes.filter((node) => node.hub || node.target), [visibleNodes]);
  const htmlLabels = useMemo(() => {
    const unique = new Map();
    visibleNodes.filter((node) => node.label).forEach((node) => {
      if (!unique.has(node.name)) unique.set(node.name, { ...node, scale: labelScale });
    });
    return [...unique.values()];
  }, [visibleNodes, labelScale]);


  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls?.();

    if (modePhase === 'flat') {
      if (controls) controls.autoRotate = false;
      globe.pauseAnimation?.();
      return;
    }

    globe.resumeAnimation?.();
    if (controls) controls.autoRotate = modePhase === 'globe';
  }, [modePhase]);

  const handleModeSwitch = () => {
    if (modePhase === 'to-flat' || modePhase === 'to-globe') return;
    if (modeTimerRef.current) clearTimeout(modeTimerRef.current);

    const globe = globeRef.current;
    const controls = globe?.controls?.();
    if (controls) controls.autoRotate = false;

    if (modePhase === 'globe') {
      globe?.pointOfView?.({ lat: 18, lng: 20, altitude: 1.72 }, 240);
      setModePhase('to-flat');
      modeTimerRef.current = setTimeout(() => {
        setModePhase('flat');
        modeTimerRef.current = null;
      }, 920);
      return;
    }

    globe?.resumeAnimation?.();
    setModePhase('to-globe');
    modeTimerRef.current = setTimeout(() => {
      setModePhase('globe');
      const nextControls = globeRef.current?.controls?.();
      if (nextControls) nextControls.autoRotate = true;
      modeTimerRef.current = null;
    }, 920);
  };

  const onReady = () => {
    const globe = globeRef.current;
    if (!globe) return;

    const material = globe.globeMaterial?.();
    if (material) {
      material.color = new THREE.Color('#d9e6f1');
      material.emissive = new THREE.Color('#07101a');
      material.emissiveIntensity = 0.30;
      material.roughness = 0.72;
      material.metalness = 0.08;
      if ('bumpScale' in material) material.bumpScale = 4.2;
    }

    const scene = globe.scene?.();
    if (scene && !scene.userData.referenceLights) {
      const key = new THREE.DirectionalLight('#cde9ff', 1.25);
      key.position.set(-170, 110, 240);
      const blueRim = new THREE.PointLight('#2488ff', 12, 620);
      blueRim.position.set(230, 20, -190);
      const coolFill = new THREE.HemisphereLight('#b2d8ff', '#01040a', 0.40);
      scene.add(key, blueRim, coolFill);
      scene.userData.referenceLights = true;
    }

    const controls = globe.controls?.();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.18;
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.minDistance = 135;
      controls.maxDistance = 430;
    }

    globe.pointOfView?.({ lat: 18, lng: 18, altitude: 1.67 }, 0);
  };

  return (
    <main className={`space-shell mode-${modePhase}`}>
      <SpaceBackdrop />
      <div className="globe-halo" />
      <div className="globe-host">
        <Globe
          ref={globeRef}
          width={width}
          height={height}
          onGlobeReady={onReady}
          globeImageUrl={EARTH_NIGHT}
          bumpImageUrl={EARTH_BUMP}
          backgroundImageUrl={SPACE_IMG}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor="#69b8ff"
          atmosphereAltitude={0.14}
          showGraticules={false}

          polygonsData={geojson.features}
          polygonCapColor={(d) => isTurkeyFeature(d) ? 'rgba(190,31,58,.88)' : 'rgba(87,118,148,.12)'}
          polygonSideColor={(d) => isTurkeyFeature(d) ? 'rgba(92,7,24,.84)' : 'rgba(12,25,38,.38)'}
          polygonStrokeColor={(d) => isTurkeyFeature(d) ? 'rgba(255,118,139,.98)' : 'rgba(181,212,235,.30)'}
          polygonAltitude={(d) => isTurkeyFeature(d) ? 0.012 : 0.0012}
          polygonTransitionDuration={0}

          pointsData={visibleNodes}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0.005}
          pointRadius={(d) => (d.target ? 0.24 : d.hub ? 0.17 : 0.070) * nodeScale}
          pointColor={(d) => d.target ? '#ff3455' : d.hub ? '#ffc85a' : '#55ffad'}
          pointsMerge={false}

          ringsData={hubs}
          ringLat="lat"
          ringLng="lng"
          ringAltitude={0.007}
          ringColor={(d) => () => d.target ? '#ff3858' : '#ffd06d'}
          ringMaxRadius={(d) => (d.target ? 2.5 : 1.55) * nodeScale}
          ringPropagationSpeed={(d) => d.target ? 0.55 : 0.40}
          ringRepeatPeriod={(d) => d.target ? 1800 : 2400}

          pathsData={fixedRoutes}
          pathPoints="points"
          pathPointLat="lat"
          pathPointLng="lng"
          pathPointAlt="alt"
          pathColor={(d) => d.hub ? 'rgba(255,211,122,.68)' : 'rgba(78,169,255,.58)'}
          pathStroke={(d) => d.hub ? 0.32 : 0.20}
          pathDashLength={1}
          pathDashGap={0}
          pathDashAnimateTime={0}
          pathTransitionDuration={0}

          arcsData={arcs}
          arcStartLat={(d) => d.from.lat}
          arcStartLng={(d) => d.from.lng}
          arcEndLat={(d) => d.to.lat}
          arcEndLng={(d) => d.to.lng}
          arcColor={(d) => d.hub ? ['#fff3bd', '#87d1ff'] : ['#e5f7ff', '#69c4ff']}
          arcAltitude={(d) => d.hub ? 0.36 : 0.28}
          arcStroke={(d) => d.hub ? 0.42 : 0.30}
          arcDashLength={(d) => d.hub ? 0.026 : 0.018}
          arcDashGap={(d) => d.hub ? 0.974 : 0.982}
          arcDashInitialGap={(d) => (d.index * 0.137) % 1}
          arcDashAnimateTime={(d) => d.hub ? 6500 : 8600}
          arcsTransitionDuration={0}

          htmlElementsData={htmlLabels}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.022}
          htmlElement={createHtmlLabel}
          htmlElementVisibilityModifier={setHtmlLabelVisibility}
          htmlTransitionDuration={0}
        />
      </div>

      <FlatMap
        geojson={geojson}
        nodes={visibleNodes}
        arcs={arcs}
        labelScale={labelScale}
        nodeScale={nodeScale}
      />

      <button
        className={`mode-switch icon-only ${flatMode ? 'active' : ''}`}
        onClick={handleModeSwitch}
        disabled={modePhase === 'to-flat' || modePhase === 'to-globe'}
        aria-pressed={flatMode}
        aria-label={flatMode ? '3D küre görünümüne dön' : 'Düz harita görünümüne geç'}
      >
        <span className="mode-switch-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="7.6" />
            <path d="M4.8 12h14.4M12 4.4c2.15 2.05 3.15 4.55 3.15 7.6S14.15 17.55 12 19.6M12 4.4C9.85 6.45 8.85 8.95 8.85 12s1 5.55 3.15 7.6" />
          </svg>
        </span>
      </button>

      <div className="corner-status"><span className="status-ring"><i /></span></div>
      <div className="coordinate-hud"><span className="crosshair">✦</span><span>39.9334° N&nbsp;&nbsp;32.8597° E</span></div>
      <div className="right-ticks"><i /><i className="active" /><i /><i /></div>

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
