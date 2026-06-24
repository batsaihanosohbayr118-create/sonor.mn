import React, { useState, useEffect } from 'react';
import { MP } from '@/data/newsData';
import { AmbassadorRecord } from '@/lib/ambassadorsStore';

type Amb = AmbassadorRecord;

export default function People() {
  const [view, setView] = useState<'members' | 'ambassadors'>('members');
  const [selectedMP, setSelectedMP] = useState<MP | null>(null);
  const [selectedAmb, setSelectedAmb] = useState<Amb | null>(null);

  const [mps, setMps] = useState<MP[]>([]);
  const [ambassadors, setAmbassadors] = useState<Amb[]>([]);

  useEffect(() => {
    fetch('/api/admin/mps')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.mps) setMps(d.mps); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/admin/ambassadors')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.ambassadors) setAmbassadors(d.ambassadors); })
      .catch(() => {});
  }, []);

  const members = view === 'members' ? mps : [];
  const amb = view === 'ambassadors' ? ambassadors : [];

  return (
    <>
      <div style={{ marginBottom: 16 }} className="people-filter">
        <button className={view === 'members' ? 'active' : ''} onClick={() => setView('members')}>УИХ-ын гишүүд</button>
        <button className={view === 'ambassadors' ? 'active' : ''} onClick={() => setView('ambassadors')}>Элчин сайд</button>
      </div>

      <div className="people-grid">
        {members.map((mp, idx) => (
          <div className="pcard" key={`${mp.name}-${idx}`} style={{ cursor: 'pointer' }} onClick={() => setSelectedMP(mp)}>
            <div className="pavatar" style={{ overflow: 'hidden', padding: 0 }}>
              {mp.image
                ? <img src={mp.image} alt={mp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : mp.name.slice(0, 2)
              }
            </div>
            <div>
              <div className="pname">{mp.name}</div>
              <div className="prole">{mp.party} · {mp.district}</div>
              <div>{mp.committees.join(', ')}</div>
            </div>
          </div>
        ))}

        {amb.map((a, idx) => (
          <div className="pcard" key={'amb-' + idx} style={{ cursor: 'pointer' }} onClick={() => setSelectedAmb(a)}>
            <div className="pavatar" style={{ overflow: 'hidden', padding: 0 }}>
              {a.image
                ? <img src={a.image} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : a.country.slice(0, 2)
              }
            </div>
            <div>
              <div className="pname">{a.name || a.country}</div>
              <div className="prole">{a.role} · {a.city}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedMP && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setSelectedMP(null)}>
          <div className="detail-modal" style={{
            background: '#fff', borderRadius: '16px', width: 'min(100%, 540px)',
            maxHeight: '80vh', overflowY: 'auto', scrollbarWidth: 'none', padding: '28px'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="pavatar" style={{ width: 56, height: 56, fontSize: 18, minWidth: 56, overflow: 'hidden', padding: 0 }}>
                  {selectedMP.image
                    ? <img src={selectedMP.image} alt={selectedMP.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : selectedMP.name.slice(0, 2)
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '18px', marginBottom: 4 }}>{selectedMP.name}</div>
                  <div style={{ color: '#646b75', fontSize: '13px' }}>{selectedMP.position}</div>
                  <span className={`pbadge ${selectedMP.pcls}`} style={{ marginTop: 6, display: 'inline-block' }}>{selectedMP.party}</span>
                </div>
              </div>
              <button onClick={() => setSelectedMP(null)} style={{
                background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#8b919b', lineHeight: 1
              }}>✕</button>
            </div>

            <div style={{ borderTop: '1px solid #e4e7eb', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b919b', marginBottom: 4 }}>ТОЙРОГ</div>
                <div style={{ fontSize: '14px' }}>{selectedMP.district}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b919b', marginBottom: 4 }}>ХОРОО</div>
                <div style={{ fontSize: '14px' }}>{selectedMP.committees.join(', ')}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b919b', marginBottom: 4 }}>ТОВЧ НАМТАР</div>
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#23262c' }}>{selectedMP.bio}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b919b', marginBottom: 6 }}>БОЛОВСРОЛ</div>
                {selectedMP.education.map((e, i) => (
                  <div key={i} style={{ fontSize: '14px', marginBottom: 4, paddingLeft: 12, borderLeft: '2px solid #e4e7eb' }}>{e}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b919b', marginBottom: 6 }}>ТУРШЛАГА</div>
                {selectedMP.experience.map((e, i) => (
                  <div key={i} style={{ fontSize: '14px', marginBottom: 4, paddingLeft: 12, borderLeft: '2px solid #e4e7eb' }}>{e}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b919b', marginBottom: 4 }}>ИРЦИЙН ХУВЬ</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#1C7C54' }}>{selectedMP.attendance}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b919b', marginBottom: 4 }}>ХУУЛИЙН САНААЧЛАГА</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#3C6086' }}>{selectedMP.laws}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b919b', marginBottom: 4 }}>ХОЛБОО БАРИХ</div>
                <a href={`mailto:${selectedMP.contact}`} style={{ fontSize: '14px', color: '#4E7AA3' }}>{selectedMP.contact}</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAmb && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setSelectedAmb(null)}>
          <div className="detail-modal" style={{
            background: '#fff', borderRadius: '16px', width: 'min(100%, 400px)',
            maxHeight: '80vh', overflowY: 'auto', scrollbarWidth: 'none', padding: '28px'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="pavatar" style={{ width: 56, height: 56, fontSize: 18, minWidth: 56, overflow: 'hidden', padding: 0 }}>
                  {selectedAmb.image
                    ? <img src={selectedAmb.image} alt={selectedAmb.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : selectedAmb.country.slice(0, 2)
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '18px', marginBottom: 4 }}>{selectedAmb.name}</div>
                  <div style={{ color: '#646b75', fontSize: '13px' }}>{selectedAmb.role}</div>
                </div>
              </div>
              <button onClick={() => setSelectedAmb(null)} style={{
                background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#8b919b', lineHeight: 1
              }}>✕</button>
            </div>
            <div style={{ borderTop: '1px solid #e4e7eb', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b919b', marginBottom: 4 }}>УЛС</div>
                <div style={{ fontSize: '15px', fontWeight: 500 }}>{selectedAmb.country}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b919b', marginBottom: 4 }}>ХОТ</div>
                <div style={{ fontSize: '15px' }}>{selectedAmb.city}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#8b919b', marginBottom: 4 }}>АЛБАН ТУШААЛ</div>
                <div style={{ fontSize: '15px' }}>{selectedAmb.role}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}