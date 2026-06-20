import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { WEATHER_CODES, WEATHER_LOCATIONS } from '@/lib/weather';

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

const WIND_DIRECTIONS = ['Хойд', 'Хойт-зүүн', 'Зүүн', 'Урд-зүүн', 'Урд', 'Урд-баруун', 'Баруун', 'Хойт-баруун'];

const formatWindDirection = (degrees: number) => {
  const index = Math.round(degrees / 45) % 8;
  return WIND_DIRECTIONS[index];
};

const formatUpdatedTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Шинэчлэгдсэн';
  return date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
};

export default function WeatherDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [extra, setExtra] = useState<HourlyExtra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const location = WEATHER_LOCATIONS.find(item => item.id === id);

  const loadWeather = async () => {
    if (!location) return;
    setLoading(true);
    setError(false);

    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      current_weather: 'true',
      hourly: 'relativehumidity_2m,surface_pressure',
      timezone: 'Asia/Ulaanbaatar',
    });

    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
      if (!response.ok) throw new Error('Weather request failed');
      const json = await response.json();

      setCurrent(json.current_weather || null);

      if (json.current_weather && json.hourly?.time) {
        const targetTime = json.current_weather.time;
        let index = json.hourly.time.indexOf(targetTime);
        if (index === -1) index = 0;
        setExtra({
          humidity: json.hourly.relativehumidity_2m?.[index] ?? null,
          pressure: json.hourly.surface_pressure?.[index] ?? null,
        });
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) loadWeather();
  }, [location?.id]);

  if (!location) {
    return (
      <div className="weather-page">
        <p className="admin-muted">Байршил олдсонгүй.</p>
        <Link href="/weather" className="backlink">← Бүх аймгууд</Link>
      </div>
    );
  }

  const label = current ? WEATHER_CODES[current.weathercode] ?? 'Үүлэрхэг' : 'Түр хүлээнэ үү';

  return (
    <div className="weather-page weather-detail-page">
      <Link href="/weather" className="backlink">← Бүх аймгууд</Link>

      <div className="weather-detail-head">
        <div className="weather-detail-copy">
          <h1>{location.province}</h1>
          <p>{location.center}</p>
        </div>
        <button className="weather-refresh" onClick={loadWeather} disabled={loading}>
          {loading ? 'Шинэчилж байна' : 'Шинэчлэх'}
        </button>
      </div>

      {error && <p className="admin-error">Мэдээлэл татаж чадсангүй.</p>}

      {!error && (
        <div className="weather-detail-card">
          <div className="weather-detail-temp">
            <strong>{current ? `${Math.round(current.temperature)}°C` : '--'}</strong>
            <span>{label}</span>
          </div>

          <div className="weather-detail-grid">
            <div className="weather-detail-item">
              <span>Салхины хурд</span>
              <strong>{current ? `${Math.round(current.windspeed)} км/ц` : '--'}</strong>
            </div>
            <div className="weather-detail-item">
              <span>Салхины чиглэл</span>
              <strong>{current ? formatWindDirection(current.winddirection) : '--'}</strong>
            </div>
            <div className="weather-detail-item">
              <span>Чийгшил</span>
              <strong>{extra?.humidity != null ? `${Math.round(extra.humidity)}%` : '--'}</strong>
            </div>
            <div className="weather-detail-item">
              <span>Даралт</span>
              <strong>{extra?.pressure != null ? `${Math.round(extra.pressure)} hPa` : '--'}</strong>
            </div>
            <div className="weather-detail-item">
              <span>Шинэчлэгдсэн</span>
              <strong>{current ? formatUpdatedTime(current.time) : '--'}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
