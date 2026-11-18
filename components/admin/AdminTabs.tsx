import React, { CSSProperties } from 'react';
import type { Tab } from './types';

export const TABS: { key: Tab; label: string; newLabel: string }[] = [
  { key: 'articles', label: 'Мэдээ', newLabel: 'Шинэ мэдээ' },
  { key: 'mps', label: 'УИХ-ын гишүүд', newLabel: 'Шинэ гишүүн' },
  { key: 'ambassadors', label: 'Элчин сайд', newLabel: 'Шинэ элчин сайд' },
  { key: 'ads', label: 'Сурталчилгаа', newLabel: 'Шинэ сурталчилгаа' },
  { key: 'videos', label: 'Видео', newLabel: 'Шинэ видео' },
  { key: 'facts', label: 'Баримт шалгах', newLabel: 'Шинэ баримт' },
];

const tabStyle = (active: boolean): CSSProperties => ({
  padding: '8px 20px',
  border: 'none',
  borderBottom: active ? '2px solid #3B5BDB' : '2px solid transparent',
  background: 'none',
  fontWeight: active ? 600 : 400,
  color: active ? '#3B5BDB' : '#555',
  cursor: 'pointer',
  fontSize: 14,
  transition: 'color 0.15s',
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

export default function AdminTabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e4e7eb', marginBottom: 24, overflowX: 'auto', scrollbarWidth: 'none' }}>
      {TABS.map(t => (
        <button key={t.key} style={tabStyle(tab === t.key)} type="button" onClick={() => onChange(t.key)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
