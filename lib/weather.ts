export interface WeatherLocation {
  id: string;
  province: string;
  center: string;
  latitude: number;
  longitude: number;
}

export const WEATHER_CODES: Record<number, string> = {
  0: 'Цэлмэг',
  1: 'Бага зэрэг үүлтэй',
  2: 'Хагас үүлтэй',
  3: 'Үүлэрхэг',
  45: 'Манантай',
  48: 'Цантсан манантай',
  51: 'Шиврээ бороо',
  53: 'Дунд зэргийн шиврээ',
  55: 'Их шиврээ',
  56: 'Мөстэй шиврээ',
  57: 'Их мөстэй шиврээ',
  61: 'Бага бороо',
  63: 'Бороо',
  65: 'Их бороо',
  66: 'Мөстэй бороо',
  67: 'Их мөстэй бороо',
  71: 'Бага цас',
  73: 'Цас',
  75: 'Их цас',
  77: 'Цасан ширхэг',
  80: 'Аадар бороо',
  81: 'Дунд зэргийн аадар',
  82: 'Их аадар',
  85: 'Цасан аадар',
  86: 'Их цасан аадар',
  95: 'Аянгатай',
  96: 'Аянга, мөндөртэй',
  99: 'Хүчтэй аянга, мөндөртэй',
};

export const WEATHER_LOCATIONS: WeatherLocation[] = [
  { id: 'ulaanbaatar', province: 'Улаанбаатар', center: 'Улаанбаатар', latitude: 47.8864, longitude: 106.9057 },
  { id: 'arkhangai', province: 'Архангай', center: 'Цэцэрлэг', latitude: 47.475, longitude: 101.4542 },
  { id: 'bayan-ulgii', province: 'Баян-Өлгий', center: 'Өлгий', latitude: 48.9683, longitude: 89.9625 },
  { id: 'bayankhongor', province: 'Баянхонгор', center: 'Баянхонгор', latitude: 46.1944, longitude: 100.7181 },
  { id: 'bulgan', province: 'Булган', center: 'Булган', latitude: 48.8125, longitude: 103.5347 },
  { id: 'govi-altai', province: 'Говь-Алтай', center: 'Алтай', latitude: 46.3722, longitude: 96.2583 },
  { id: 'govisumber', province: 'Говьсүмбэр', center: 'Чойр', latitude: 46.3611, longitude: 108.3611 },
  { id: 'darkhan-uul', province: 'Дархан-Уул', center: 'Дархан', latitude: 49.4867, longitude: 105.9228 },
  { id: 'dornogovi', province: 'Дорноговь', center: 'Сайншанд', latitude: 44.8824, longitude: 110.1163 },
  { id: 'dornod', province: 'Дорнод', center: 'Чойбалсан', latitude: 48.0726, longitude: 114.5326 },
  { id: 'dundgovi', province: 'Дундговь', center: 'Мандалговь', latitude: 45.7625, longitude: 106.2708 },
  { id: 'zavkhan', province: 'Завхан', center: 'Улиастай', latitude: 47.7417, longitude: 96.8444 },
  { id: 'orkhon', province: 'Орхон', center: 'Эрдэнэт', latitude: 49.0275, longitude: 104.0444 },
  { id: 'uvurkhangai', province: 'Өвөрхангай', center: 'Арвайхээр', latitude: 46.2639, longitude: 102.775 },
  { id: 'umnugovi', province: 'Өмнөговь', center: 'Даланзадгад', latitude: 43.5708, longitude: 104.425 },
  { id: 'sukhbaatar', province: 'Сүхбаатар', center: 'Баруун-Урт', latitude: 46.6806, longitude: 113.2792 },
  { id: 'selenge', province: 'Сэлэнгэ', center: 'Сүхбаатар', latitude: 50.2364, longitude: 106.2064 },
  { id: 'tuv', province: 'Төв', center: 'Зуунмод', latitude: 47.7069, longitude: 106.9528 },
  { id: 'uvs', province: 'Увс', center: 'Улаангом', latitude: 49.9811, longitude: 92.0667 },
  { id: 'khovd', province: 'Ховд', center: 'Ховд', latitude: 48.0056, longitude: 91.6419 },
  { id: 'khuvsgul', province: 'Хөвсгөл', center: 'Мөрөн', latitude: 49.6342, longitude: 100.1625 },
  { id: 'khentii', province: 'Хэнтий', center: 'Чингис', latitude: 47.3194, longitude: 110.6556 },
];
