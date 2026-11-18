import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import type { Fact } from '@/lib/factsStore';
import { useAdmin } from '../AdminContext';
import { useAdminList } from '../useAdminList';
import SimpleSelect from '../SimpleSelect';
import { EditorFooter, EditorHeader, ListItem, ListPanel, tabVisibility } from '../AdminLayout';
import { emptyFactForm, FactForm, TabHandle, toFactForm, VERDICT_OPTIONS } from '../types';

const verdictIcon = (verdict: Fact['verdict']) =>
  verdict === 'true' ? '✅' : verdict === 'false' ? '❌' : '⚠️';

const FactsTab = forwardRef<TabHandle, { active: boolean }>(function FactsTab({ active }, ref) {
  const { setError, setStatus, clearMessages, askConfirm } = useAdmin();
  const { items: facts, setItems: setFacts, loading } = useAdminList<Fact>('/api/admin/facts', 'facts');

  const [factForm, setFactForm] = useState<FactForm>(emptyFactForm);
  const [selectedFactId, setSelectedFactId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedFact = useMemo(
    () => facts.find(f => f.id === selectedFactId) ?? null,
    [facts, selectedFactId],
  );

  const set = <K extends keyof FactForm>(key: K, value: FactForm[K]) => setFactForm(f => ({ ...f, [key]: value }));

  const resetFactForm = () => {
    setSelectedFactId(null);
    setFactForm(emptyFactForm);
    clearMessages();
  };

  useImperativeHandle(ref, () => ({ reset: resetFactForm }));

  const editFact = (fact: Fact) => {
    setSelectedFactId(fact.id);
    setFactForm(toFactForm(fact));
    clearMessages();
  };

  const saveFact = async () => {
    clearMessages();
    if (!factForm.claim.trim()) { setError('Мэдэгдлийг оруулна уу.'); return; }
    if (!factForm.vlabel.trim()) { setError('Шошгыг оруулна уу.'); return; }

    setSaving(true);
    const res = await fetch('/api/admin/facts', {
      method: selectedFactId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...factForm, id: selectedFactId ?? undefined }),
    });

    const json = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok) { setError(json?.message ?? 'Хадгалах үед алдаа гарлаа.'); return; }

    setFacts(json.facts ?? []);
    setSelectedFactId(json.fact?.id ?? null);
    if (json.fact) setFactForm(toFactForm(json.fact));
    setStatus(selectedFactId ? 'Баримт шинэчлэгдлээ.' : 'Шинэ баримт нэмэгдлээ.');
  };

  const deleteFact = (fact: Fact) => {
    askConfirm(`"${fact.vlabel}" баримтыг устгах уу?`, async () => {
      clearMessages();
      const res = await fetch(`/api/admin/facts?id=${fact.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setError(json?.message ?? 'Устгах үед алдаа гарлаа.'); return; }
      setFacts(json.facts ?? []);
      if (selectedFactId === fact.id) resetFactForm();
      setStatus('Баримт устгагдлаа.');
    });
  };

  return (
    <div className="admin-grid" style={tabVisibility(active)}>
      <ListPanel countLabel={`${facts.length} баримт`} loading={loading}>
        {facts.map(fact => (
          <ListItem
            key={fact.id}
            active={selectedFactId === fact.id}
            onClick={() => editFact(fact)}
            thumb={<span>{verdictIcon(fact.verdict)}</span>}
            title={fact.vlabel}
            subtitle={`${fact.claim.slice(0, 40)}...`}
          />
        ))}
      </ListPanel>

      <div className="admin-editor">
        <EditorHeader
          kicker={selectedFact ? `#${selectedFact.id}` : 'Шинэ'}
          title={selectedFact ? 'Баримт засах' : 'Баримт нэмэх'}
          onDelete={selectedFact ? () => deleteFact(selectedFact) : undefined}
        />

        <div className="admin-fields">
          <label className="wide">
            Мэдэгдэл (claim)
            <textarea value={factForm.claim} onChange={e => set('claim', e.target.value)} rows={3} />
          </label>
          <label>
            Дүгнэлт
            <SimpleSelect
              value={factForm.verdict}
              onChange={v => set('verdict', v as FactForm['verdict'])}
              options={VERDICT_OPTIONS}
            />
          </label>
          <label>
            Шошго (vlabel)
            <input
              value={factForm.vlabel}
              onChange={e => set('vlabel', e.target.value)}
              placeholder="Үнэн / Худал / Хагас үнэн"
            />
          </label>
          <label className="wide">
            Тайлбар (exp)
            <textarea value={factForm.exp} onChange={e => set('exp', e.target.value)} rows={4} />
          </label>
        </div>

        <EditorFooter saving={saving} onSave={saveFact} />
      </div>
    </div>
  );
});

export default FactsTab;
