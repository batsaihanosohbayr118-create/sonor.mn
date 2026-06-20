import React, { useEffect, useState } from 'react';
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

export default function UtilityBar({ toggleSearch }: UtilityBarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState('');

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
      .then(response => {
        if (!response.ok) throw new Error('Weather fetch failed');
        return response.json();
      })
      .then(json => {
        if (json.current_weather) {
          setWeather({
            temperature: json.current_weather.temperature,
            weatherCode: json.current_weather.weathercode,
            windSpeed: json.current_weather.windspeed,
            windDirection: json.current_weather.winddirection,
          });
        } else {
          setWeatherError('Цаг агаарын мэдээлэл олдсонгүй');
        }
      })
      .catch(() => {
        setWeatherError('Цаг агаарын мэдээлэл олдсонгүй');
      });
    return () => controller.abort();
  }, []);

  const openWeatherPage = () => router.push('/weather');

  const handleWeatherKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openWeatherPage();
    }
  };

  const todayLabel = currentDate
    ? `${formatDateLabel(currentDate)} · Улаанбаатар · ${formatTimeLabel(currentDate)}`
    : 'Улаанбаатар';

  return (
    <div className="utility">
      <div className="wrap">
        <span id="today">{todayLabel}</span>
        <span className="right">
          <div
            className="weather-toggle"
            role="button"
            tabIndex={0}
            aria-label="Аймгуудын цаг агаар харах"
            onClick={openWeatherPage}
            onKeyDown={handleWeatherKeyDown}
          >
            <span>{weatherError || getWeatherSummary(weather)}</span>
            <small>›</small>
          </div>
          <span>USD 3,420₮</span>
          <button className="admin-link" onClick={() => router.push('/admin')} aria-label="Админ хэсэг">
            Админ
          </button>
          <button className="searchbtn" onClick={toggleSearch} aria-label="Хайх"><i>⌕</i> Хайх</button>
        </span>
      </div>
    </div>
  );
}
