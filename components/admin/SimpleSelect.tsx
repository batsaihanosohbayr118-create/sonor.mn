import React, { useState } from 'react';
import { CATS } from '@/data/newsData';
import type { Option } from './types';

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
};

export default function SimpleSelect({ value, onChange, options }: Props) {
  const [open, setOpen] = useState(false);
  const label = options.find(o => o.value === value)?.label ?? value;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          textAlign: 'left',
          border: '1px solid #e4e7eb',
          borderRadius: '8px',
          padding: '10px 12px',
          background: '#fff',
          color: '#16181d',
          font: 'inherit',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {label}
        <span style={{ color: '#8b919b', fontSize: '12px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #e4e7eb',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          zIndex: 200,
          overflow: 'hidden',
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                width: '100%',
                textAlign: 'left',
                border: 'none',
                borderBottom: '1px solid #f0f2f4',
                padding: '10px 14px',
                background: value === opt.value ? 'rgba(78,122,163,0.07)' : '#fff',
                color: value === opt.value ? '#3C6086' : '#16181d',
                font: 'inherit',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: value === opt.value ? 600 : 400,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(78,122,163,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = value === opt.value ? 'rgba(78,122,163,0.07)' : '#fff')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const CATEGORY_OPTIONS: Option[] = Object.entries(CATS).map(([key, cat]) => ({ value: key, label: cat.label }));

/** Мэдээний ангилал сонгогч (CATS-аас). */
export function CategorySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <SimpleSelect value={value} onChange={onChange} options={CATEGORY_OPTIONS} />;
}
