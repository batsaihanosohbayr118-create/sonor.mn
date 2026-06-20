import React from 'react';
import Link from 'next/link';

export default function Ticker() {
  return (
    <div className="ticker">
      <div className="wrap">
        <span className="tag">ШУУРХАЙ</span>
        <div className="track">
          <Link href="/articles/1" legacyBehavior>
            <a className="track-text">
              УИХ-ын намрын чуулган өнөөдөр 10 цагт нээлтээ хийнэ · Засгийн газрын бүтцийн өөрчлөлт батлагдлаа · Орон нутгийн сонгуулийн бэлтгэл эхэллээ
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
