import React from 'react';

export default function FactCheckCard() {
  return (
    <div className="card">
      <div className="head">Баримт шалгах</div>
      <div className="pad">
        <p className="fchead">Хамгийн сүүлд шалгасан</p>
        <div className="fc-claim">«Энэ онд цалин 2 дахин нэмэгдсэн» гэх мэдээлэл — <span className="verdict false">Худал</span></div>
      </div>
    </div>
  );
}
