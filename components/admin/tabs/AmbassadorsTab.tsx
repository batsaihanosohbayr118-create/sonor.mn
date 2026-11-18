import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useAdmin } from '../AdminContext';
import { useAdminList } from '../useAdminList';
import SimpleSelect from '../SimpleSelect';
import ImageField from '../ImageField';
import { EditorFooter, EditorHeader, ListItem, ListPanel, tabVisibility } from '../AdminLayout';
import { AmbForm, emptyAmbForm, ROLE_OPTIONS, TabHandle } from '../types';

const AmbassadorsTab = forwardRef<TabHandle, { active: boolean }>(function AmbassadorsTab({ active }, ref) {
  const { setError, setStatus, clearMessages, askConfirm } = useAdmin();
  const { items: ambassadors, setItems: setAmbassadors, loading } =
    useAdminList<AmbForm>('/api/admin/ambassadors', 'ambassadors');

  const [ambForm, setAmbForm] = useState<AmbForm>(emptyAmbForm);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof AmbForm>(key: K, value: AmbForm[K]) => setAmbForm(f => ({ ...f, [key]: value }));

  const resetAmbForm = () => {
    setSelectedIdx(null);
    setAmbForm(emptyAmbForm);
    clearMessages();
  };

  useImperativeHandle(ref, () => ({ reset: resetAmbForm }));

  const saveAmb = async () => {
    clearMessages();
    if (!ambForm.name?.trim() || !ambForm.country?.trim()) {
      setError('Нэр болон улсыг оруулна уу.');
      return;
    }
    setSaving(true);

    const res = await fetch(
      selectedIdx !== null ? `/api/admin/ambassadors?idx=${selectedIdx}` : '/api/admin/ambassadors',
      {
        method: selectedIdx !== null ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ambForm),
      },
    );

    const json = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok) { setError(json?.message ?? 'Хадгалах үед алдаа гарлаа.'); return; }

    setAmbassadors(json.ambassadors ?? []);
    if (selectedIdx === null) {
      setSelectedIdx((json.ambassadors ?? []).length - 1);
    }
    setStatus(selectedIdx !== null ? 'Элчин сайд шинэчлэгдлээ.' : 'Шинэ элчин сайд нэмэгдлээ.');
  };

  const deleteAmb = () => {
    askConfirm(`"${ambForm.name}" элчин сайдыг устгах уу?`, async () => {
      clearMessages();
      const res = await fetch(`/api/admin/ambassadors?idx=${selectedIdx}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setError(json?.message ?? 'Устгах үед алдаа гарлаа.'); return; }
      setAmbassadors(json.ambassadors ?? []);
      setSelectedIdx(null);
      setAmbForm(emptyAmbForm);
      setStatus('Элчин сайд устгагдлаа.');
    });
  };

  return (
    <div className="admin-grid" style={tabVisibility(active)}>
      <ListPanel countLabel={`${ambassadors.length} элчин сайд`} loading={loading}>
        {ambassadors.map((amb, idx) => (
          <ListItem
            key={idx}
            active={selectedIdx === idx}
            onClick={() => { setSelectedIdx(idx); setAmbForm(amb); clearMessages(); }}
            thumbStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}
            thumb={amb.image
              ? (
                <img
                  src={amb.image}
                  alt={amb.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              )
              : '🌐'}
            title={amb.name}
            subtitle={<>{amb.country} · {amb.city}</>}
          />
        ))}
      </ListPanel>

      <div className="admin-editor">
        <EditorHeader
          kicker={selectedIdx !== null ? `#${selectedIdx + 1}` : 'Шинэ'}
          title={selectedIdx !== null ? 'Элчин сайд засах' : 'Элчин сайд нэмэх'}
          onDelete={selectedIdx !== null ? deleteAmb : undefined}
        />

        <div className="admin-fields">
          <label className="wide">
            Нэр
            <input value={ambForm.name} onChange={e => set('name', e.target.value)} />
          </label>
          <label>
            Улс
            <input value={ambForm.country} onChange={e => set('country', e.target.value)} />
          </label>
          <label>
            Хот
            <input value={ambForm.city} onChange={e => set('city', e.target.value)} />
          </label>
          <label>
            Албан тушаал
            <SimpleSelect value={ambForm.role} options={ROLE_OPTIONS} onChange={v => set('role', v)} />
          </label>
          <ImageField value={ambForm.image ?? ''} onChange={v => set('image', v)} />
        </div>

        <EditorFooter saving={saving} onSave={saveAmb} />
      </div>
    </div>
  );
});

export default AmbassadorsTab;
