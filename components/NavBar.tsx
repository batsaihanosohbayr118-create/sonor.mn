import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const navItems = [
  { href: '/', label: 'Нүүр', icon: '⌂' },
  { href: '/politics?cat=uih', label: 'УИХ' },
  { href: '/politics?cat=gov', label: 'Засгийн газар' },
  { href: '/politics?cat=election', label: 'Сонгууль' },
  { href: '/economy', label: 'Эдийн засаг' },
  { href: '/people', label: 'Гишүүд' },
  { href: '/policy', label: 'Редакцийн бодлого' },
];

export default function NavBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const activePath = router.pathname;
  const activeCat = typeof router.query.cat === 'string' ? router.query.cat : '';

  const isActive = (href: string) => {
    if (href === '/') return activePath === '/';
    if (href.startsWith('/politics') && activePath === '/politics') {
      const cat = new URLSearchParams(href.split('?')[1] ?? '').get('cat') ?? '';
      return cat === activeCat;
    }
    return href === activePath || router.asPath === href;
  };

  return (
    <nav className="main">
      <div className="wrap nav-inner">
        <div className="nav-links">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={isActive(item.href) ? 'active' : ''}>
              {item.icon ? <span className="nav-icon">{item.icon}</span> : null}
              {item.label}
            </Link>
          ))}
        </div>

        <button className="nav-toggle" type="button" onClick={() => setOpen(v => !v)} aria-label="Цэс">
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`nav-drawer${open ? ' open' : ''}`}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={isActive(item.href) ? 'active' : ''} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
