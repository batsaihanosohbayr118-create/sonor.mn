import React, { forwardRef, useImperativeHandle, useState } from 'react';
import type { MP } from '@/data/newsData';
import { useAdmin } from '../AdminContext';
import { useAdminList } from '../useAdminList';
import SimpleSelect from '../SimpleSelect';
import ImageField from '../ImageField';
import { EditorFooter, EditorHeader, ListItem, ListPanel, tabVisibility } from '../AdminLayout';
import { emptyMpForm, GENDER_OPTIONS, PARTY_OPTIONS, partyToPcls, TabHandle } from '../types';

const MpsTab = forwardRef<TabHandle, { active: boolean }>(function MpsTab({ active }, ref) {
  const { setError, setStatus, clearMessages, askConfirm } = useAdmin();
  const { items: mps, setItems: setMps, loading } = useAdminList<MP>('/api/admin/mps', 'mps');

  const [mpForm, setMpForm] = useState<Partial<MP>>(emptyMpForm);
  const [selectedMpId, setSelectedMpId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof MP>(key: K, value: MP[K]) => setMpForm(f => ({ ...f, [key]: value }));
  const lines = (value: string) => value.split('\n').filter(Boolean);

  const resetMpForm = () => {
    setSelectedMpId(null);
    setMpForm(emptyMpForm);
    clearMessages();
  };

  useImperativeHandle(ref, () => ({ reset: resetMpForm }));

  const saveMp = async () => {
    clearMessages();
    if (!mpForm.name?.trim()) { setError('Нэрийг оруулна уу.'); return; }
    setSaving(true);

    const res = await fetch('/api/admin/mps', {
      method: selectedMpId !== null ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...mpForm, id: selectedMpId ?? undefined }),
    });

    const json = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok) { setError(json?.message ?? 'Хадгалах үед алдаа гарлаа.'); return; }

    setMps(json.mps ?? []);
    setSelectedMpId(json.mp?.id ?? null);
    if (json.mp) setMpForm(json.mp);
    setStatus(selectedMpId !== null ? 'Гишүүн шинэчлэгдлээ.' : 'Шинэ гишүүн нэмэгдлээ.');
  };

  const deleteMp = () => {
    askConfirm(`"${mpForm.name}" гишүүнийг устгах уу?`, async () => {
      clearMessages();
      const res = await fetch(`/api/admin/mps?id=${selectedMpId}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setError(json?.message ?? 'Устгах үед алдаа гарлаа.'); return; }
      setMps(json.mps ?? []);
      setSelectedMpId(null);
      setMpForm(emptyMpForm);
      setStatus('Гишүүн устгагдлаа.');
    });
  };

  return (
    <div className="admin-grid" style={tabVisibility(active)}>
      <ListPanel countLabel={`${mps.length} гишүүн`} loading={loading}>
        {mps.map(mp => (
          <ListItem
            key={mp.id}
            active={selectedMpId === mp.id}
            onClick={() => { setSelectedMpId(mp.id); setMpForm(mp); clearMessages(); }}
            thumb={mp.image
              ? <img src={mp.image} alt={mp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span>👤</span>}
            title={mp.name}
            subtitle={<>{mp.party} · {mp.district}</>}
          />
        ))}
      </ListPanel>

      <div className="admin-editor">
        <EditorHeader
          kicker={selectedMpId !== null ? `#${selectedMpId}` : 'Шинэ'}
          title={selectedMpId !== null ? 'Гишүүн засах' : 'Гишүүн нэмэх'}
          onDelete={selectedMpId !== null ? deleteMp : undefined}
        />

        <div className="admin-fields">
          <label className="wide">
            Нэр
            <input value={mpForm.name ?? ''} onChange={e => set('name', e.target.value)} />
          </label>
          <label>
            Нам
            <SimpleSelect
              value={mpForm.party ?? 'МАН'}
              options={PARTY_OPTIONS}
              onChange={v => setMpForm(f => ({ ...f, party: v, pcls: partyToPcls(v) }))}
            />
          </label>
          <label>
            Хүйс
            <SimpleSelect
              value={mpForm.gender ?? 'M'}
              options={GENDER_OPTIONS}
              onChange={v => set('gender', v as MP['gender'])}
            />
          </label>
          <label>
            Сонгогдсон он
            <input
              type="number"
              value={mpForm.electedYear ?? 2024}
              onChange={e => set('electedYear', Number(e.target.value))}
            />
          </label>
          <label>
            Тойрог
            <input value={mpForm.district ?? ''} onChange={e => set('district', e.target.value)} />
          </label>
          <label className="wide">
            Албан тушаал
            <input value={mpForm.position ?? ''} onChange={e => set('position', e.target.value)} />
          </label>
          <label>
            Ирц (%)
            <input
              type="number"
              min={0} max={100}
              value={mpForm.attendance ?? 100}
              onChange={e => set('attendance', Number(e.target.value))}
            />
          </label>
          <label>
            Хуулийн тоо
            <input
              type="number"
              min={0}
              value={mpForm.laws ?? 0}
              onChange={e => set('laws', Number(e.target.value))}
            />
          </label>
          <ImageField value={mpForm.image ?? ''} onChange={v => set('image', v)} />
          <label className="wide">
            Товч намтар
            <textarea rows={3} value={mpForm.bio ?? ''} onChange={e => set('bio', e.target.value)} />
          </label>
          <label className="wide">
            Хороонууд (мөр тус бүр)
            <textarea
              rows={2}
              value={(mpForm.committees ?? []).join('\n')}
              onChange={e => set('committees', lines(e.target.value))}
            />
          </label>
          <label className="wide">
            Боловсрол (мөр тус бүр)
            <textarea
              rows={2}
              value={(mpForm.education ?? []).join('\n')}
              onChange={e => set('education', lines(e.target.value))}
            />
          </label>
          <label className="wide">
            Туршлага (мөр тус бүр)
            <textarea
              rows={2}
              value={(mpForm.experience ?? []).join('\n')}
              onChange={e => set('experience', lines(e.target.value))}
            />
          </label>
          <label>
            Facebook URL
            <input
              value={mpForm.socials?.fb ?? ''}
              onChange={e => setMpForm(f => ({ ...f, socials: { ...f.socials, fb: e.target.value } }))}
            />
          </label>
          <label>
            X (Twitter) URL
            <input
              value={mpForm.socials?.x ?? ''}
              onChange={e => setMpForm(f => ({ ...f, socials: { ...f.socials, x: e.target.value } }))}
            />
          </label>
          <label className="wide">
            Холбоо барих (и-мэйл)
            <input value={mpForm.contact ?? ''} onChange={e => set('contact', e.target.value)} />
          </label>
        </div>

        <EditorFooter saving={saving} onSave={saveMp} />
      </div>
    </div>
  );
});

export default MpsTab;
