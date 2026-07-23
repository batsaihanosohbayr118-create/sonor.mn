import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/politics?search=${encodeURIComponent(value)}` : '/');
  };

  return (
    <header className="masthead">
      <div className="wrap masthead-inner">
        <Link href="/" className="logo-link" aria-label="SONOR NEWS MN">
          <img className="logo" src="/logo/Sonor.png" alt="SONOR NEWS MN" />
          <div className="brand-copy">
            <strong>SONORNEWS.MN</strong>
            <span>ШУУРХАЙ • ИТГЭЛТЭЙ • ХАРИУЦЛАГАТАЙ</span>
          </div>
        </Link>

        <form className="header-search" onSubmit={submitSearch}>
          <input
            type="search"
            placeholder="Хайх..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Мэдээ хайх"
          />
          <button type="submit" aria-label="Хайх">
            ⌕
          </button>
        </form>

        <button
          className="feedback-toggle"
          type="button"
          onClick={() => {
            window.location.href = 'mailto:sonornews@gmail.com?subject=%D0%A1%D0%B0%D0%BD%D0%B0%D0%BB%20%D1%85%D2%AF%D1%81%D1%8D%D0%BB%D1%82';
          }}
        >
          Санал хүсэлт
          <span className="feedback-icon">💬</span>
        </button>
      </div>
    </header>
  );
}
