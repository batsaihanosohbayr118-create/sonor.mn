import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import { isAdminRequest } from '@/lib/adminAuth';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (isAdminRequest(req)) {
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!response.ok) {
      const json = await response.json().catch(() => null);
      setError(json?.message ?? 'Нэвтрэх үед алдаа гарлаа.');
      return;
    }

    router.replace('/admin');
  };

  return (
    <div className="admin-auth">
      <form className="admin-auth-box" onSubmit={handleSubmit}>
        <span className="admin-kicker">Сонор.мн</span>
        <h1>Админ нэвтрэх</h1>
        <label>
          Нэвтрэх нэр
          <input value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" />
        </label>
        <label>
          Нууц үг
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            autoComplete="current-password"
            autoFocus
          />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <button className="admin-primary" type="submit" disabled={loading}>
          {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
        </button>
      </form>
    </div>
  );
}
