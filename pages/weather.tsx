import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WEATHER_CODES, WEATHER_LOCATIONS, WeatherLocation } from '@/lib/weather';

interface CurrentWeather {
  temperature: number;
  weathercode: number;
  windspeed: number;
  winddirection: number;
  time: string;
}

interface LocationWeather {
  location: WeatherLocation;
  current: CurrentWeather | null;
  error: boolean;
}

const fetchLocationWeather = async (location: WeatherLocation): Promise<LocationWeather> => {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current_weather: 'true',
    timezone: 'Asia/Ulaanbaatar',
  });

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) throw new Error('Weather request failed');
    const json = await response.json();
    return {
      location,
      current: json.current_weather || null,
      error: !json.current_weather,
    };
  } catch {
    return {
      location,
      current: null,
      error: true,
    };
  }
};

const formatUpdatedTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Шинэчлэгдсэн';
  return date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
};

type WeatherTone = 'sun' | 'cloud' | 'rain' | 'snow' | 'storm';

const TONE_COLORS: Record<WeatherTone, string> = {
  sun: '#D97706',
  cloud: '#64748B',
  rain: '#2563EB',
  snow: '#0891B2',
  storm: '#DC2626',
};

const weatherVisual = (code?: number): { emoji: string; tone: WeatherTone } => {
  if (code === 0) return { emoji: '☀️', tone: 'sun' };
  if ([1, 2].includes(code ?? -1)) return { emoji: '⛅', tone: 'sun' };
  if ([95, 96, 99].includes(code ?? -1)) return { emoji: '⛈️', tone: 'storm' };
  if ([71, 73, 75, 77, 85, 86].includes(code ?? -1)) return { emoji: '🌨️', tone: 'snow' };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code ?? -1)) return { emoji: '🌧️', tone: 'rain' };
  return { emoji: '☁️', tone: 'cloud' };
};

export default function WeatherPage() {
  const [items, setItems] = useState<LocationWeather[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWeather = () => {
    setLoading(true);
    Promise.all(WEATHER_LOCATIONS.map(fetchLocationWeather))
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWeather();
  }, []);

  return (
    <div className="weather-page">
      <div className="weather-head">
        <div className="weather-head-copy">
          <span className="weather-kicker">Одоогийн төлөв</span>
          <h1>Аймгуудын цаг агаар</h1>
          <p>Улаанбаатар болон 21 аймгийн төвийн одоогийн цаг агаар</p>
        </div>
        <button className="weather-refresh" onClick={loadWeather} disabled={loading}>
          {loading ? 'Шинэчилж байна' : 'Шинэчлэх'}
        </button>
      </div>

      <div className="weather-grid">
        {(items.length > 0 ? items : WEATHER_LOCATIONS.map(location => ({ location, current: null, error: false }))).map(item => {
          const current = item.current;
          const label = current ? WEATHER_CODES[current.weathercode] ?? 'Үүлэрхэг' : 'Түр хүлээнэ үү';
          const { emoji, tone } = weatherVisual(current?.weathercode);

          return (
            <Link
              href={`/weather/${item.location.id}`}
              className="weather-card"
              key={item.location.id}
              style={{ ['--tone-color' as string]: TONE_COLORS[tone] }}
            >
              <div className="weather-card-top">
                <div className="weather-card-id">
                  <span className="weather-icon-badge" aria-hidden="true">{emoji}</span>
                  <div>
                    <h2>{item.location.province}</h2>
                    <span>{item.location.center}</span>
                  </div>
                </div>
                <div className="weather-card-temp">
                  <strong>{current ? `${Math.round(current.temperature)}°` : '--'}</strong>
                </div>
              </div>
              <p className="weather-state">{item.error ? 'Мэдээлэл татаж чадсангүй' : label}</p>
              <div className="weather-details">
                <span>Салхи: {current ? `${Math.round(current.windspeed)} км/ц` : '--'}</span>
                <span>{current ? formatUpdatedTime(current.time) : 'Ачаалж байна'}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
