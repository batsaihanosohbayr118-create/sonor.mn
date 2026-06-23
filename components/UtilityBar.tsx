import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { WEATHER_CODES } from '@/lib/weather';

interface UtilityBarProps {
  toggleSearch: () => void;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
}

interface ExchangeRates {
  USD: number; EUR: number; CNY: number; RUB: number;
  GBP: number; JPY: number; KRW: number; TRY: number;
  CHF: number; AUD: number; CAD: number; HKD: number;
  SGD: number; INR: number; THB: number; MYR: number;
  AED: number; SAR: number; SEK: number; NOK: number;
}

const formatDateLabel = (date: Date) => {
  const weekdays = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баа', 'Бямба'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  return `${year} оны ${month} сарын ${day}, ${weekday}`;
};

const formatTimeLabel = (date: Date) => {
  return date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
};

const getWeatherSummary = (data: WeatherData | null) => {
  if (!data) return 'Цаг агаар...';
  const label = WEATHER_CODES[data.weatherCode] ?? 'Үүлэрхэг';
  return `Улаанбаатар: ${Math.round(data.temperature)}°C · ${label}`;
};

// SVG Flag components
const FlagUS = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#B22234"/>
    <rect y="1.154" width="20" height="1.154" fill="#fff"/>
    <rect y="3.462" width="20" height="1.154" fill="#fff"/>
    <rect y="5.769" width="20" height="1.154" fill="#fff"/>
    <rect y="8.077" width="20" height="1.154" fill="#fff"/>
    <rect y="10.385" width="20" height="1.154" fill="#fff"/>
    <rect y="12.692" width="20" height="1.154" fill="#fff"/>
    <rect width="8" height="8.077" fill="#3C3B6E"/>
  </svg>
);
const FlagEU = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#003399"/>
    {Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const cx = 10 + 4.5 * Math.cos(angle);
      const cy = 7.5 + 4.5 * Math.sin(angle);
      return <polygon key={i} points="0,-1 0.29,0.9 -0.95,-0.35 0.95,-0.35 -0.29,0.9" fill="#FFCC00" transform={`translate(${cx},${cy}) scale(0.8)`}/>;
    })}
  </svg>
);
const FlagCN = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#DE2910"/>
    <polygon points="4,1.5 4.9,4.2 2,2.4 6,2.4 3.1,4.2" fill="#FFDE00"/>
    <polygon points="8,0.5 8.6,1.5 7.3,1 8.7,1 7.4,1.5" fill="#FFDE00"/>
    <polygon points="9.5,2 9.8,3.2 8.8,2.5 10.2,2.5 9.2,3.2" fill="#FFDE00"/>
    <polygon points="9,4.5 9.5,5.5 8.5,5 9.5,4.5 8.5,5.5" fill="#FFDE00"/>
    <polygon points="8,6.5 8.6,7.5 7.4,7 8.6,6.8 7.5,7.5" fill="#FFDE00"/>
  </svg>
);
const FlagRU = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="5" fill="#fff"/>
    <rect y="5" width="20" height="5" fill="#0039A6"/>
    <rect y="10" width="20" height="5" fill="#D52B1E"/>
  </svg>
);
const FlagGB = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#012169"/>
    <path d="M0,0 L20,15 M20,0 L0,15" stroke="#fff" strokeWidth="3"/>
    <path d="M0,0 L20,15 M20,0 L0,15" stroke="#C8102E" strokeWidth="2"/>
    <path d="M10,0 V15 M0,7.5 H20" stroke="#fff" strokeWidth="5"/>
    <path d="M10,0 V15 M0,7.5 H20" stroke="#C8102E" strokeWidth="3"/>
  </svg>
);
const FlagJP = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#fff"/>
    <circle cx="10" cy="7.5" r="4.5" fill="#BC002D"/>
  </svg>
);
const FlagKR = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#fff"/>
    <circle cx="10" cy="7.5" r="3.5" fill="#CD2E3A"/>
    <path d="M10,7.5 m-3.5,0 a3.5,3.5 0 0,1 7,0" fill="#0047A0"/>
    <line x1="3" y1="3" x2="6" y2="6" stroke="#000" strokeWidth="0.8"/>
    <line x1="4" y1="2" x2="7" y2="5" stroke="#000" strokeWidth="0.8"/>
    <line x1="2" y1="4" x2="5" y2="7" stroke="#000" strokeWidth="0.8"/>
    <line x1="14" y1="9" x2="17" y2="12" stroke="#000" strokeWidth="0.8"/>
    <line x1="13" y1="10" x2="16" y2="13" stroke="#000" strokeWidth="0.8"/>
    <line x1="15" y1="8" x2="18" y2="11" stroke="#000" strokeWidth="0.8"/>
  </svg>
);
const FlagTR = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#E30A17"/>
    <circle cx="8.5" cy="7.5" r="3.5" fill="#fff"/>
    <circle cx="9.7" cy="7.5" r="2.8" fill="#E30A17"/>
    <polygon points="13,7.5 14.5,6.5 14,8 15.5,8 14,9 14.5,7" fill="#fff"/>
  </svg>
);
const FlagCH = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#FF0000"/>
    <rect x="8.5" y="3.5" width="3" height="8" fill="#fff"/>
    <rect x="5.5" y="6" width="9" height="3" fill="#fff"/>
  </svg>
);
const FlagAU = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#00008B"/>
    <rect width="10" height="7.5" fill="#012169"/>
    <path d="M0,0 L10,7.5 M10,0 L0,7.5" stroke="#fff" strokeWidth="2"/>
    <path d="M0,0 L10,7.5 M10,0 L0,7.5" stroke="#C8102E" strokeWidth="1.2"/>
    <path d="M5,0 V7.5 M0,3.75 H10" stroke="#fff" strokeWidth="3"/>
    <path d="M5,0 V7.5 M0,3.75 H10" stroke="#C8102E" strokeWidth="1.8"/>
  </svg>
);
const FlagCA = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="5" height="15" fill="#FF0000"/>
    <rect x="15" width="5" height="15" fill="#FF0000"/>
    <rect x="5" width="10" height="15" fill="#fff"/>
    <polygon points="10,3.5 10.6,5.5 12.5,5.5 11,6.8 11.5,8.8 10,7.5 8.5,8.8 9,6.8 7.5,5.5 9.4,5.5" fill="#FF0000"/>
  </svg>
);
const FlagHK = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#DE2010"/>
    <circle cx="10" cy="7.5" r="4" fill="none" stroke="#fff" strokeWidth="0.3"/>
    <path d="M10,3.5 Q11.5,5.5 10,7.5 Q8.5,5.5 10,3.5" fill="#fff"/>
    <path d="M10,3.5 Q11.5,5.5 10,7.5 Q8.5,5.5 10,3.5" fill="#fff" transform="rotate(72,10,7.5)"/>
    <path d="M10,3.5 Q11.5,5.5 10,7.5 Q8.5,5.5 10,3.5" fill="#fff" transform="rotate(144,10,7.5)"/>
    <path d="M10,3.5 Q11.5,5.5 10,7.5 Q8.5,5.5 10,3.5" fill="#fff" transform="rotate(216,10,7.5)"/>
    <path d="M10,3.5 Q11.5,5.5 10,7.5 Q8.5,5.5 10,3.5" fill="#fff" transform="rotate(288,10,7.5)"/>
  </svg>
);
const FlagSG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="7.5" fill="#EF3340"/>
    <rect y="7.5" width="20" height="7.5" fill="#fff"/>
    <circle cx="5" cy="7.5" r="2.5" fill="#fff"/>
    <circle cx="5.8" cy="7.5" r="2" fill="#EF3340"/>
    <circle cx="7.5" cy="5.8" r="0.5" fill="#fff"/>
    <circle cx="8.5" cy="7.2" r="0.5" fill="#fff"/>
    <circle cx="8" cy="8.8" r="0.5" fill="#fff"/>
    <circle cx="6.5" cy="9.5" r="0.5" fill="#fff"/>
    <circle cx="5.3" cy="8.5" r="0.5" fill="#fff"/>
  </svg>
);
const FlagIN = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="5" fill="#FF9933"/>
    <rect y="5" width="20" height="5" fill="#fff"/>
    <rect y="10" width="20" height="5" fill="#138808"/>
    <circle cx="10" cy="7.5" r="1.8" fill="none" stroke="#000080" strokeWidth="0.4"/>
    <circle cx="10" cy="7.5" r="0.3" fill="#000080"/>
  </svg>
);
const FlagTH = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#A51931"/>
    <rect y="2.5" width="20" height="10" fill="#F4F5F8"/>
    <rect y="5" width="20" height="5" fill="#2D2A4A"/>
  </svg>
);
const FlagMY = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#fff"/>
    {[0,1,2,3,4,5,6].map(i => (
      <rect key={i} y={i*2.14} width="20" height="1.07" fill={i%2===0 ? '#CC0001' : '#fff'}/>
    ))}
    <rect width="8" height="8" fill="#010066"/>
    <circle cx="3.5" cy="4" r="2" fill="#FFD100"/>
    <circle cx="4.2" cy="4" r="1.6" fill="#010066"/>
  </svg>
);
const FlagAE = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="5" fill="#00732F"/>
    <rect y="5" width="20" height="5" fill="#fff"/>
    <rect y="10" width="20" height="5" fill="#000"/>
    <rect width="5" height="15" fill="#FF0000"/>
  </svg>
);
const FlagSA = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#006C35"/>
    <text x="4" y="10" fontSize="5" fill="#fff" fontFamily="serif">لا إله إلا الله</text>
  </svg>
);
const FlagSE = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#006AA7"/>
    <rect x="6" width="2.5" height="15" fill="#FECC02"/>
    <rect y="6.25" width="20" height="2.5" fill="#FECC02"/>
  </svg>
);
const FlagNO = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: '2px', flexShrink: 0 }}>
    <rect width="20" height="15" fill="#EF2B2D"/>
    <rect x="6" width="2.5" height="15" fill="#fff"/>
    <rect y="6.25" width="20" height="2.5" fill="#fff"/>
    <rect x="6.75" width="1" height="15" fill="#002868"/>
    <rect y="7" width="20" height="1" fill="#002868"/>
  </svg>
);

type CurrencyKey = keyof ExchangeRates;

const FLAGS: Record<CurrencyKey, React.FC> = {
  USD: FlagUS, EUR: FlagEU, CNY: FlagCN, RUB: FlagRU,
  GBP: FlagGB, JPY: FlagJP, KRW: FlagKR, TRY: FlagTR,
  CHF: FlagCH, AUD: FlagAU, CAD: FlagCA, HKD: FlagHK,
  SGD: FlagSG, INR: FlagIN, THB: FlagTH, MYR: FlagMY,
  AED: FlagAE, SAR: FlagSA, SEK: FlagSE, NOK: FlagNO,
};

const CURRENCY_CONFIG: { key: CurrencyKey; code: string; label: string; group: string }[] = [
  { key: 'USD', code: 'USD', label: 'АНУ доллар',         group: 'Дэлхийн' },
  { key: 'EUR', code: 'EUR', label: 'Евро',                group: 'Дэлхийн' },
  { key: 'GBP', code: 'GBP', label: 'Британи фунт',       group: 'Дэлхийн' },
  { key: 'CHF', code: 'CHF', label: 'Швейцарийн франк',   group: 'Дэлхийн' },
  { key: 'SEK', code: 'SEK', label: 'Шведийн крон',       group: 'Дэлхийн' },
  { key: 'NOK', code: 'NOK', label: 'Норвегийн крон',     group: 'Дэлхийн' },
  { key: 'CNY', code: 'CNY', label: 'Хятад юань',         group: 'Ази' },
  { key: 'RUB', code: 'RUB', label: 'Оросын рубль',       group: 'Ази' },
  { key: 'JPY', code: 'JPY', label: 'Японы иен',          group: 'Ази' },
  { key: 'KRW', code: 'KRW', label: 'Солонгосын вон',     group: 'Ази' },
  { key: 'HKD', code: 'HKD', label: 'Хонг Конгийн доллар', group: 'Ази' },
  { key: 'SGD', code: 'SGD', label: 'Сингапурын доллар',  group: 'Ази' },
  { key: 'INR', code: 'INR', label: 'Энэтхэгийн рупи',   group: 'Ази' },
  { key: 'THB', code: 'THB', label: 'Тайландын бат',      group: 'Ази' },
  { key: 'MYR', code: 'MYR', label: 'Малайзийн ринггит',  group: 'Ази' },
  { key: 'TRY', code: 'TRY', label: 'Туркийн лир',        group: 'Ази' },
  { key: 'AUD', code: 'AUD', label: 'Австралийн доллар',  group: 'Бусад' },
  { key: 'CAD', code: 'CAD', label: 'Канадын доллар',     group: 'Бусад' },
  { key: 'AED', code: 'AED', label: 'НАЭ дирхем',         group: 'Бусад' },
  { key: 'SAR', code: 'SAR', label: 'Саудын риял',        group: 'Бусад' },
];

const DEFAULT_RATES: ExchangeRates = {
  USD: 3577, EUR: 3890, CNY: 492, RUB: 40,
  GBP: 4520, JPY: 24, KRW: 2.6, TRY: 108,
  CHF: 4100, AUD: 2300, CAD: 2620, HKD: 458,
  SGD: 2680, INR: 43, THB: 99, MYR: 810,
  AED: 974, SAR: 953, SEK: 348, NOK: 328,
};

export default function UtilityBar({ toggleSearch }: UtilityBarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState('');
  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_RATES);
  const [showRates, setShowRates] = useState(false);
  const ratesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentDate(new Date());
    const interval = window.setInterval(() => setCurrentDate(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch('https://api.open-meteo.com/v1/forecast?latitude=47.8864&longitude=106.9057&current_weather=true&timezone=Asia%2FUlaanbaatar', {
      signal: controller.signal,
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(json => {
        if (json.current_weather) {
          setWeather({
            temperature: json.current_weather.temperature,
            weatherCode: json.current_weather.weathercode,
            windSpeed: json.current_weather.windspeed,
            windDirection: json.current_weather.winddirection,
          });
        } else setWeatherError('Цаг агаарын мэдээлэл олдсонгүй');
      })
      .catch(() => setWeatherError('Цаг агаарын мэдээлэл олдсонгүй'));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/MNT')
      .then(r => r.json())
      .then(data => {
        if (data.rates) {
          const r = data.rates;
          const round = (k: string) => Math.round(1 / r[k]);
          const fix2 = (k: string) => parseFloat((1 / r[k]).toFixed(2));
          setRates({
            USD: round('USD'), EUR: round('EUR'), CNY: round('CNY'), RUB: round('RUB'),
            GBP: round('GBP'), JPY: round('JPY'), KRW: fix2('KRW'), TRY: round('TRY'),
            CHF: round('CHF'), AUD: round('AUD'), CAD: round('CAD'), HKD: round('HKD'),
            SGD: round('SGD'), INR: round('INR'), THB: round('THB'), MYR: round('MYR'),
            AED: round('AED'), SAR: round('SAR'), SEK: round('SEK'), NOK: round('NOK'),
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ratesRef.current && !ratesRef.current.contains(e.target as Node)) {
        setShowRates(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openWeatherPage = () => router.push('/weather');
  const handleWeatherKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openWeatherPage(); }
  };

  const todayLabel = currentDate
    ? `${formatDateLabel(currentDate)} · Улаанбаатар · ${formatTimeLabel(currentDate)}`
    : 'Улаанбаатар';

  const groups = ['Дэлхийн', 'Ази', 'Бусад'];

  return (
    <div className="utility">
      <div className="wrap">
        <span id="today">{todayLabel}</span>
        <span className="right">
          <div className="weather-toggle" role="button" tabIndex={0}
            aria-label="Аймгуудын цаг агаар харах"
            onClick={openWeatherPage} onKeyDown={handleWeatherKeyDown}>
            <span>{weatherError || getWeatherSummary(weather)}</span>
            <small>›</small>
          </div>

          <div className="rates-wrap" ref={ratesRef} style={{ position: 'relative' }}>
            <button
              className="rates-btn"
              onClick={() => setShowRates(v => !v)}
              aria-expanded={showRates}
              aria-haspopup="listbox"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'inherit', fontSize: 'inherit', padding: 0,
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <FlagUS />
              <span>USD {rates.USD.toLocaleString()}₮</span>
              <span style={{ fontSize: '10px', opacity: 0.7 }}>{showRates ? '▲' : '▼'}</span>
            </button>

            {showRates && (
              <div
                className="rates-dropdown"
                role="listbox"
                aria-label="Валютын ханш"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '300px',
                  maxWidth: 'calc(100vw - 32px)',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
                  padding: '6px',
                  zIndex: 200,
                  maxHeight: '70vh',
                  overflowY: 'auto',
                }}
              >
                <div style={{
                  padding: '6px 10px 8px',
                  fontSize: '11px', fontWeight: 600,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  color: '#9ca3af', borderBottom: '1px solid #f3f4f6',
                  marginBottom: '4px',
                }}>
                  Валютын ханш · ₮
                </div>

                {groups.map(group => {
                  const items = CURRENCY_CONFIG.filter(c => c.group === group);
                  return (
                    <div key={group}>
                      <div style={{
                        padding: '6px 10px 3px',
                        fontSize: '10px', fontWeight: 700,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: '#9ca3af',
                      }}>
                        {group}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1px' }}>
                        {items.map(({ key, code, label }) => {
                          const Flag = FLAGS[key];
                          return (
                            <div
                              key={key}
                              role="option"
                              style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                transition: 'background 0.15s',
                                cursor: 'default',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <Flag />
                              <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827', minWidth: 36 }}>
                                {code}
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280', flex: 1 }}>
                                {label}
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a2e', flexShrink: 0 }}>
                                {rates[key].toLocaleString()}<span style={{ fontSize: '10px', fontWeight: 500, color: '#6b7280' }}>₮</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div style={{
                  borderTop: '1px solid #f3f4f6', marginTop: '4px',
                  padding: '6px 10px 2px', fontSize: '11px', color: '#9ca3af',
                }}>
                  * Лавлах ханш — Монголбанк
                </div>
              </div>
            )}
          </div>

          <button className="searchbtn" onClick={toggleSearch} aria-label="Хайх">
            <i>⌕</i> Хайх
          </button>
        </span>
      </div>
    </div>
  );
}