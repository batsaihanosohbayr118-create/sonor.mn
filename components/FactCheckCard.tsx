import React from 'react';
import { Fact } from '@/lib/factsStore';

export default function FactCheckCard({ fact }: { fact: Fact | null }) {
  return (
    <div className="card">
      <div className="head">Баримт шалгах</div>
      <div className="pad">
        <p className="fchead">Хамгийн сүүлд шалгасан</p>
        {fact ? (
          <div className="fc-claim">
            «{fact.claim}» — <span className={`verdict ${fact.verdict}`}>{fact.vlabel}</span>
          </div>
        ) : (
          <div className="fc-claim">Одоогоор шалгасан баримт алга байна.</div>
        )}
      </div>
    </div>
  );
}