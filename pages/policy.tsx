import React from 'react';
import Seo from '@/components/Seo';

export default function Policy() {
  return (
    <div className="policy">
      <Seo
        title="Редакцийн бодлого"
        description="Сонор.мн хэрхэн мэдээллээ бэлтгэдэг, ямар зарчим баримталдаг тухай редакцийн бодлого."
        path="/policy"
      />
      <h1>Редакцийн бодлого</h1>
      <div className="intro">Сонор.мн нь хараат бус, шударга нийтлэл, баримт дээр тулгуурласан мэдээллийг эрхэмлэнэ.</div>
      <h2><span className="num">1</span> Зөв мэдээлэл</h2>
      <p>Мэдээлэл нь эх сурвалжаар баталгаажсан, нээлттэй, бодит байх ёстой.</p>
      <h2><span className="num">2</span> Тэнцвэртэй хандах</h2>
      <p>Бүх талын байр суурийг хүндэтгэн, хэт туйлширсан утгатай нийтлэлийг багасгана.</p>
    </div>
  );
}
