import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="fcols">
          <div>
            <h5>Сонор.мн</h5>
            <p className="ftagline">Хараат бус улс төрийн мэдээ. Үнэн зөв мэдээллийг иргэдэд хүргэхийг эрхэмлэнэ.</p>
          </div>
          <div>
            <h5>Ангилал</h5>
            <Link href="/politics?cat=uih">УИХ</Link>
            <Link href="/politics?cat=gov">Засгийн газар</Link>
            <Link href="/politics?cat=election">Сонгууль</Link>
            <Link href="/politics?cat=economy">Эдийн засаг</Link>
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
            <a>Facebook</a><a>X (Twitter)</a><a>YouTube</a><a>И-мэйл захиалга</a>
          </div>
        </div>
        <div className="fbottom">
          <span>© 2026 Сонор.мн. Бүх эрх хуулиар хамгаалагдсан.</span>
          <span className="badge">Хэвлэл мэдээллийн зөвлөлийн зарчмыг мөрддөг</span>
        </div>
      </div>
    </footer>
  );
}
