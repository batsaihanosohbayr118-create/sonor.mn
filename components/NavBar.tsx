import React from 'react';
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
  const activePath = router.pathname;
  const activeCat = typeof router.query.cat === 'string' ? router.query.cat : '';

  const isActive = (href: string, cat?: string) => {
    if (href === '/') return activePath === '/';
    if (href.startsWith('/politics') && activePath === '/politics') {
      return !!cat ? activeCat === cat : !activeCat;
    }
    return href === router.asPath;
  };

  return (
    <nav className="main">
      <div className="wrap" id="nav">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} legacyBehavior>
            <a className={isActive(item.href, item.cat) ? 'active' : ''} onClick={closeSearch}>{item.label}</a>
          </Link>
        ))}
      </div>
    </nav>
  );
}