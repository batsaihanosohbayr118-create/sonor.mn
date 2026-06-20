import Head from 'next/head';
import UtilityBar from './UtilityBar';
import Header from './Header';
import NavBar from './NavBar';
import Ticker from './Ticker';
import Footer from './Footer';
import SearchBar from './SearchBar';

export default function Layout({ children, toggleSearch, isSearchOpen, closeSearch }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Сонор.мн — Хараат бус улс төрийн мэдээ</title>
      </Head>
      <UtilityBar toggleSearch={toggleSearch} />
      <SearchBar isSearchOpen={isSearchOpen} closeSearch={closeSearch} />
      <Header />
      <div className="tricolor"><span></span><span></span></div>
      <NavBar closeSearch={closeSearch} />
      <Ticker />
      <main><div className="wrap">{children}</div></main>
      <Footer />
    </>
  );
}
