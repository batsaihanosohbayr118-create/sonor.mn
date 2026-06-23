import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import * as d3 from 'd3';
import type { FeatureCollection, Feature } from 'geojson';
import { WEATHER_CODES, WEATHER_LOCATIONS, WeatherLocation } from '@/lib/weather';

interface CurrentWeather {
  temperature: number;
  weathercode: number;
  windspeed: number;
  winddirection: number;
  time: string;
}
interface HourlyExtra {
  humidity: number | null;
  pressure: number | null;
}
interface LocationWeatherCache {
  current: CurrentWeather | null;
  extra: HourlyExtra | null;
  error: boolean;
  loaded: boolean;
  isFallback?: boolean;
}

const WIND_DIRECTIONS = ['Хойд','Хойт-зүүн','Зүүн','Урд-зүүн','Урд','Урд-баруун','Баруун','Хойт-баруун'];
const formatWindDirection = (d: number) => WIND_DIRECTIONS[Math.round(d / 45) % 8];
const formatUpdatedTime = (v: string) => {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return 'Шинэчлэгдсэн';
  return d.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
};

const getTempColor = (temp: number | null): string => {
  if (temp === null) return '#C8DCF0';
  if (temp <= -20) return '#3A7FC1';
  if (temp <= -10) return '#5294CE';
  if (temp <= 0)   return '#72AFDC';
  if (temp <= 10)  return '#90C5E8';
  if (temp <= 20)  return '#B2D8F0';
  if (temp <= 30)  return '#CEEAF8';
  return '#E4F4FD';
};

const getWeatherIcon = (code: number | undefined): string => {
  if (code === undefined) return '⛅';
  if (code === 0) return '☀️';
  if (code <= 2)  return '⛅';
  if (code <= 3)  return '☁️';
  if (code <= 49) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '⛅';
};

const PREFECTURE_TO_ID: Record<string, string> = {
  Arkhangai:    'arkhangai',
  Bagakhangai:  'bagakhangai',
  Baganuur:     'baganuur',
  Bayankhongor: 'bayankhongor',
  'Bayan-Ulgii':'bayan-ulgii',
  Bulgan:       'bulgan',
  'Darkhan-Uul':'darkhan-uul',
  Dornod:       'dornod',
  Dornogovi:    'dornogovi',
  Dundgovi:     'dundgovi',
  GoviAltai:    'govi-altai',
  Govisumber:   'govisumber',
  Khentii:      'khentii',
  Khovd:        'khovd',
  Khuvsgul:     'khuvsgul',
  Orkhon:       'orkhon',
  Selenge:      'selenge',
  Sukhbaatar:   'sukhbaatar',
  Tuv:          'tuv',
  Ulaanbaatar:  'ulaanbaatar',
  Umnugovi:     'umnugovi',
  uvs:          'uvs',
  Uvurkhangai:  'uvurkhangai',
  Zavkhan:      'zavkhan',
};

function normalizeGeoJson(raw: FeatureCollection): FeatureCollection {
  return {
    ...raw,
    features: raw.features.map(f => ({
      ...f,
      properties: {
        ...f.properties,
        id: PREFECTURE_TO_ID[f.properties?.prefecture as string] ?? f.properties?.prefecture,
      },
    })),
  };
}

function seededFallback(loc: WeatherLocation): LocationWeatherCache {
  let h = 0;
  for (let i = 0; i < loc.id.length; i++) h = (h * 31 + loc.id.charCodeAt(i)) >>> 0;
  const rnd = (h % 1000) / 1000;

  const now = new Date();
  const month = now.getMonth();
  const seasonBase = [-18,-12,-2,8,16,22,24,22,15,4,-8,-16][month];
  const latAdjust = (50.5 - loc.latitude) * 1.1;
  const altAdjust = (rnd - 0.5) * 6;
  const temperature = Math.round(seasonBase + latAdjust + altAdjust);

  const codePool = [0, 1, 2, 3, 45, 61, 71];
  const weathercode = codePool[Math.floor(rnd * codePool.length)];

  return {
    current: {
      temperature,
      weathercode,
      windspeed: Math.round(4 + rnd * 18),
      winddirection: Math.round(rnd * 360),
      time: now.toISOString(),
    },
    extra: {
      humidity: Math.round(35 + rnd * 45),
      pressure: Math.round(870 + rnd * 30),
    },
    error: false,
    loaded: true,
    isFallback: true,
  };
}

async function fetchWeatherForLocation(loc: WeatherLocation): Promise<LocationWeatherCache> {
  const params = new URLSearchParams({
    latitude: String(loc.latitude),
    longitude: String(loc.longitude),
    current_weather: 'true',
    hourly: 'relativehumidity_2m,surface_pressure',
    timezone: 'Asia/Ulaanbaatar',
  });
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error();
    const json = await res.json();
    const current: CurrentWeather | null = json.current_weather || null;
    if (!current) throw new Error();
    let extra: HourlyExtra | null = null;
    if (json.hourly?.time) {
      let idx = json.hourly.time.indexOf(current.time);
      if (idx === -1) idx = 0;
      extra = {
        humidity: json.hourly.relativehumidity_2m?.[idx] ?? null,
        pressure: json.hourly.surface_pressure?.[idx] ?? null,
      };
    }
    return { current, extra, error: false, loaded: true, isFallback: false };
  } catch {
    return seededFallback(loc);
  }
}

interface MapTooltip { x: number; y: number; id: string; }

// SVG-ийн viewBox хэмжээ — том хийснээр нэрүүд илүү тод харагдана
const MAP_W = 1400;
const MAP_H = 780;

function MongoliaMap({
  allWeather, selectedId, onProvinceClick, geoJson,
}: {
  allWeather: Record<string, LocationWeatherCache>;
  selectedId: string | undefined;
  onProvinceClick: (id: string) => void;
  geoJson: FeatureCollection | null;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<MapTooltip | null>(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || !geoJson) return;
    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    // Padding багасгаж газрын зургийг томруулна
    const projection = d3.geoMercator().fitExtent([[10, 10], [MAP_W - 10, MAP_H - 10]], geoJson);
    const pathGen = d3.geoPath().projection(projection);
    const locMap = Object.fromEntries(WEATHER_LOCATIONS.map(l => [l.id, l]));
    const smallIds = new Set(['ulaanbaatar', 'orkhon', 'darkhan-uul', 'govisumber', 'bagakhangai', 'baganuur']);

    const g = svg.append('g');

    g.selectAll<SVGPathElement, Feature>('path.province')
      .data(geoJson.features)
      .join('path')
      .attr('class', 'province')
      .attr('d', d => pathGen(d) ?? '')
      .attr('fill', d => {
        const id = d.properties?.id as string;
        const temp = allWeather[id]?.current?.temperature ?? null;
        return getTempColor(temp);
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', d => d.properties?.id === selectedId ? 2.5 : 1.0)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('stroke-width', 2.2).attr('filter', 'brightness(0.93)');
        const rect = svgEl.getBoundingClientRect();
        setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, id: d.properties?.id as string });
      })
      .on('mousemove', function (event) {
        const rect = svgEl.getBoundingClientRect();
        setTooltip(prev => prev ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top } : null);
      })
      .on('mouseleave', function (_, d) {
        const id = d.properties?.id as string;
        d3.select(this).attr('stroke-width', id === selectedId ? 2.5 : 1.0).attr('filter', null);
        setTooltip(null);
      })
      .on('click', (_, d) => {
        const id = d.properties?.id as string;
        if (id) onProvinceClick(id);
      });

    if (selectedId) {
      const sel = geoJson.features.find(f => f.properties?.id === selectedId);
      if (sel) {
        g.append('path').datum(sel)
          .attr('d', d => pathGen(d) ?? '')
          .attr('fill', 'none')
          .attr('stroke', '#2563eb')
          .attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '6,3')
          .attr('pointer-events', 'none');
      }
    }

    geoJson.features.forEach(feature => {
      const id = feature.properties?.id as string;
      const w = allWeather[id];
      if (!w?.loaded || w.error || !w.current) return;

      const c = pathGen.centroid(feature);
      if (!c || isNaN(c[0]) || isNaN(c[1])) return;

      const loc = locMap[id];
      if (!loc) return;

      const isSmall = smallIds.has(id);
      const iconSize = isSmall ? 30 : 46;
      const fontSize = isSmall ? 14 : 19;
      const temp = Math.round(w.current.temperature);
      const icon = getWeatherIcon(w.current.weathercode);

      g.append('text')
        .attr('x', c[0])
        .attr('y', c[1] - (isSmall ? 12 : 20))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', iconSize)
        .attr('pointer-events', 'none')
        .style('user-select', 'none')
        .text(icon);

      g.append('text')
        .attr('x', c[0])
        .attr('y', c[1] + (isSmall ? 18 : 27))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', fontSize)
        .attr('fill', '#1e3a5f')
        .attr('font-weight', '600')
        .attr('font-family', 'system-ui, sans-serif')
        .attr('pointer-events', 'none')
        .style('user-select', 'none')
        .text(`${loc.center}: ${temp}°`);
    });

  }, [allWeather, selectedId, onProvinceClick, geoJson]);

  const tooltipLoc = tooltip ? WEATHER_LOCATIONS.find(l => l.id === tooltip.id) : null;
  const tooltipW   = tooltip ? allWeather[tooltip.id] : null;

  return (
    <div className="weather-map-container" style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="weather-map-svg"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />

      {tooltip && tooltipLoc && (
        <div className="weather-map-tooltip" style={{ left: Math.min(tooltip.x + 14, 560), top: tooltip.y - 10 }}>
          <div className="wmt-province">{tooltipLoc.province}</div>
          <div className="wmt-center">{tooltipLoc.center}</div>
          {tooltipW?.loaded ? (
            tooltipW.error ? <div className="wmt-error">Мэдээлэл байхгүй</div> : (
              <>
                <div className="wmt-temp" style={{ color: getTempColor(tooltipW.current?.temperature ?? null) }}>
                  {tooltipW.current ? `${Math.round(tooltipW.current.temperature)}°C` : '--'}
                </div>
                <div className="wmt-label">
                  {tooltipW.current ? WEATHER_CODES[tooltipW.current.weathercode] ?? 'Үүлэрхэг' : '--'}
                </div>
                <div className="wmt-wind">
                  Салхи: {tooltipW.current ? `${Math.round(tooltipW.current.windspeed)} км/ц` : '--'}
                </div>
              </>
            )
          ) : <div className="wmt-loading">Ачаалж байна…</div>}
        </div>
      )}

      <div className="weather-map-legend">
        <div className="wml-label">Температур</div>
        <div className="wml-scale">
          {([
            { label: '≤−20°', color: '#3A7FC1' },
            { label: '−10°',  color: '#5294CE' },
            { label: '0°',    color: '#72AFDC' },
            { label: '10°',   color: '#90C5E8' },
            { label: '20°',   color: '#B2D8F0' },
            { label: '30°',   color: '#CEEAF8' },
            { label: '>30°',  color: '#E4F4FD' },
          ] as {label:string,color:string}[]).map(({ label: lbl, color }) => (
            <div key={lbl} className="wml-item">
              <span className="wml-dot" style={{ background: color }} />
              <span>{lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WeatherDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const location = WEATHER_LOCATIONS.find(item => item.id === id);

  const [allWeather, setAllWeather] = useState<Record<string, LocationWeatherCache>>({});
  const [loadingAll, setLoadingAll] = useState(true);
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch('/data/mongolia-provinces.geojson')
      .then(r => r.json())
      .then((raw: FeatureCollection) => setGeoJson(normalizeGeoJson(raw)))
      .catch(() => console.error('GeoJSON татаж чадсангүй'));
  }, []);

  const loadAll = useCallback(async () => {
    setLoadingAll(true);
    const results = await Promise.all(
      WEATHER_LOCATIONS.map(async loc => ({ id: loc.id, data: await fetchWeatherForLocation(loc) }))
    );
    const map: Record<string, LocationWeatherCache> = {};
    results.forEach(r => { map[r.id] = r.data; });
    setAllWeather(map);
    setLoadingAll(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleProvinceClick = useCallback((provinceId: string) => {
    router.push(`/weather/${provinceId}`);
  }, [router]);

  const selectedWeather = location ? allWeather[location.id] : null;
  const loading = !selectedWeather?.loaded;
  const error   = selectedWeather?.error ?? false;
  const current = selectedWeather?.current ?? null;
  const extra   = selectedWeather?.extra ?? null;
  const label   = current
    ? WEATHER_CODES[current.weathercode] ?? 'Үүлэрхэг'
    : loading ? 'Ачаалж байна' : 'Мэдээлэл байхгүй';

  if (!location) {
    return (
      <div className="weather-page">
        <p className="admin-muted">Байршил олдсонгүй.</p>
        <Link href="/weather" className="backlink">← Бүх аймгууд</Link>
      </div>
    );
  }

  return (
    <div className="weather-page weather-detail-page">
      <Link href="/weather" className="backlink">← Бүх аймгууд</Link>

      <div className="weather-split-layout">
        <div className="weather-map-panel">
          <MongoliaMap
            allWeather={allWeather}
            selectedId={typeof id === 'string' ? id : undefined}
            onProvinceClick={handleProvinceClick}
            geoJson={geoJson}
          />
        </div>

        <div className="weather-detail-panel">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '4px' }}>
                Монгол улс · Аймаг
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.1 }}>
                {location.province}
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0' }}>
                {location.center} хот
              </p>
            </div>
            <button
              onClick={loadAll}
              disabled={loadingAll}
              style={{
                background: loadingAll ? '#f3f4f6' : '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 500,
                color: loadingAll ? '#9ca3af' : '#374151',
                cursor: loadingAll ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all .15s',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '14px' }}>{loadingAll ? '⏳' : '↻'}</span>
              {loadingAll ? 'Ачааллаж байна' : 'Шинэчлэх'}
            </button>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', color: '#dc2626', fontSize: '14px' }}>
              Мэдээлэл татаж чадсангүй.
            </div>
          )}

          {!error && (
            <>
              {/* Main temp card */}
              <div style={{
                background: 'linear-gradient(135deg, #eef4fb 0%, #f0f4ff 100%)',
                border: '1px solid #e0e7ff',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}>
                <div style={{ fontSize: '72px', lineHeight: 1 }}>
                  {getWeatherIcon(current?.weathercode)}
                </div>
                <div>
                  <div style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1, color: current ? getTempColor(current.temperature) : '#93c5fd', letterSpacing: '-2px' }}>
                    {current ? `${Math.round(current.temperature)}°` : '--'}
                  </div>
                  <div style={{ fontSize: '16px', color: '#4b5563', fontWeight: 500, marginTop: '4px' }}>
                    {label}
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Салхины хурд', value: current ? `${Math.round(current.windspeed)} км/ц` : '--' },
                  { label: 'Салхины чиглэл', value: current ? formatWindDirection(current.winddirection) : '--' },
                  { label: 'Чийгшил', value: extra?.humidity != null ? `${Math.round(extra.humidity)}%` : '--' },
                  { label: 'Даралт', value: extra?.pressure != null ? `${Math.round(extra.pressure)} hPa` : '--' },
                ].map(({ label: lbl, value }) => (
                  <div key={lbl} style={{
                    background: '#fff',
                    border: '1px solid #f3f4f6',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>{lbl}</span>
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827', letterSpacing: '-0.5px' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', padding: '0 2px' }}>
                <span>
                  {selectedWeather?.isFallback ? 'Жишээ өгөгдөл' : `Шинэчлэгдсэн: ${current ? formatUpdatedTime(current.time) : '--'}`}
                </span>
                <span>open-meteo.com</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}