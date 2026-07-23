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
}

const DEFAULT_RATES: ExchangeRates = {
  USD: 3610,
  EUR: 3890,
  CNY: 492,
  RUB: 40,
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

function FlagUS() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" width="20" height="15" style={{ display: 'block', borderRadius: 2, flexShrink: 0 }}>
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
            <i className="icon-calendar" aria-hidden="true">🗓</i>
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
                {([
                  ['USD', rates.USD],
                  ['EUR', rates.EUR],
                  ['CNY', rates.CNY],
                  ['RUB', rates.RUB],
                ] as const).map(([code, value]) => (
                  <div key={code} className="utility-rate-row">
                    <strong>{code}</strong>
                    <span>{value.toLocaleString()}₮</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="utility-base" />
    </div>
  );
}
