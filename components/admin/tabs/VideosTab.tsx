import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import type { Video } from '@/data/newsData';
import { useAdmin } from '../AdminContext';
import { useAdminList } from '../useAdminList';
import { EditorFooter, EditorHeader, ListItem, ListPanel, tabVisibility } from '../AdminLayout';
import { emptyVideoForm, extractYoutubeIdClient, TabHandle, toVideoForm, VideoForm } from '../types';

const VideosTab = forwardRef<TabHandle, { active: boolean }>(function VideosTab({ active }, ref) {
  const { setError, setStatus, clearMessages, askConfirm } = useAdmin();
  const { items: videos, setItems: setVideos, loading } = useAdminList<Video>('/api/admin/videos', 'videos');

  const [videoForm, setVideoForm] = useState<VideoForm>(emptyVideoForm);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedVideo = useMemo(
    () => videos.find(v => v.id === selectedVideoId) ?? null,
    [videos, selectedVideoId],
  );

  const set = <K extends keyof VideoForm>(key: K, value: VideoForm[K]) => setVideoForm(f => ({ ...f, [key]: value }));

  const resetVideoForm = () => {
    setSelectedVideoId(null);
    setVideoForm(emptyVideoForm);
    clearMessages();
  };

  useImperativeHandle(ref, () => ({ reset: resetVideoForm }));

  const editVideo = (video: Video) => {
    setSelectedVideoId(video.id);
    setVideoForm(toVideoForm(video));
    clearMessages();
  };

  const saveVideo = async () => {
    clearMessages();
    if (!videoForm.title.trim()) { setError('Нэр (тэмдэглэгээ) оруулна уу.'); return; }
    if (!videoForm.youtubeId.trim()) { setError('YouTube линк эсвэл ID оруулна уу.'); return; }

    setSaving(true);
    const res = await fetch('/api/admin/videos', {
      method: selectedVideoId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...videoForm, id: selectedVideoId ?? undefined }),
    });

    const json = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok) { setError(json?.message ?? 'Хадгалах үед алдаа гарлаа.'); return; }

    setVideos(json.videos ?? []);
    setSelectedVideoId(json.video?.id ?? null);
    if (json.video) setVideoForm(toVideoForm(json.video));
    setStatus(selectedVideoId ? 'Видео шинэчлэгдлээ.' : 'Шинэ видео нэмэгдлээ.');
  };

  const deleteVideo = (video: Video) => {
    askConfirm(`"${video.title}" видеог устгах уу?`, async () => {
      clearMessages();
      const res = await fetch(`/api/admin/videos?id=${video.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) { setError(json?.message ?? 'Устгах үед алдаа гарлаа.'); return; }
      setVideos(json.videos ?? []);
      if (selectedVideoId === video.id) resetVideoForm();
      setStatus('Видео устгагдлаа.');
    });
  };

  return (
    <div className="admin-grid" style={tabVisibility(active)}>
      <ListPanel countLabel={`${videos.length} видео`} loading={loading}>
        {videos.map(video => (
          <ListItem
            key={video.id}
            active={selectedVideoId === video.id}
            onClick={() => editVideo(video)}
            thumb={
              <img
                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                alt={video.title}
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            }
            title={video.title}
            subtitle={video.active ? 'Идэвхтэй' : 'Идэвхгүй'}
          />
        ))}
      </ListPanel>

      <div className="admin-editor">
        <EditorHeader
          kicker={selectedVideo ? `#${selectedVideo.id}` : 'Шинэ'}
          title={selectedVideo ? 'Видео засах' : 'Видео нэмэх'}
          onDelete={selectedVideo ? () => deleteVideo(selectedVideo) : undefined}
        />

        <div className="admin-fields">
          <label className="wide">
            Нэр (зөвхөн admin-д харагдана)
            <input value={videoForm.title} onChange={e => set('title', e.target.value)} />
          </label>
          <label className="admin-check">
            <input type="checkbox" checked={videoForm.active} onChange={e => set('active', e.target.checked)} />
            Идэвхтэй (вэбсайт дээр харагдана)
          </label>
          <label className="wide">
            YouTube линк эсвэл видео ID
            <input
              value={videoForm.youtubeId}
              onChange={e => set('youtubeId', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... эсвэл dQw4w9WgXcQ"
            />
          </label>
          {/* Нуугдсан таб дээр iframe ачаалахгүйн тулд active шалгана */}
          {active && videoForm.youtubeId && (
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

        <EditorFooter saving={saving} onSave={saveVideo} />
      </div>
    </div>
  );
});

export default VideosTab;
