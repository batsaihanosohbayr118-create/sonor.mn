import React, { FormEvent, forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { CATS, Article } from '@/data/newsData';
import { useAdmin } from '../AdminContext';
import { useAdminList } from '../useAdminList';
import { CategorySelect } from '../SimpleSelect';
import ImageField from '../ImageField';
import { EditorFooter, EditorHeader, ListItem, ListPanel, tabVisibility } from '../AdminLayout';
import { ArticleForm, emptyArticleForm, TabHandle, toArticleForm } from '../types';

const ArticlesTab = forwardRef<TabHandle, { active: boolean }>(function ArticlesTab({ active }, ref) {
  const { setError, setStatus, clearMessages, askConfirm } = useAdmin();
  const { items: articles, setItems: setArticles, loading } = useAdminList<Article>('/api/admin/articles', 'articles');

  const [form, setForm] = useState<ArticleForm>(emptyArticleForm);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedArticle = useMemo(
    () => articles.find(a => a.id === selectedId) ?? null,
    [articles, selectedId],
  );

  const filteredArticles = useMemo(() => {
    const value = query.toLowerCase().trim();
    if (!value) return articles;
    return articles.filter(a =>
      [a.title, a.excerpt, a.author].some(t => t.toLowerCase().includes(value)),
    );
  }, [articles, query]);

  const updateField = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => {
    setForm(cur => ({ ...cur, [key]: value }));
  };

  const resetForm = () => {
    setSelectedId(null);
    setForm(emptyArticleForm);
    clearMessages();
  };

  useImperativeHandle(ref, () => ({ reset: resetForm }));

  const editArticle = (article: Article) => {
    setSelectedId(article.id);
    setForm(toArticleForm(article));
    clearMessages();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    clearMessages();

    const payload = {
      ...form,
      id: selectedId ?? undefined,
      body: form.body.split('\n').map(item => item.trim()).filter(Boolean),
    };

    const res = await fetch('/api/admin/articles', {
      method: selectedId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok) { setError(json?.message ?? 'Хадгалах үед алдаа гарлаа.'); return; }

    setArticles(json.articles ?? []);
    setSelectedId(json.article?.id ?? null);
    if (json.article) setForm(toArticleForm(json.article));
    setStatus(selectedId ? 'Мэдээ шинэчлэгдлээ.' : 'Шинэ мэдээ нэмэгдлээ.');
  };

  const deleteArticle = (article: Article) => {
    askConfirm(`"${article.title}" мэдээг устгах уу?`, async () => {
      clearMessages();
      const res = await fetch(`/api/admin/articles?id=${article.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setError(json?.message ?? 'Устгах үед алдаа гарлаа.'); return; }
      setArticles(json.articles ?? []);
      if (selectedId === article.id) resetForm();
      setStatus('Мэдээ устгагдлаа.');
    });
  };

  return (
    <div className="admin-grid" style={tabVisibility(active)}>
      <ListPanel
        header={
          <input
            className="admin-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Мэдээ хайх"
          />
        }
        countLabel={`${filteredArticles.length} мэдээ`}
        loading={loading}
        hideScrollbar={false}
      >
        {filteredArticles.map(article => (
          <ListItem
            key={article.id}
            active={selectedId === article.id}
            onClick={() => editArticle(article)}
            thumb={article.image
              ? <img src={article.image} alt={article.title} />
              : <span>{CATS[article.cat]?.icon}</span>}
            title={article.title}
            subtitle={<>{CATS[article.cat]?.label ?? article.cat} · {article.time}</>}
          />
        ))}
      </ListPanel>

      <form className="admin-editor" onSubmit={handleSubmit}>
        <EditorHeader
          kicker={selectedArticle ? `#${selectedArticle.id}` : 'Шинэ'}
          title={selectedArticle ? 'Мэдээ засах' : 'Мэдээ нэмэх'}
          onDelete={selectedArticle ? () => deleteArticle(selectedArticle) : undefined}
        />

        <div className="admin-fields">
          <label className="wide">
            Гарчиг
            <input value={form.title} onChange={e => updateField('title', e.target.value)} />
          </label>
          <label>
            Ангилал
            <CategorySelect value={form.cat} onChange={v => updateField('cat', v)} />
          </label>
          <label>
            Нийтлэгч
            <input value={form.author} onChange={e => updateField('author', e.target.value)} />
          </label>
          <label>
            Огноо/цаг
            <input value={form.time} onChange={e => updateField('time', e.target.value)} />
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e => updateField('featured', e.target.checked)}
            />
            Онцлох мэдээ
          </label>
          <ImageField value={form.image} onChange={v => updateField('image', v)} />
          <label className="wide">
            Товч тайлбар
            <textarea rows={3} value={form.excerpt} onChange={e => updateField('excerpt', e.target.value)} />
          </label>
          <label className="wide">
            Үндсэн текст
            <textarea rows={10} value={form.body} onChange={e => updateField('body', e.target.value)} />
          </label>
          <label className="wide">
            Эх сурвалж
            <input value={form.src} onChange={e => updateField('src', e.target.value)} />
          </label>
        </div>

        <EditorFooter saving={saving} />
      </form>
    </div>
  );
});

export default ArticlesTab;
