import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import { CATS, Article, SEED_MPS, SEED_AMB, MP, Ad, Video } from '@/data/newsData';
import { isAdminRequest } from '@/lib/adminAuth';
import ConfirmModal from '@/components/ConfirmModal';

type Tab = 'articles' | 'mps' | 'ambassadors' | 'ads' | 'videos';

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

type AmbForm = {
  country: string;
  city: string;
  name: string;
  role: string;
  image?: string;
};

type AdForm = {
  title: string;
  image: string;
  link: string;
  active: boolean;
};

type VideoForm = {
  title: string;
  youtubeId: string;
  active: boolean;
};

const emptyAdForm: AdForm = {
  title: '',
  image: '',
  link: '',
  active: true,
};

const emptyVideoForm: VideoForm = {
  title: '',
  youtubeId: '',
  active: true,
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

const emptyMpForm: Partial<MP> = {
  party: 'МАН',
  pcls: 'man',
  gender: 'M',
  electedYear: 2024,
  attendance: 100,
  laws: 0,
  socials: {},
  committees: [],
  education: [],
  experience: [],
  image: '',
  name: '',
  district: '',
  position: 'УИХ-ын гишүүн',
  bio: '',
  contact: '',
  src: '',
};

const emptyAmbForm: AmbForm = {
  country: '',
  city: '',
  name: '',
  role: 'Элчин сайд',
  image: '',
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

const toAdForm = (ad: Ad): AdForm => ({
  title: ad.title,
  image: ad.image,
  link: ad.link ?? '',
  active: ad.active,
});

const toVideoForm = (video: Video): VideoForm => ({
  title: video.title,
  youtubeId: video.youtubeId,
  active: video.active,
});

// Preview-д ашиглах туслах функц — videosStore.ts дотор байгаа
// extractYoutubeId-ийн ХУУЛБАР (серверийн логиктой ижил байх ёстой).
// Хэрэглэгч бүтэн линк (playlist/timestamp параметртэй ч) буулгасан үед
// preview iframe-д зөв embed URL харуулахын тулд хэрэгтэй.
const extractYoutubeIdClient = (input: string): string => {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '');
    }
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname === '/watch') return url.searchParams.get('v') ?? trimmed;
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/embed/')[1];
      if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/shorts/')[1];
    }
  } catch {
    // URL биш бол доор анхны утгыг буцаана
  }

  return trimmed;
};

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

function SimpleSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
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

const PARTY_OPTIONS = [
  { value: 'МАН', label: 'МАН' },
  { value: 'АН', label: 'АН' },
  { value: 'ХҮН', label: 'ХҮН' },
  { value: 'Бусад', label: 'Бусад (бие даагч)' },
];

const GENDER_OPTIONS = [
  { value: 'M', label: 'Эрэгтэй' },
  { value: 'F', label: 'Эмэгтэй' },
];

const ROLE_OPTIONS = [
  { value: 'Элчин сайд', label: 'Элчин сайд' },
  { value: 'Ерөнхий консул', label: 'Ерөнхий консул' },
  { value: 'Байнгын төлөөлөгч', label: 'Байнгын төлөөлөгч' },
];

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

  // --- Нийтлэг ---
  const [tab, setTab] = useState<Tab>('articles');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  // --- Мэдээ ---
  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- УИХ-ын гишүүд ---
  const [mps, setMps] = useState<MP[]>(SEED_MPS);
  const [mpForm, setMpForm] = useState<Partial<MP>>(emptyMpForm);
  const [selectedMpId, setSelectedMpId] = useState<number | null>(null);

  // --- Элчин сайд ---
  const [ambassadors, setAmbassadors] = useState(SEED_AMB);
  const [ambForm, setAmbForm] = useState<AmbForm>(emptyAmbForm);
  const [selectedAmbIdx, setSelectedAmbIdx] = useState<number | null>(null);

  // --- Сурталчилгаа ---
  const [ads, setAds] = useState<Ad[]>([]);
  const [adForm, setAdForm] = useState<AdForm>(emptyAdForm);
  const [selectedAdId, setSelectedAdId] = useState<number | null>(null);
  const [adsLoading, setAdsLoading] = useState(true);
  const [adsSaving, setAdsSaving] = useState(false);

  // --- Видео ---
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoForm, setVideoForm] = useState<VideoForm>(emptyVideoForm);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videosSaving, setVideosSaving] = useState(false);

  // --- Устгах баталгаажуулах modal ---
  const [confirmState, setConfirmState] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const askConfirm = (message: string, onConfirm: () => void) => {
    setConfirmState({ message, onConfirm });
  };

  const closeConfirm = () => setConfirmState(null);

  // --- Мэдээний computed ---
  const selectedArticle = useMemo(
    () => articles.find(a => a.id === selectedId) ?? null,
    [articles, selectedId],
  );

  const selectedAd = useMemo(
    () => ads.find(a => a.id === selectedAdId) ?? null,
    [ads, selectedAdId],
  );

  const selectedVideo = useMemo(
    () => videos.find(v => v.id === selectedVideoId) ?? null,
    [videos, selectedVideoId],
  );

  const filteredArticles = useMemo(() => {
    const value = query.toLowerCase().trim();
    if (!value) return articles;
    return articles.filter(a =>
      [a.title, a.excerpt, a.author].some(t => t.toLowerCase().includes(value)),
    );
  }, [articles, query]);

  // --- Мэдээ API ---
  const loadArticles = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/articles');
    setLoading(false);
    if (res.status === 401) { router.replace('/admin/login'); return; }
    const json = await res.json();
    setArticles(json.articles ?? []);
  };

  useEffect(() => { loadArticles(); }, []);

  const loadAds = async () => {
    setAdsLoading(true);
    const res = await fetch('/api/admin/ads');
    setAdsLoading(false);
    if (res.status === 401) { router.replace('/admin/login'); return; }
    const json = await res.json();
    setAds(json.ads ?? []);
  };

  useEffect(() => { loadAds(); }, []);

  const loadVideos = async () => {
    setVideosLoading(true);
    const res = await fetch('/api/admin/videos');
    setVideosLoading(false);
    if (res.status === 401) { router.replace('/admin/login'); return; }
    const json = await res.json();
    setVideos(json.videos ?? []);
  };

  useEffect(() => { loadVideos(); }, []);

  const updateField = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) => {
    setForm(cur => ({ ...cur, [key]: value }));
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
    if (json.article) setForm(toForm(json.article));
    setStatus(selectedId ? 'Мэдээ шинэчлэгдлээ.' : 'Шинэ мэдээ нэмэгдлээ.');
  };

  const deleteArticle = (article: Article) => {
    askConfirm(`"${article.title}" мэдээг устгах уу?`, async () => {
      closeConfirm();
      setError(''); setStatus('');
      const res = await fetch(`/api/admin/articles?id=${article.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setError(json?.message ?? 'Устгах үед алдаа гарлаа.'); return; }
      setArticles(json.articles ?? []);
      if (selectedId === article.id) resetForm();
      setStatus('Мэдээ устгагдлаа.');
    });
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  // --- УИХ-ын гишүүн handlers ---
  const saveMp = () => {
    setError(''); setStatus('');
    if (!mpForm.name?.trim()) { setError('Нэрийг оруулна уу.'); return; }
    if (selectedMpId !== null) {
      setMps(prev => prev.map(m => m.id === selectedMpId ? { ...m, ...mpForm } as MP : m));
      setStatus('Гишүүн шинэчлэгдлээ.');
    } else {
      const newId = Math.max(0, ...mps.map(m => m.id)) + 1;
      setMps(prev => [...prev, { ...mpForm, id: newId } as MP]);
      setSelectedMpId(newId);
      setStatus('Шинэ гишүүн нэмэгдлээ.');
    }
  };

  const deleteMp = () => {
    askConfirm(`"${mpForm.name}" гишүүнийг устгах уу?`, () => {
      closeConfirm();
      setMps(prev => prev.filter(m => m.id !== selectedMpId));
      setSelectedMpId(null);
      setMpForm(emptyMpForm);
      setStatus('Гишүүн устгагдлаа.');
    });
  };

  const resetMpForm = () => {
    setSelectedMpId(null);
    setMpForm(emptyMpForm);
    setError(''); setStatus('');
  };

  // --- Элчин сайд handlers ---
  const saveAmb = () => {
    setError(''); setStatus('');
    if (!ambForm.name?.trim() || !ambForm.country?.trim()) {
      setError('Нэр болон улсыг оруулна уу.');
      return;
    }
    if (selectedAmbIdx !== null) {
      setAmbassadors(prev => prev.map((a, i) => i === selectedAmbIdx ? ambForm : a));
      setStatus('Элчин сайд шинэчлэгдлээ.');
    } else {
      setAmbassadors(prev => [...prev, ambForm]);
      setSelectedAmbIdx(ambassadors.length);
      setStatus('Шинэ элчин сайд нэмэгдлээ.');
    }
  };

  const deleteAmb = () => {
    askConfirm(`"${ambForm.name}" элчин сайдыг устгах уу?`, () => {
      closeConfirm();
      setAmbassadors(prev => prev.filter((_, i) => i !== selectedAmbIdx));
      setSelectedAmbIdx(null);
      setAmbForm(emptyAmbForm);
      setStatus('Элчин сайд устгагдлаа.');
    });
  };

  const resetAmbForm = () => {
    setSelectedAmbIdx(null);
    setAmbForm(emptyAmbForm);
    setError(''); setStatus('');
  };

  // --- Сурталчилгаа handlers ---
  const resetAdForm = () => {
    setSelectedAdId(null);
    setAdForm(emptyAdForm);
    setError(''); setStatus('');
  };

  const editAd = (ad: Ad) => {
    setSelectedAdId(ad.id);
    setAdForm(toAdForm(ad));
    setError(''); setStatus('');
  };

  const saveAd = async () => {
    setError(''); setStatus('');
    if (!adForm.title.trim()) { setError('Нэр (тэмдэглэгээ) оруулна уу.'); return; }
    if (!adForm.image.trim()) { setError('Зураг оруулна уу.'); return; }

    setAdsSaving(true);
    const payload = { ...adForm, id: selectedAdId ?? undefined };

    const res = await fetch('/api/admin/ads', {
      method: selectedAdId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);
    setAdsSaving(false);

    if (!res.ok) { setError(json?.message ?? 'Хадгалах үед алдаа гарлаа.'); return; }

    setAds(json.ads ?? []);
    setSelectedAdId(json.ad?.id ?? null);
    if (json.ad) setAdForm(toAdForm(json.ad));
    setStatus(selectedAdId ? 'Сурталчилгаа шинэчлэгдлээ.' : 'Шинэ сурталчилгаа нэмэгдлээ.');
  };

  const deleteAd = (ad: Ad) => {
    askConfirm(`"${ad.title}" сурталчилгааг устгах уу?`, async () => {
      closeConfirm();
      setError(''); setStatus('');
      const res = await fetch(`/api/admin/ads?id=${ad.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setError(json?.message ?? 'Устгах үед алдаа гарлаа.'); return; }
      setAds(json.ads ?? []);
      if (selectedAdId === ad.id) resetAdForm();
      setStatus('Сурталчилгаа устгагдлаа.');
    });
  };

  // --- Видео handlers ---
  const resetVideoForm = () => {
    setSelectedVideoId(null);
    setVideoForm(emptyVideoForm);
    setError(''); setStatus('');
  };

  const editVideo = (video: Video) => {
    setSelectedVideoId(video.id);
    setVideoForm(toVideoForm(video));
    setError(''); setStatus('');
  };

  const saveVideo = async () => {
    setError(''); setStatus('');
    if (!videoForm.title.trim()) { setError('Нэр (тэмдэглэгээ) оруулна уу.'); return; }
    if (!videoForm.youtubeId.trim()) { setError('YouTube линк эсвэл ID оруулна уу.'); return; }

    setVideosSaving(true);
    const payload = { ...videoForm, id: selectedVideoId ?? undefined };

    const res = await fetch('/api/admin/videos', {
      method: selectedVideoId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);
    setVideosSaving(false);

    if (!res.ok) { setError(json?.message ?? 'Хадгалах үед алдаа гарлаа.'); return; }

    setVideos(json.videos ?? []);
    setSelectedVideoId(json.video?.id ?? null);
    if (json.video) setVideoForm(toVideoForm(json.video));
    setStatus(selectedVideoId ? 'Видео шинэчлэгдлээ.' : 'Шинэ видео нэмэгдлээ.');
  };

  const deleteVideoItem = (video: Video) => {
    askConfirm(`"${video.title}" видеог устгах уу?`, async () => {
      closeConfirm();
      setError(''); setStatus('');
      const res = await fetch(`/api/admin/videos?id=${video.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setError(json?.message ?? 'Устгах үед алдаа гарлаа.'); return; }
      setVideos(json.videos ?? []);
      if (selectedVideoId === video.id) resetVideoForm();
      setStatus('Видео устгагдлаа.');
    });
  };

  const tabStyle = (t: Tab) => ({
    padding: '8px 20px',
    border: 'none',
    borderBottom: tab === t ? '2px solid #3B5BDB' : '2px solid transparent',
    background: 'none',
    fontWeight: tab === t ? 600 : 400,
    color: tab === t ? '#3B5BDB' : '#555',
    cursor: 'pointer',
    fontSize: 14,
    transition: 'color 0.15s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  } as React.CSSProperties);

  return (
    <div className="admin-shell">
      <div className="admin-top">
        <div>
          <span className="admin-kicker">Админ</span>
          <h1>Мэдээ удирдах</h1>
        </div>
        <div className="admin-actions">
          {tab === 'articles' && (
            <button className="admin-secondary" type="button" onClick={resetForm}>Шинэ мэдээ</button>
          )}
          {tab === 'mps' && (
            <button className="admin-secondary" type="button" onClick={resetMpForm}>Шинэ гишүүн</button>
          )}
          {tab === 'ambassadors' && (
            <button className="admin-secondary" type="button" onClick={resetAmbForm}>Шинэ элчин сайд</button>
          )}
          {tab === 'ads' && (
            <button className="admin-secondary" type="button" onClick={resetAdForm}>Шинэ сурталчилгаа</button>
          )}
          {tab === 'videos' && (
            <button className="admin-secondary" type="button" onClick={resetVideoForm}>Шинэ видео</button>
          )}
          <button className="admin-secondary" type="button" onClick={logout}>Гарах</button>
        </div>
      </div>

      {/* Табууд */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e4e7eb', marginBottom: 24, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button style={tabStyle('articles')} type="button" onClick={() => { setTab('articles'); setError(''); setStatus(''); }}>
          Мэдээ
        </button>
        <button style={tabStyle('mps')} type="button" onClick={() => { setTab('mps'); setError(''); setStatus(''); }}>
          УИХ-ын гишүүд
        </button>
        <button style={tabStyle('ambassadors')} type="button" onClick={() => { setTab('ambassadors'); setError(''); setStatus(''); }}>
          Элчин сайд
        </button>
        <button style={tabStyle('ads')} type="button" onClick={() => { setTab('ads'); setError(''); setStatus(''); }}>
          Сурталчилгаа
        </button>
        <button style={tabStyle('videos')} type="button" onClick={() => { setTab('videos'); setError(''); setStatus(''); }}>
          Видео
        </button>
      </div>

      {/* ── МЭДЭЭ ── */}
      {tab === 'articles' && (
        <div className="admin-grid">
          <aside className="admin-list">
            <input
              className="admin-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
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
                      {article.image
                        ? <img src={article.image} alt={article.title} />
                        : <span>{CATS[article.cat]?.icon}</span>}
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
                <input value={form.title} onChange={e => updateField('title', e.target.value)} />
              </label>
              <label>
                Ангилал
                <CustomSelect value={form.cat} onChange={v => updateField('cat', v)} />
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
              <label className="wide">
                Зураг URL
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={form.image}
                    onChange={e => updateField('image', e.target.value)}
                    placeholder="https://..."
                    style={{ flex: 1 }}
                  />
                  <label style={{
                    padding: '10px 14px', borderRadius: 8, border: '1px solid #e4e7eb',
                    cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap',
                    background: '#f8f9fa', color: '#16181d',
                  }}>
                    📁 Файл
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append('file', file);
                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                        const data = await res.json();
                        if (data.url) updateField('image', data.url);
                      }}
                    />
                  </label>
                </div>
                {form.image && (
                  <img
                    src={form.image}
                    alt="preview"
                    style={{ marginTop: 8, maxHeight: 160, borderRadius: 8, objectFit: 'cover', width: '100%' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </label>
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

            {error && <p className="admin-error">{error}</p>}
            {status && <p className="admin-success">{status}</p>}

            <div className="admin-submit">
              <button className="admin-primary" type="submit" disabled={saving}>
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── УИХ-ЫН ГИШҮҮД ── */}
      {tab === 'mps' && (
        <div className="admin-grid">
          <aside className="admin-list">
            <div className="admin-count">{mps.length} гишүүн</div>
            <div className="admin-list-items" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {mps.map(mp => (
                <button
                  key={mp.id}
                  className={`admin-list-item ${selectedMpId === mp.id ? 'active' : ''}`}
                  type="button"
                  onClick={() => { setSelectedMpId(mp.id); setMpForm(mp); setError(''); setStatus(''); }}
                >
                  <div className="admin-list-thumb">
                    {mp.image
                      ? <img src={mp.image} alt={mp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span>👤</span>}
                  </div>
                  <div className="admin-list-text">
                    <span>{mp.name}</span>
                    <small>{mp.party} · {mp.district}</small>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div className="admin-editor">
            <div className="admin-editor-head">
              <div>
                <span className="admin-kicker">{selectedMpId !== null ? `#${selectedMpId}` : 'Шинэ'}</span>
                <h2>{selectedMpId !== null ? 'Гишүүн засах' : 'Гишүүн нэмэх'}</h2>
              </div>
              {selectedMpId !== null && (
                <button className="admin-danger" type="button" onClick={deleteMp}>Устгах</button>
              )}
            </div>

            <div className="admin-fields">
              <label className="wide">
                Нэр
                <input value={mpForm.name ?? ''} onChange={e => setMpForm(f => ({ ...f, name: e.target.value }))} />
              </label>
              <label>
                Нам
                <SimpleSelect
                  value={mpForm.party ?? 'МАН'}
                  options={PARTY_OPTIONS}
                  onChange={v => setMpForm(f => ({
                    ...f,
                    party: v,
                    pcls: (v === 'МАН' ? 'man' : v === 'АН' ? 'an' : v === 'ХҮН' ? 'hun' : 'independent') as MP['pcls'],
                  }))}
                />
              </label>
              <label>
                Хүйс
                <SimpleSelect
                  value={mpForm.gender ?? 'M'}
                  options={GENDER_OPTIONS}
                  onChange={v => setMpForm(f => ({ ...f, gender: v as 'M' | 'F' }))}
                />
              </label>
              <label>
                Сонгогдсон он
                <input
                  type="number"
                  value={mpForm.electedYear ?? 2024}
                  onChange={e => setMpForm(f => ({ ...f, electedYear: Number(e.target.value) }))}
                />
              </label>
              <label>
                Тойрог
                <input value={mpForm.district ?? ''} onChange={e => setMpForm(f => ({ ...f, district: e.target.value }))} />
              </label>
              <label className="wide">
                Албан тушаал
                <input value={mpForm.position ?? ''} onChange={e => setMpForm(f => ({ ...f, position: e.target.value }))} />
              </label>
              <label>
                Ирц (%)
                <input
                  type="number"
                  min={0} max={100}
                  value={mpForm.attendance ?? 100}
                  onChange={e => setMpForm(f => ({ ...f, attendance: Number(e.target.value) }))}
                />
              </label>
              <label>
                Хуулийн тоо
                <input
                  type="number"
                  min={0}
                  value={mpForm.laws ?? 0}
                  onChange={e => setMpForm(f => ({ ...f, laws: Number(e.target.value) }))}
                />
              </label>
              <label className="wide">
                Зураг URL
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={mpForm.image ?? ''}
                    onChange={e => setMpForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="https://..."
                    style={{ flex: 1 }}
                  />
                  <label style={{
                    padding: '10px 14px', borderRadius: 8, border: '1px solid #e4e7eb',
                    cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap',
                    background: '#f8f9fa', color: '#16181d',
                  }}>
                    📁 Файл
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append('file', file);
                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                        const data = await res.json();
                        if (data.url) setMpForm(f => ({ ...f, image: data.url }));
                      }}
                    />
                  </label>
                </div>
                {mpForm.image && (
                  <img
                    src={mpForm.image}
                    alt="preview"
                    style={{ marginTop: 8, maxHeight: 160, borderRadius: 8, objectFit: 'cover', width: '100%' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </label>
              <label className="wide">
                Товч намтар
                <textarea rows={3} value={mpForm.bio ?? ''} onChange={e => setMpForm(f => ({ ...f, bio: e.target.value }))} />
              </label>
              <label className="wide">
                Хороонууд (мөр тус бүр)
                <textarea
                  rows={2}
                  value={(mpForm.committees ?? []).join('\n')}
                  onChange={e => setMpForm(f => ({ ...f, committees: e.target.value.split('\n').filter(Boolean) }))}
                />
              </label>
              <label className="wide">
                Боловсрол (мөр тус бүр)
                <textarea
                  rows={2}
                  value={(mpForm.education ?? []).join('\n')}
                  onChange={e => setMpForm(f => ({ ...f, education: e.target.value.split('\n').filter(Boolean) }))}
                />
              </label>
              <label className="wide">
                Туршлага (мөр тус бүр)
                <textarea
                  rows={2}
                  value={(mpForm.experience ?? []).join('\n')}
                  onChange={e => setMpForm(f => ({ ...f, experience: e.target.value.split('\n').filter(Boolean) }))}
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
                <input value={mpForm.contact ?? ''} onChange={e => setMpForm(f => ({ ...f, contact: e.target.value }))} />
              </label>
            </div>

            {error && <p className="admin-error">{error}</p>}
            {status && <p className="admin-success">{status}</p>}

            <div className="admin-submit">
              <button className="admin-primary" type="button" onClick={saveMp}>Хадгалах</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ЭЛЧИН САЙД ── */}
      {tab === 'ambassadors' && (
        <div className="admin-grid">
          <aside className="admin-list">
            <div className="admin-count">{ambassadors.length} элчин сайд</div>
            <div className="admin-list-items" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {ambassadors.map((amb, idx) => (
                <button
                  key={idx}
                  className={`admin-list-item ${selectedAmbIdx === idx ? 'active' : ''}`}
                  type="button"
                  onClick={() => { setSelectedAmbIdx(idx); setAmbForm(amb); setError(''); setStatus(''); }}
                >
                  <div className="admin-list-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {(amb as any).image
                      ? <img src={(amb as any).image} alt={amb.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                      : '🌐'}
                  </div>
                  <div className="admin-list-text">
                    <span>{amb.name}</span>
                    <small>{amb.country} · {amb.city}</small>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div className="admin-editor">
            <div className="admin-editor-head">
              <div>
                <span className="admin-kicker">{selectedAmbIdx !== null ? `#${selectedAmbIdx + 1}` : 'Шинэ'}</span>
                <h2>{selectedAmbIdx !== null ? 'Элчин сайд засах' : 'Элчин сайд нэмэх'}</h2>
              </div>
              {selectedAmbIdx !== null && (
                <button className="admin-danger" type="button" onClick={deleteAmb}>Устгах</button>
              )}
            </div>

            <div className="admin-fields">
              <label className="wide">
                Нэр
                <input value={ambForm.name} onChange={e => setAmbForm(f => ({ ...f, name: e.target.value }))} />
              </label>
              <label>
                Улс
                <input value={ambForm.country} onChange={e => setAmbForm(f => ({ ...f, country: e.target.value }))} />
              </label>
              <label>
                Хот
                <input value={ambForm.city} onChange={e => setAmbForm(f => ({ ...f, city: e.target.value }))} />
              </label>
              <label>
                Албан тушаал
                <SimpleSelect
                  value={ambForm.role}
                  options={ROLE_OPTIONS}
                  onChange={v => setAmbForm(f => ({ ...f, role: v }))}
                />
              </label>
              <label>
                Зураг URL
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={ambForm.image ?? ''}
                    onChange={e => setAmbForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="https://..."
                    style={{ flex: 1 }}
                  />
                  <label style={{
                    padding: '10px 14px', borderRadius: 8, border: '1px solid #e4e7eb',
                    cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap',
                    background: '#f8f9fa', color: '#16181d',
                  }}>
                    📁 Файл
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append('file', file);
                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                        const data = await res.json();
                        if (data.url) setAmbForm(f => ({ ...f, image: data.url }));
                      }}
                    />
                  </label>
                </div>
                {ambForm.image && (
                  <img
                    src={ambForm.image}
                    alt="preview"
                    style={{ marginTop: 8, maxHeight: 160, borderRadius: 8, objectFit: 'cover', width: '100%' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </label>
            </div>

            {error && <p className="admin-error">{error}</p>}
            {status && <p className="admin-success">{status}</p>}

            <div className="admin-submit">
              <button className="admin-primary" type="button" onClick={saveAmb}>Хадгалах</button>
            </div>
          </div>
        </div>
      )}

      {/* ── СУРТАЛЧИЛГАА ── */}
      {tab === 'ads' && (
        <div className="admin-grid">
          <aside className="admin-list">
            <div className="admin-count">{ads.length} сурталчилгаа</div>
            <div className="admin-list-items" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {adsLoading ? (
                <p className="admin-muted">Уншиж байна...</p>
              ) : (
                ads.map(ad => (
                  <button
                    key={ad.id}
                    className={`admin-list-item ${selectedAdId === ad.id ? 'active' : ''}`}
                    type="button"
                    onClick={() => editAd(ad)}
                  >
                    <div className="admin-list-thumb">
                      {ad.image
                        ? <img src={ad.image} alt={ad.title} />
                        : <span>📢</span>}
                    </div>
                    <div className="admin-list-text">
                      <span>{ad.title}</span>
                      <small>{ad.active ? 'Идэвхтэй' : 'Идэвхгүй'}</small>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <div className="admin-editor">
            <div className="admin-editor-head">
              <div>
                <span className="admin-kicker">{selectedAd ? `#${selectedAd.id}` : 'Шинэ'}</span>
                <h2>{selectedAd ? 'Сурталчилгаа засах' : 'Сурталчилгаа нэмэх'}</h2>
              </div>
              {selectedAd && (
                <button className="admin-danger" type="button" onClick={() => deleteAd(selectedAd)}>
                  Устгах
                </button>
              )}
            </div>

            <div className="admin-fields">
              <label className="wide">
                Нэр (зөвхөн admin-д харагдана)
                <input value={adForm.title} onChange={e => setAdForm(f => ({ ...f, title: e.target.value }))} />
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={adForm.active}
                  onChange={e => setAdForm(f => ({ ...f, active: e.target.checked }))}
                />
                Идэвхтэй (вэбсайт дээр харагдана)
              </label>
              <label className="wide">
                Зураг
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={adForm.image}
                    onChange={e => setAdForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="https://..."
                    style={{ flex: 1 }}
                  />
                  <label style={{
                    padding: '10px 14px', borderRadius: 8, border: '1px solid #e4e7eb',
                    cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap',
                    background: '#f8f9fa', color: '#16181d',
                  }}>
                    📁 Файл
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append('file', file);
                        const res = await fetch('/api/upload', { method: 'POST', body: fd });
                        const data = await res.json();
                        if (data.url) setAdForm(f => ({ ...f, image: data.url }));
                      }}
                    />
                  </label>
                </div>
                {adForm.image && (
                  <img
                    src={adForm.image}
                    alt="preview"
                    style={{ marginTop: 8, maxHeight: 160, borderRadius: 8, objectFit: 'cover', width: '100%' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </label>
              <label className="wide">
                Холбоос (заавал биш)
                <input
                  value={adForm.link}
                  onChange={e => setAdForm(f => ({ ...f, link: e.target.value }))}
                  placeholder="https://..."
                />
              </label>
            </div>

            {error && <p className="admin-error">{error}</p>}
            {status && <p className="admin-success">{status}</p>}

            <div className="admin-submit">
              <button className="admin-primary" type="button" onClick={saveAd} disabled={adsSaving}>
                {adsSaving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ВИДЕО ── */}
      {tab === 'videos' && (
        <div className="admin-grid">
          <aside className="admin-list">
            <div className="admin-count">{videos.length} видео</div>
            <div className="admin-list-items" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {videosLoading ? (
                <p className="admin-muted">Уншиж байна...</p>
              ) : (
                videos.map(video => (
                  <button
                    key={video.id}
                    className={`admin-list-item ${selectedVideoId === video.id ? 'active' : ''}`}
                    type="button"
                    onClick={() => editVideo(video)}
                  >
                    <div className="admin-list-thumb">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        onError={e => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                    <div className="admin-list-text">
                      <span>{video.title}</span>
                      <small>{video.active ? 'Идэвхтэй' : 'Идэвхгүй'}</small>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <div className="admin-editor">
            <div className="admin-editor-head">
              <div>
                <span className="admin-kicker">{selectedVideo ? `#${selectedVideo.id}` : 'Шинэ'}</span>
                <h2>{selectedVideo ? 'Видео засах' : 'Видео нэмэх'}</h2>
              </div>
              {selectedVideo && (
                <button className="admin-danger" type="button" onClick={() => deleteVideoItem(selectedVideo)}>
                  Устгах
                </button>
              )}
            </div>

            <div className="admin-fields">
              <label className="wide">
                Нэр (зөвхөн admin-д харагдана)
                <input value={videoForm.title} onChange={e => setVideoForm(f => ({ ...f, title: e.target.value }))} />
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={videoForm.active}
                  onChange={e => setVideoForm(f => ({ ...f, active: e.target.checked }))}
                />
                Идэвхтэй (вэбсайт дээр харагдана)
              </label>
              <label className="wide">
                YouTube линк эсвэл видео ID
                <input
                  value={videoForm.youtubeId}
                  onChange={e => setVideoForm(f => ({ ...f, youtubeId: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=... эсвэл dQw4w9WgXcQ"
                />
              </label>
              {videoForm.youtubeId && (
                <div className="wide" style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYoutubeIdClient(videoForm.youtubeId)}`}
                    title="preview"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {error && <p className="admin-error">{error}</p>}
            {status && <p className="admin-success">{status}</p>}

            <div className="admin-submit">
              <button className="admin-primary" type="button" onClick={saveVideo} disabled={videosSaving}>
                {videosSaving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmState !== null}
        message={confirmState?.message ?? ''}
        onConfirm={() => confirmState?.onConfirm()}
        onCancel={closeConfirm}
      />
    </div>
  );
}