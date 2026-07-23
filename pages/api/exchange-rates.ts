import type { NextApiRequest, NextApiResponse } from 'next';

// frankfurter.app does not support MNT; open.er-api.com does (free, no key).
// It returns how many of each currency equal 1 USD, so USD→MNT is the base and
// the cross rate (MNT per X) = (MNT per USD) / (X per USD).
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!r.ok) throw new Error();
    const data = await r.json();
    const perUsd = data?.rates;
    if (!perUsd?.MNT) throw new Error();

    const mnt = perUsd.MNT; // MNT per 1 USD
    const rates = {
      USD: Math.round(mnt),
      EUR: Math.round(mnt / perUsd.EUR),
      CNY: Math.round(mnt / perUsd.CNY),
      RUB: Math.round(mnt / perUsd.RUB),
    };

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ rates });
  } catch {
    res.status(200).json({
      rates: { USD: 3577, EUR: 3890, CNY: 492, RUB: 40 },
      fallback: true,
    });
  }
}
