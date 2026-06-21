import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=MNT&to=USD,EUR,CNY,RUB');
    if (!r.ok) throw new Error();
    const data = await r.json();

    const rates = {
      USD: Math.round(1 / data.rates.USD),
      EUR: Math.round(1 / data.rates.EUR),
      CNY: Math.round(1 / data.rates.CNY),
      RUB: Math.round(1 / data.rates.RUB),
    };

    res.setHeader('Cache-Control', 's-maxage=3600');
    res.status(200).json({ rates });
  } catch {
    res.status(200).json({
      rates: { USD: 3577, EUR: 3890, CNY: 492, RUB: 40 },
      fallback: true,
    });
  }
}