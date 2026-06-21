import React, { useState } from 'react';
import { POLL } from '@/data/newsData';

export default function PollCard() {
  const [voted, setVoted] = useState(POLL.voted);
  const [yes, setYes] = useState(POLL.yes);
  const [no, setNo] = useState(POLL.no);

  const handleVote = (option) => {
    if (!voted) {
      const newYes = option === 'yes' ? yes + 1 : yes;
      const newNo = option === 'no' ? no + 1 : no;
      setYes(newYes);
      setNo(newNo);
      setVoted(true);
      POLL.voted = true;
      POLL.yes = newYes;
      POLL.no = newNo;
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

        {!voted && (
          <>
            <div className="opt">
              <button onClick={() => handleVote('yes')}>Тийм</button>
            </div>
            <div className="opt">
              <button onClick={() => handleVote('no')}>Үгүй</button>
            </div>
          </>
        )}

        {voted && (
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
        )}
      </div>
    </div>
  );
}