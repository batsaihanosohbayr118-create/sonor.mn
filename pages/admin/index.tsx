import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import { CATS, Article } from '@/data/newsData';
import { isAdminRequest } from '@/lib/adminAuth';

type ArticleForm = {
  id?: number;
  cat: string;
  featured: boolean;
  title: string;
  excerpt: string;
  author: string;
  time: string;
  image: string;
  body: string;
  src: string;
};

const emptyForm: ArticleForm = {
  cat: 'uih',
  featured: false,
  title: '',
  excerpt: '',
  author: 'Редакц',
  time: 'Саяхан',
  image: '',
  body: '',
  src: 'Эх сурвалж: Сонор.мн',
};

const toForm = (article: Article): ArticleForm => ({
  id: article.id,
  cat: article.cat,
  featured: Boolean(article.featured),
  title: article.title,
  excerpt: article.excerpt,
  author: article.author,
  time: article.time,
  image: article.image ?? '',
  body: article.body.join('\n\n'),
  src: article.src,
});

function CustomSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);

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
        {CATS[value]?.label ?? value}
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
          {Object.entries(CATS).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => { onChange(key); setOpen(false); }}
              style={{
                width: '100%',
                textAlign: 'left',
                border: 'none',
                borderBottom: '1px solid #f0f2f4',
                padding: '10px 14px',
                background: value === key ? 'rgba(78,122,163,0.07)' : '#fff',
                color: value === key ? '#3C6086' : '#16181d',
                font: 'inherit',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: value === key ? 600 : 400,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(78,122,163,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = value === key ? 'rgba(78,122,163,0.07)' : '#fff')}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!isAdminRequest(req)) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
  return { props: {} };
};

export default function AdminPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedArticle = useMemo(
    () => articles.find(article => article.id === selectedId) ?? null,
    [articles, selectedId],
  );

  const filteredArticles = useMemo(() => {
    const value = query.toLowerCase().trim();
    if (!value) return articles;
    return articles.filter(article =>
      [article.title, article.excerpt, article.author].some(text => text.toLowerCase().includes(value)),
    );
  }, [articles, query]);

  const loadArticles = async () => {
    setLoading(true);
    const response = await fetch('/api/admin/articles');
    setLoading(false);

    if (response.status === 401) {
      router.replace('/admin/login');
      return;
    }

    const json = await response.json();
    setArticles(json.articles ?? []);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const updateField = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setSelectedId(null);
    setForm(emptyForm);
    setError('');
    setStatus('');
  };

  const editArticle = (article: Article) => {
    setSelectedId(article.id);
    setForm(toForm(article));
    setError('');
    setStatus('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setStatus('');

    const payload = {
      ...form,
      id: selectedId ?? undefined,
      body: form.body.split('\n').map(item => item.trim()).filter(Boolean),
    };

    const response = await fetch('/api/admin/articles', {
      method: selectedId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok) {
      setError(json?.message ?? 'Хадгалах үед алдаа гарлаа.');
      return;
    }

    setArticles(json.articles ?? []);
    setSelectedId(json.article?.id ?? null);
    if (json.article) setForm(toForm(json.article));
    setStatus(selectedId ? 'Мэдээ шинэчлэгдлээ.' : 'Шинэ мэдээ нэмэгдлээ.');
  };

  const deleteArticle = async (article: Article) => {
    if (!window.confirm(`"${article.title}" мэдээг устгах уу?`)) return;

    setError('');
    setStatus('');

    const response = await fetch(`/api/admin/articles?id=${article.id}`, { method: 'DELETE' });
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      setError(json?.message ?? 'Устгах үед алдаа гарлаа.');
      return;
    }

    setArticles(json.articles ?? []);
    if (selectedId === article.id) resetForm();
    setStatus('Мэдээ устгагдлаа.');
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  return (
    <div className="admin-shell">
      <div className="admin-top">
        <div>
          <span className="admin-kicker">Админ</span>
          <h1>Мэдээ удирдах</h1>
        </div>
        <div className="admin-actions">
          <button className="admin-secondary" type="button" onClick={resetForm}>Шинэ мэдээ</button>
          <button className="admin-secondary" type="button" onClick={logout}>Гарах</button>
        </div>
      </div>

      <div className="admin-grid">
        <aside className="admin-list">
          <input
            className="admin-search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Мэдээ хайх"
          />
          <div className="admin-count">{filteredArticles.length} мэдээ</div>
          <div className="admin-list-items">
            {loading ? (
              <p className="admin-muted">Уншиж байна...</p>
            ) : (
              filteredArticles.map(article => (
                <button
                  className={`admin-list-item ${selectedId === article.id ? 'active' : ''}`}
                  key={article.id}
                  type="button"
                  onClick={() => editArticle(article)}
                >
                  <div className="admin-list-thumb">
                    {article.image ? (
                      <img src={article.image} alt={article.title} />
                    ) : (
                      <span>{CATS[article.cat]?.icon}</span>
                    )}
                  </div>
                  <div className="admin-list-text">
                    <span>{article.title}</span>
                    <small>{CATS[article.cat]?.label ?? article.cat} · {article.time}</small>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <form className="admin-editor" onSubmit={handleSubmit}>
          <div className="admin-editor-head">
            <div>
              <span className="admin-kicker">{selectedArticle ? `#${selectedArticle.id}` : 'Шинэ'}</span>
              <h2>{selectedArticle ? 'Мэдээ засах' : 'Мэдээ нэмэх'}</h2>
            </div>
            {selectedArticle && (
              <button className="admin-danger" type="button" onClick={() => deleteArticle(selectedArticle)}>
                Устгах
              </button>
            )}
          </div>

          <div className="admin-fields">
            <label className="wide">
              Гарчиг
              <input value={form.title} onChange={event => updateField('title', event.target.value)} />
            </label>
            <label>
              Ангилал
              <CustomSelect value={form.cat} onChange={v => updateField('cat', v)} />
            </label>
            <label>
              Нийтлэгч
              <input value={form.author} onChange={event => updateField('author', event.target.value)} />
            </label>
            <label>
              Огноо/цаг
              <input value={form.time} onChange={event => updateField('time', event.target.value)} />
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={event => updateField('featured', event.target.checked)}
              />
              Онцлох мэдээ
            </label>
            <label className="wide">
              Зураг URL
              <input value={form.image} onChange={event => updateField('image', event.target.value)} />
            </label>
            <label className="wide">
              Товч тайлбар
              <textarea rows={3} value={form.excerpt} onChange={event => updateField('excerpt', event.target.value)} />
            </label>
            <label className="wide">
              Үндсэн текст
              <textarea rows={10} value={form.body} onChange={event => updateField('body', event.target.value)} />
            </label>
            <label className="wide">
              Эх сурвалж
              <input value={form.src} onChange={event => updateField('src', event.target.value)} />
            </label>
          </div>

          {error && <p className="admin-error">{error}</p>}
          {status && <p className="admin-success">{status}</p>}

          <div className="admin-submit">
            <button className="admin-primary" type="submit" disabled={saving}>
              {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}