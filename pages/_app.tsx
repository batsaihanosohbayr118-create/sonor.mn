import '../styles/globals.css';
import Layout from '@/components/Layout';
import type { AppProps } from 'next/app';
import { useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const closeSearch = () => setIsSearchOpen(false);

  return (
    <Layout
      toggleSearch={toggleSearch}
      isSearchOpen={isSearchOpen}
      closeSearch={closeSearch}
    >
      <Component {...pageProps} />
    </Layout>
  );
}