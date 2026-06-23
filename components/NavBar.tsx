import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavBarProps {
  closeSearch: () => void;
}

const navItems = [
  { href: '/', label: 'Нүүр' },
  { href: '/politics?cat=uih', label: 'УИХ', cat: 'uih' },
  { href: '/politics?cat=gov', label: 'Засгийн газар', cat: 'gov' },
  { href: '/politics?cat=election', label: 'Сонгууль', cat: 'election' },
  { href: '/politics?cat=economy', label: 'Эдийн засаг', cat: 'economy' },
  { href: '/people', label: 'Гишүүд' },
  { href: '/policy', label: 'Редакцийн бодлого' },
];

export default function NavBar({ closeSearch }: NavBarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const activePath = router.pathname;
  const activeCat = typeof router.query.cat === 'string' ? router.query.cat : '';

  const isActive = (href: string, cat?: string) => {
    if (href === '/') return activePath === '/';
    if (href.startsWith('/politics') && activePath === '/politics') {
      return !!cat ? activeCat === cat : !activeCat;
    }
    return href === router.asPath;
  };

  const handleClick = () => {
    setOpen(false);
    closeSearch();
  };

  return (
    <nav className="main">
      {/* Desktop nav */}
      <div className="wrap" id="nav">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} legacyBehavior>
            <a className={isActive(item.href, item.cat) ? 'active' : ''} onClick={closeSearch}>{item.label}</a>
          </Link>
        ))}
      </div>

      {/* Hamburger button — mobile only */}
      <button className="nav-toggle" onClick={() => setOpen(v => !v)} aria-label="Цэс">
        <span style={open ? { transform: 'translateY(7px) rotate(45deg)' } : {}} />
        <span style={open ? { opacity: 0 } : {}} />
        <span style={open ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}} />
      </button>

      {/* Mobile drawer */}
      <div className={`nav-drawer${open ? ' open' : ''}`}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href} legacyBehavior>
            <a className={isActive(item.href, item.cat) ? 'active' : ''} onClick={handleClick}>{item.label}</a>
          </Link>
        ))}
      </div>
    </nav>
  );
}