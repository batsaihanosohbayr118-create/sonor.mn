import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import type { Ad } from '@/data/newsData';
import { useAdmin } from '../AdminContext';
import { useAdminList } from '../useAdminList';
import ImageField from '../ImageField';
import { EditorFooter, EditorHeader, ListItem, ListPanel, tabVisibility } from '../AdminLayout';
import { AdForm, emptyAdForm, TabHandle, toAdForm } from '../types';

const AdsTab = forwardRef<TabHandle, { active: boolean }>(function AdsTab({ active }, ref) {
  const { setError, setStatus, clearMessages, askConfirm } = useAdmin();
  const { items: ads, setItems: setAds, loading } = useAdminList<Ad>('/api/admin/ads', 'ads');

  const [adForm, setAdForm] = useState<AdForm>(emptyAdForm);
  const [selectedAdId, setSelectedAdId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedAd = useMemo(() => ads.find(a => a.id === selectedAdId) ?? null, [ads, selectedAdId]);

  const set = <K extends keyof AdForm>(key: K, value: AdForm[K]) => setAdForm(f => ({ ...f, [key]: value }));

  const resetAdForm = () => {
    setSelectedAdId(null);
    setAdForm(emptyAdForm);
    clearMessages();
  };

  useImperativeHandle(ref, () => ({ reset: resetAdForm }));

  const editAd = (ad: Ad) => {
    setSelectedAdId(ad.id);
    setAdForm(toAdForm(ad));
    clearMessages();
  };

  const saveAd = async () => {
    clearMessages();
    if (!adForm.title.trim()) { setError('Нэр (тэмдэглэгээ) оруулна уу.'); return; }
    if (!adForm.image.trim()) { setError('Зураг оруулна уу.'); return; }

    setSaving(true);
    const res = await fetch('/api/admin/ads', {
      method: selectedAdId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...adForm, id: selectedAdId ?? undefined }),
    });

    const json = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok) { setError(json?.message ?? 'Хадгалах үед алдаа гарлаа.'); return; }

    setAds(json.ads ?? []);
    setSelectedAdId(json.ad?.id ?? null);
    if (json.ad) setAdForm(toAdForm(json.ad));
    setStatus(selectedAdId ? 'Сурталчилгаа шинэчлэгдлээ.' : 'Шинэ сурталчилгаа нэмэгдлээ.');
  };

  const deleteAd = (ad: Ad) => {
    askConfirm(`"${ad.title}" сурталчилгааг устгах уу?`, async () => {
      clearMessages();
      const res = await fetch(`/api/admin/ads?id=${ad.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setError(json?.message ?? 'Устгах үед алдаа гарлаа.'); return; }
      setAds(json.ads ?? []);
      if (selectedAdId === ad.id) resetAdForm();
      setStatus('Сурталчилгаа устгагдлаа.');
    });
  };

  return (
    <div className="admin-grid" style={tabVisibility(active)}>
      <ListPanel countLabel={`${ads.length} сурталчилгаа`} loading={loading}>
        {ads.map(ad => (
          <ListItem
            key={ad.id}
            active={selectedAdId === ad.id}
            onClick={() => editAd(ad)}
            thumb={ad.image ? <img src={ad.image} alt={ad.title} /> : <span>📢</span>}
            title={ad.title}
            subtitle={ad.active ? 'Идэвхтэй' : 'Идэвхгүй'}
          />
        ))}
      </ListPanel>

      <div className="admin-editor">
        <EditorHeader
          kicker={selectedAd ? `#${selectedAd.id}` : 'Шинэ'}
          title={selectedAd ? 'Сурталчилгаа засах' : 'Сурталчилгаа нэмэх'}
          onDelete={selectedAd ? () => deleteAd(selectedAd) : undefined}
        />

        <div className="admin-fields">
          <label className="wide">
            Нэр (зөвхөн admin-д харагдана)
            <input value={adForm.title} onChange={e => set('title', e.target.value)} />
          </label>
          <label className="admin-check">
            <input type="checkbox" checked={adForm.active} onChange={e => set('active', e.target.checked)} />
            Идэвхтэй (вэбсайт дээр харагдана)
          </label>
          <ImageField label="Зураг" value={adForm.image} onChange={v => set('image', v)} />
          <label className="wide">
            Холбоос (заавал биш)
            <input value={adForm.link} onChange={e => set('link', e.target.value)} placeholder="https://..." />
          </label>
        </div>

        <EditorFooter saving={saving} onSave={saveAd} />
      </div>
    </div>
  );
});

export default AdsTab;
