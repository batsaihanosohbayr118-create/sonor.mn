import React, { useEffect, useMemo, useRef, useState } from 'react';

interface WeatherData {
  temperature: number;
  weatherCode: number;
}

interface ExchangeRates {
  USD: number;
  EUR: number;
  CNY: number;
  RUB: number;
  JPY: number;
  KRW: number;
  GBP: number;
  KZT: number;
  HKD: number;
  SGD: number;
  AUD: number;
  CAD: number;
  CHF: number;
  INR: number;
  THB: number;
  TRY: number;
  AED: number;
  SAR: number;
  MYR: number;
  IDR: number;
  PHP: number;
  VND: number;
  NZD: number;
  SEK: number;
  NOK: number;
  DKK: number;
  PLN: number;
  CZK: number;
  ILS: number;
  BRL: number;
}

const DEFAULT_RATES: ExchangeRates = {
  USD: 3610, EUR: 3890, CNY: 492, RUB: 40, JPY: 24, KRW: 2.6, GBP: 4540,
  KZT: 7.5, HKD: 462, SGD: 2687, AUD: 2368, CAD: 2647, CHF: 4091, INR: 43,
  THB: 103, TRY: 113, AED: 981, SAR: 960, MYR: 766, IDR: 0.23, PHP: 64,
  VND: 0.15, NZD: 2195, SEK: 346, NOK: 340, DKK: 522, PLN: 900, CZK: 159,
  ILS: 973, BRL: 720,
};

const formatDateLabel = (date: Date) => {
  const weekdays = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
  return `${date.getFullYear()} оны ${date.getMonth() + 1} сарын ${date.getDate()}, ${weekdays[date.getDay()]}`;
};

const formatTimeLabel = (date: Date) =>
  date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });

const weatherLabel = (code?: number) => {
  if (code === 0) return 'Цэлмэг';
  if ([1, 2].includes(code ?? -1)) return 'Хагас үүлтэй';
  if ([3, 45, 48].includes(code ?? -1)) return 'Үүлэрхэг';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code ?? -1)) return 'Бороо';
  if ([71, 73, 75, 77, 85, 86].includes(code ?? -1)) return 'Цас';
  if ([95, 96, 99].includes(code ?? -1)) return 'Аадар бороо';
  return 'Хагас үүлтэй';
};

const flagWrapStyle: React.CSSProperties = { display: 'block', borderRadius: 2, flexShrink: 0 };
const svgProps = { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 15', width: 20, height: 15, style: flagWrapStyle };

function FlagUS() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#B22234" />
      <rect y="1.154" width="20" height="1.154" fill="#fff" />
      <rect y="3.462" width="20" height="1.154" fill="#fff" />
      <rect y="5.769" width="20" height="1.154" fill="#fff" />
      <rect y="8.077" width="20" height="1.154" fill="#fff" />
      <rect y="10.385" width="20" height="1.154" fill="#fff" />
      <rect y="12.692" width="20" height="1.154" fill="#fff" />
      <rect width="8" height="8.077" fill="#3C3B6E" />
    </svg>
  );
}

function FlagEU() {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const cx = 10 + Math.cos(angle) * 5;
    const cy = 7.5 + Math.sin(angle) * 5;
    return <circle key={i} cx={cx} cy={cy} r="0.7" fill="#FFCC00" />;
  });
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#003399" />
      {stars}
    </svg>
  );
}

function FlagCN() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#DE2910" />
      <polygon points="4,2.3 4.6,4.1 6.5,4.1 5,5.2 5.6,7 4,5.9 2.4,7 3,5.2 1.5,4.1 3.4,4.1" fill="#FFDE00" />
      <polygon points="7.5,1.3 7.8,2.1 8.6,2.1 7.9,2.6 8.2,3.4 7.5,2.9 6.8,3.4 7.1,2.6 6.4,2.1 7.2,2.1" fill="#FFDE00" />
      <polygon points="9.3,3.1 9.6,3.9 10.4,3.9 9.7,4.4 10,5.2 9.3,4.7 8.6,5.2 8.9,4.4 8.2,3.9 9,3.9" fill="#FFDE00" />
      <polygon points="9.3,6 9.6,6.8 10.4,6.8 9.7,7.3 10,8.1 9.3,7.6 8.6,8.1 8.9,7.3 8.2,6.8 9,6.8" fill="#FFDE00" />
      <polygon points="7.5,8 7.8,8.8 8.6,8.8 7.9,9.3 8.2,10.1 7.5,9.6 6.8,10.1 7.1,9.3 6.4,8.8 7.2,8.8" fill="#FFDE00" />
    </svg>
  );
}

function FlagRU() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="5" fill="#fff" />
      <rect y="5" width="20" height="5" fill="#0039A6" />
      <rect y="10" width="20" height="5" fill="#D52B1E" />
    </svg>
  );
}

function FlagJP() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#fff" />
      <circle cx="10" cy="7.5" r="4" fill="#BC002D" />
    </svg>
  );
}

function FlagKR() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#fff" />
      <circle cx="10" cy="7.5" r="3.2" fill="#CD2E3A" />
      <path d="M10 4.3a3.2 3.2 0 0 0 0 6.4 1.6 1.6 0 0 1 0-3.2 1.6 1.6 0 0 0 0-3.2Z" fill="#0047A0" />
      <g stroke="#000" strokeWidth="0.5">
        <line x1="3" y1="3.2" x2="5.5" y2="3.2" />
        <line x1="3" y1="4" x2="5.5" y2="4" />
        <line x1="3" y1="4.8" x2="5.5" y2="4.8" />
        <line x1="14.5" y1="10.2" x2="17" y2="10.2" />
        <line x1="14.5" y1="11" x2="17" y2="11" />
        <line x1="14.5" y1="11.8" x2="17" y2="11.8" />
      </g>
    </svg>
  );
}

function FlagGB() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#00247D" />
      <path d="M0,0 L20,15 M20,0 L0,15" stroke="#fff" strokeWidth="2.6" />
      <path d="M0,0 L20,15 M20,0 L0,15" stroke="#CF142B" strokeWidth="0.9" />
      <path d="M10,0 V15 M0,7.5 H20" stroke="#fff" strokeWidth="4.4" />
      <path d="M10,0 V15 M0,7.5 H20" stroke="#CF142B" strokeWidth="2.6" />
    </svg>
  );
}

function FlagKZ() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#00AFCA" />
      <circle cx="10" cy="7.5" r="3" fill="#FEC50C" />
    </svg>
  );
}

function FlagHK() {
  const petals = Array.from({ length: 5 }, (_, i) => (
    <g key={i} transform={`rotate(${i * 72} 10 7.5)`}>
      <ellipse cx="10" cy="5.2" rx="1.1" ry="2.1" fill="#fff" />
    </g>
  ));
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#DE2910" />
      {petals}
    </svg>
  );
}

function FlagSG() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="7.5" fill="#ED2939" />
      <rect y="7.5" width="20" height="7.5" fill="#fff" />
      <circle cx="5" cy="3.5" r="2" fill="#fff" />
      <circle cx="5.9" cy="3.5" r="1.7" fill="#ED2939" />
      <circle cx="8.2" cy="2" r="0.4" fill="#fff" />
      <circle cx="9.4" cy="3.1" r="0.4" fill="#fff" />
      <circle cx="9" cy="4.6" r="0.4" fill="#fff" />
      <circle cx="7.4" cy="5" r="0.4" fill="#fff" />
      <circle cx="6.7" cy="3.1" r="0.4" fill="#fff" />
    </svg>
  );
}

function FlagAU() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#00008B" />
      <rect width="9" height="5.5" fill="#00008B" />
      <path d="M0,0 L9,5.5 M9,0 L0,5.5" stroke="#fff" strokeWidth="1.1" />
      <path d="M4.5,0 V5.5 M0,2.75 H9" stroke="#fff" strokeWidth="1.6" />
      <path d="M4.5,0 V5.5 M0,2.75 H9" stroke="#CF142B" strokeWidth="0.8" />
      <circle cx="15" cy="4" r="0.7" fill="#fff" />
      <circle cx="17" cy="7" r="0.7" fill="#fff" />
      <circle cx="15.5" cy="10" r="0.7" fill="#fff" />
      <circle cx="12.5" cy="8" r="0.5" fill="#fff" />
      <circle cx="14" cy="12.5" r="0.5" fill="#fff" />
    </svg>
  );
}

function FlagCA() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#fff" />
      <rect width="5" height="15" fill="#FF0000" />
      <rect x="15" width="5" height="15" fill="#FF0000" />
      <polygon points="10,3 11,6.5 14,6 11.7,8.3 12.5,11 10,9.3 7.5,11 8.3,8.3 6,6 9,6.5" fill="#FF0000" />
    </svg>
  );
}

function FlagCH() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#D52B1E" />
      <rect x="8.5" y="4" width="3" height="7" fill="#fff" />
      <rect x="6.5" y="6" width="7" height="3" fill="#fff" />
    </svg>
  );
}

function FlagIN() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="5" fill="#FF9933" />
      <rect y="5" width="20" height="5" fill="#fff" />
      <rect y="10" width="20" height="5" fill="#138808" />
      <circle cx="10" cy="7.5" r="1.5" fill="none" stroke="#000080" strokeWidth="0.3" />
      <circle cx="10" cy="7.5" r="0.3" fill="#000080" />
    </svg>
  );
}

function FlagTH() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#fff" />
      <rect width="20" height="2.5" fill="#A51931" />
      <rect y="12.5" width="20" height="2.5" fill="#A51931" />
      <rect y="5" width="20" height="5" fill="#2D2A4A" />
    </svg>
  );
}

function FlagTR() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#E30A17" />
      <circle cx="8" cy="7.5" r="3.5" fill="#fff" />
      <circle cx="9" cy="7.5" r="2.9" fill="#E30A17" />
      <polygon points="12,7.5 13.4,8.3 13,6.7 14.2,5.7 12.6,5.6 12,4.1 11.4,5.6 9.8,5.7 11,6.7 10.6,8.3" fill="#fff" />
    </svg>
  );
}

function FlagAE() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="5" fill="#00732F" />
      <rect y="5" width="20" height="5" fill="#fff" />
      <rect y="10" width="20" height="5" fill="#000" />
      <rect width="5" height="15" fill="#FF0000" />
    </svg>
  );
}

function FlagSA() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#006C35" />
      <rect x="3" y="11" width="14" height="1" fill="#fff" />
    </svg>
  );
}

function FlagMY() {
  const stripes = Array.from({ length: 6 }, (_, i) => (
    <rect key={i} y={i * 2.5} width="20" height="2.5" fill={i % 2 === 0 ? '#CC0001' : '#fff'} />
  ));
  return (
    <svg {...svgProps}>
      {stripes}
      <rect width="9" height="8.5" fill="#010066" />
      <circle cx="4" cy="4.2" r="2" fill="#fff" />
      <circle cx="4.8" cy="4.2" r="1.7" fill="#010066" />
      <polygon points="7,4.2 8.2,4.6 7.4,3.6 7.4,4.8 8.2,3.8" fill="#FFCC00" />
    </svg>
  );
}

function FlagID() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="7.5" fill="#FF0000" />
      <rect y="7.5" width="20" height="7.5" fill="#fff" />
    </svg>
  );
}

function FlagPH() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="7.5" fill="#0038A8" />
      <rect y="7.5" width="20" height="7.5" fill="#CE1126" />
      <polygon points="0,0 0,15 8,7.5" fill="#fff" />
      <circle cx="3.5" cy="7.5" r="1.3" fill="#FCD116" />
    </svg>
  );
}

function FlagVN() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#DA251D" />
      <polygon points="10,4 10.9,6.7 13.8,6.7 11.5,8.4 12.4,11.1 10,9.4 7.6,11.1 8.5,8.4 6.2,6.7 9.1,6.7" fill="#FFFF00" />
    </svg>
  );
}

function FlagNZ() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#00247D" />
      <rect width="9" height="5.5" fill="#00247D" />
      <path d="M0,0 L9,5.5 M9,0 L0,5.5" stroke="#fff" strokeWidth="1.1" />
      <path d="M4.5,0 V5.5 M0,2.75 H9" stroke="#fff" strokeWidth="1.6" />
      <path d="M4.5,0 V5.5 M0,2.75 H9" stroke="#CF142B" strokeWidth="0.8" />
      <circle cx="15" cy="4" r="0.8" fill="#CF142B" stroke="#fff" strokeWidth="0.2" />
      <circle cx="17.3" cy="7" r="0.8" fill="#CF142B" stroke="#fff" strokeWidth="0.2" />
      <circle cx="15.3" cy="10.5" r="0.8" fill="#CF142B" stroke="#fff" strokeWidth="0.2" />
      <circle cx="12.7" cy="8.3" r="0.6" fill="#CF142B" stroke="#fff" strokeWidth="0.2" />
    </svg>
  );
}

function FlagSE() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#006AA7" />
      <rect x="7" width="2.2" height="15" fill="#FECC00" />
      <rect y="6" width="20" height="2.2" fill="#FECC00" />
    </svg>
  );
}

function FlagNO() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#EF2B2D" />
      <rect x="7" width="3" height="15" fill="#fff" />
      <rect y="6.2" width="20" height="3" fill="#fff" />
      <rect x="7.9" width="1.3" height="15" fill="#002868" />
      <rect y="6.9" width="20" height="1.3" fill="#002868" />
    </svg>
  );
}

function FlagDK() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#C60C30" />
      <rect x="7" width="2.2" height="15" fill="#fff" />
      <rect y="6.2" width="20" height="2.2" fill="#fff" />
    </svg>
  );
}

function FlagPL() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="7.5" fill="#fff" />
      <rect y="7.5" width="20" height="7.5" fill="#DC143C" />
    </svg>
  );
}

function FlagCZ() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="7.5" fill="#fff" />
      <rect y="7.5" width="20" height="7.5" fill="#D7141A" />
      <polygon points="0,0 0,15 9,7.5" fill="#11457E" />
    </svg>
  );
}

function FlagIL() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#fff" />
      <rect y="2" width="20" height="1.6" fill="#0038B8" />
      <rect y="11.4" width="20" height="1.6" fill="#0038B8" />
      <polygon points="10,4.5 13,9.8 7,9.8" fill="none" stroke="#0038B8" strokeWidth="0.5" />
      <polygon points="10,10.5 13,5.2 7,5.2" fill="none" stroke="#0038B8" strokeWidth="0.5" />
    </svg>
  );
}

function FlagBR() {
  return (
    <svg {...svgProps}>
      <rect width="20" height="15" fill="#009739" />
      <polygon points="10,2 18,7.5 10,13 2,7.5" fill="#FEDD00" />
      <circle cx="10" cy="7.5" r="2.6" fill="#012169" />
    </svg>
  );
}

const RATE_FLAGS: Record<keyof ExchangeRates, () => JSX.Element> = {
  USD: FlagUS, EUR: FlagEU, CNY: FlagCN, RUB: FlagRU, JPY: FlagJP, KRW: FlagKR, GBP: FlagGB,
  KZT: FlagKZ, HKD: FlagHK, SGD: FlagSG, AUD: FlagAU, CAD: FlagCA, CHF: FlagCH, INR: FlagIN,
  THB: FlagTH, TRY: FlagTR, AED: FlagAE, SAR: FlagSA, MYR: FlagMY, IDR: FlagID, PHP: FlagPH,
  VND: FlagVN, NZD: FlagNZ, SEK: FlagSE, NOK: FlagNO, DKK: FlagDK, PLN: FlagPL, CZK: FlagCZ,
  ILS: FlagIL, BRL: FlagBR,
};

const RATE_ORDER: (keyof ExchangeRates)[] = [
  'USD', 'EUR', 'CNY', 'RUB', 'JPY', 'KRW', 'GBP',
  'KZT', 'HKD', 'SGD', 'AUD', 'CAD', 'CHF', 'INR', 'THB', 'TRY',
  'AED', 'SAR', 'MYR', 'IDR', 'PHP', 'VND', 'NZD', 'SEK', 'NOK',
  'DKK', 'PLN', 'CZK', 'ILS', 'BRL',
];

export default function UtilityBar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_RATES);
  const [openRates, setOpenRates] = useState(false);
  const ratesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = window.setInterval(() => setCurrentDate(new Date()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch('https://api.open-meteo.com/v1/forecast?latitude=47.8864&longitude=106.9057&current_weather=true&timezone=Asia%2FUlaanbaatar', {
      signal: controller.signal,
    })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(json => {
        if (json.current_weather) {
          setWeather({
            temperature: json.current_weather.temperature,
            weatherCode: json.current_weather.weathercode,
          });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetch('/api/exchange-rates')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(json => {
        if (json?.rates?.USD) setRates(json.rates);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ratesRef.current && !ratesRef.current.contains(event.target as Node)) {
        setOpenRates(false);
      }
    };

    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const dateLabel = useMemo(() => formatDateLabel(currentDate), [currentDate]);
  const timeLabel = useMemo(() => formatTimeLabel(currentDate), [currentDate]);

  return (
    <div className="utility">
      <div className="wrap utility-inner">
        <div className="utility-left">
          <span className="utility-date">
            {dateLabel}
          </span>
          <span className="utility-dot">●</span>
          <span className="utility-city">Улаанбаатар</span>
          <span className="utility-weather">
            <span className="utility-weather-icon" aria-hidden="true">☁</span>
            {Math.round(weather?.temperature ?? 25)}°C
          </span>
        </div>

        <div className="utility-right">
          <a href="/weather" className="utility-weather-pill">
            <span className="utility-weather-icon" aria-hidden="true">☁</span>
            Улаанбаатар: {Math.round(weather?.temperature ?? 25)}°C · {weatherLabel(weather?.weatherCode)}
            <span className="utility-caret">›</span>
          </a>

          <div className="utility-rate" ref={ratesRef}>
            <button type="button" className="utility-rate-btn" onClick={() => setOpenRates(v => !v)}>
              <FlagUS />
              <span>USD {rates.USD.toLocaleString()}₮</span>
              <span className="utility-caret">{openRates ? '▴' : '▾'}</span>
            </button>
            {openRates && (
              <div className="utility-rate-menu">
                {RATE_ORDER.map(code => {
                  const Flag = RATE_FLAGS[code];
                  const value = rates[code];
                  return (
                    <div key={code} className="utility-rate-row">
                      <span className="utility-rate-label">
                        <Flag />
                        <strong>{code}</strong>
                      </span>
                      <span>{value.toLocaleString()}₮</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="utility-base" />
    </div>
  );
}
