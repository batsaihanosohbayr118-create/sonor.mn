import React, { ChangeEvent } from 'react';

type Props = {
  label?: string;
  value: string;
  onChange: (url: string) => void;
};

/** Зураг URL оруулах + файл upload хийх + урьдчилан харах талбар. */
export default function ImageField({ label = 'Зураг URL', value, onChange }: Props) {
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) onChange(data.url);
  };

  return (
    <label className="wide">
      {label}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://..."
          style={{ flex: 1 }}
        />
        <label style={{
          padding: '10px 14px', borderRadius: 8, border: '1px solid #e4e7eb',
          cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap',
          background: '#f8f9fa', color: '#16181d',
        }}>
          📁 Файл
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        </label>
      </div>
      {value && (
        <img
          src={value}
          alt="preview"
          style={{ marginTop: 8, maxHeight: 160, borderRadius: 8, objectFit: 'cover', width: '100%' }}
          onError={e => (e.currentTarget.style.display = 'none')}
        />
      )}
    </label>
  );
}
