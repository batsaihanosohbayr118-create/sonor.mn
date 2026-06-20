import React from 'react';
import { FACTS } from '@/data/newsData';

export default function FactCheck() {
  return (
    <div className="policy">
      <h1>Баримт шалгах</h1>
      <div className="trustgrid">
        {FACTS.map((fact, idx) => (
          <div className="t" key={idx}>
            <b>{fact.vlabel}</b>
            <p>{fact.claim}</p>
            <small>{fact.exp}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
