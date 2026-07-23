import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="fcols">
          <div>
            <h5>sonornews.mn</h5>
            <p className="ftagline">Хараат бус улс төрийн мэдээ. Үнэн зөв мэдээллийг иргэдэд хүргэхийг эрхэмлэнэ.</p>
          </div>
          <div>
            <h5>Ангилал</h5>
            <Link href="/politics?cat=uih">УИХ</Link>
            <Link href="/politics?cat=gov">Засгийн газар</Link>
            <Link href="/politics?cat=election">Сонгууль</Link>
            <Link href="/economy">Эдийн засаг</Link>
          </div>
          <div>
            <h5>Итгэлийн төв</h5>
            <Link href="/policy">Редакцийн бодлого</Link>
            <Link href="/factcheck">Баримт шалгах аргачлал</Link>
            <Link href="/policy">Залруулгын бүртгэл</Link>
            <Link href="/policy">Эзэмшил, санхүүжилт</Link>
          </div>
          <div>
            <h5>Дагах</h5>
            <a href="https://www.facebook.com/share/18S8xE4tLi/" target="_blank" rel="noopener noreferrer">Facebook</a><a href="https://x.com/SonorNews" target="_blank" rel="noopener noreferrer">X (Twitter)</a><a href="https://youtube.com/@sonornews" target="_blank" rel="noopener noreferrer">YouTube</a><a href="mailto:sonornews@gmail.com" target="_blank" rel="noopener noreferrer">И-мэйл захиалга</a>
          </div>
        </div>
        <div className="fbottom">
          <span>© 2026 sonornews.mn. Бүх эрх хуулиар хамгаалагдсан.</span>
          <span className="badge">Хэвлэл мэдээллийн зөвлөлийн зарчмыг мөрддөг</span>
        </div>
      </div>
    </footer>
  );
}