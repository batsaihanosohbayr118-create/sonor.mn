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
  USD: number;
  EUR: number;
  CNY: number;
  RUB: number;
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

const CURRENCY_LABELS: Record<keyof ExchangeRates, string> = {
  USD: 'АНУ доллар',
  EUR: 'Евро',
  CNY: 'Хятад юань',
  RUB: 'Оросын рубль',
};

export default function UtilityBar({ toggleSearch }: UtilityBarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState('');
  const [rates, setRates] = useState<ExchangeRates>({ USD: 3577, EUR: 3890, CNY: 492, RUB: 40 });
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
        setRates({
          USD: Math.round(1 / data.rates.USD),
          EUR: Math.round(1 / data.rates.EUR),
          CNY: Math.round(1 / data.rates.CNY),
          RUB: Math.round(1 / data.rates.RUB),
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', padding: 0 }}
            >
              USD {rates.USD.toLocaleString()}₮ {showRates ? '▲' : '▼'}
            </button>

            {showRates && (
              <div className="rates-dropdown" style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '6px',
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: '8px 0',
                minWidth: '200px', zIndex: 100,
              }}>
                {(Object.entries(rates) as [keyof ExchangeRates, number][]).map(([cur, rate]) => (
                  <div key={cur} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 16px', fontSize: '13px', color: '#1a1a2e',
                    borderBottom: cur === 'RUB' ? 'none' : '1px solid #f3f4f6',
                  }}>
                    <span style={{ color: '#6b7280' }}>{cur} <span style={{ fontSize: '11px' }}>({CURRENCY_LABELS[cur]})</span></span>
                    <span style={{ fontWeight: 600 }}>{rate.toLocaleString()}₮</span>
                  </div>
                ))}
                <div style={{ padding: '6px 16px 2px', fontSize: '11px', color: '#9ca3af' }}>
                  * Лавлах ханш — Монголбанк
                </div>
              </div>
            )}
          </div>

          <button className="admin-link" onClick={() => router.push('/admin')} aria-label="Админ хэсэг">Админ</button>
          <button className="searchbtn" onClick={toggleSearch} aria-label="Хайх"><i>⌕</i> Хайх</button>
        </span>
      </div>
    </div>
  );
}