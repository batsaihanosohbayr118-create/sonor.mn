import Head from 'next/head';
import UtilityBar from './UtilityBar';
import Header from './Header';
import NavBar from './NavBar';
import Ticker from './Ticker';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0d3b8c" />
        <link rel="icon" href="/logo/Sonor.png" />
        <title>Сонор.мн — Хараат бус, шуурхай мэдээ</title>
        <meta
          name="description"
          content="Хараат бус, шуурхай, итгэлтэй мэдээллийн эх сурвалж — улс төр, эдийн засаг, нийгмийн мэдээ."
        />
        <meta property="og:site_name" content="Сонор.мн" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="mn_MN" />
        <meta property="og:image" content="https://sonor.mn/logo/Sonor.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <UtilityBar />
      <Header />
      <NavBar />
      <Ticker />
      <main><div className="wrap">{children}</div></main>
      <Footer />
    </>
  );
}
