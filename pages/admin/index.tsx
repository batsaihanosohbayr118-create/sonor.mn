import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import { isAdminRequest } from '@/lib/adminAuth';
import { AdminProvider, useAdmin } from '@/components/admin/AdminContext';
import AdminTabs, { TABS } from '@/components/admin/AdminTabs';
import type { Tab, TabHandle } from '@/components/admin/types';
import ArticlesTab from '@/components/admin/tabs/ArticlesTab';
import MpsTab from '@/components/admin/tabs/MpsTab';
import AmbassadorsTab from '@/components/admin/tabs/AmbassadorsTab';
import AdsTab from '@/components/admin/tabs/AdsTab';
import VideosTab from '@/components/admin/tabs/VideosTab';
import FactsTab from '@/components/admin/tabs/FactsTab';

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
  return (
    <AdminProvider>
      <AdminDashboard />
    </AdminProvider>
  );
}

function AdminDashboard() {
  const router = useRouter();
  const { clearMessages } = useAdmin();
  const [tab, setTab] = useState<Tab>('articles');
  const tabRefs = useRef<Partial<Record<Tab, TabHandle | null>>>({});

  const bindRef = (key: Tab) => (handle: TabHandle | null) => {
    tabRefs.current[key] = handle;
  };

  const changeTab = (next: Tab) => {
    setTab(next);
    clearMessages();
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  const current = TABS.find(t => t.key === tab);

  return (
    <div className="admin-shell">
      <div className="admin-top">
        <div>
          <span className="admin-kicker">Админ</span>
          <h1>Мэдээ удирдах</h1>
        </div>
        <div className="admin-actions">
          {current && (
            <button className="admin-secondary" type="button" onClick={() => tabRefs.current[tab]?.reset()}>
              {current.newLabel}
            </button>
          )}
          <button className="admin-secondary" type="button" onClick={logout}>Гарах</button>
        </div>
      </div>

      <AdminTabs tab={tab} onChange={changeTab} />

      {/* Бүх таб mount хэвээр (state хадгалагдана), зөвхөн идэвхтэй нь харагдана */}
      <ArticlesTab ref={bindRef('articles')} active={tab === 'articles'} />
      <MpsTab ref={bindRef('mps')} active={tab === 'mps'} />
      <AmbassadorsTab ref={bindRef('ambassadors')} active={tab === 'ambassadors'} />
      <AdsTab ref={bindRef('ads')} active={tab === 'ads'} />
      <VideosTab ref={bindRef('videos')} active={tab === 'videos'} />
      <FactsTab ref={bindRef('facts')} active={tab === 'facts'} />
    </div>
  );
}
