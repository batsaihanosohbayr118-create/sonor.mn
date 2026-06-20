import React, { useState } from 'react';
import { POLL } from '@/data/newsData';

export default function PollCard() {
  const [voted, setVoted] = useState(POLL.voted);
  const [yes, setYes] = useState(POLL.yes);
  const [no, setNo] = useState(POLL.no);

  const handleVote = (option) => {
    if (!voted) {
      if (option === 'yes') {
        setYes(yes + 1);
      } else {
        setNo(no + 1);
      }
      setVoted(true);
      POLL.voted = true;
      POLL.yes = option === 'yes' ? yes + 1 : yes;
      POLL.no = option === 'no' ? no + 1 : no;
    }
  };

  const total = yes + no;
  const yesPercent = total > 0 ? Math.round((yes / total) * 100) : 0;
  const noPercent = total > 0 ? Math.round((no / total) * 100) : 0;

  return (
    <div className={`card poll ${voted ? 'voted' : ''}`}>
      <div className="head">Санал асуулга</div>
      <div className="pad">
        <p className="q">Та одоогийн засгийн газрыг дэмжиж байна уу?</p>
        
        <div className="opt">
          <button onClick={() => handleVote('yes')} disabled={voted}>
            Тийм
          </button>
        </div>
        <div className="opt">
          <button onClick={() => handleVote('no')} disabled={voted}>
            Үгүй
          </button>
        </div>

        <div className="barwrap">
          <div className="toprow">
            <span>Тийм</span>
            <span>{yesPercent}%</span>
          </div>
          <div className="track2">
            <div className="fill" style={{ width: `${yesPercent}%`, background: '#1C7C54' }}></div>
          </div>

          <div className="toprow" style={{ marginTop: '10px' }}>
            <span>Үгүй</span>
            <span>{noPercent}%</span>
          </div>
          <div className="track2">
            <div className="fill" style={{ width: `${noPercent}%`, background: '#C73A43' }}></div>
          </div>

          <p className="thanks">Таны санал дүүргээд баярлалаа.</p>
        </div>
      </div>
    </div>
  );
}
