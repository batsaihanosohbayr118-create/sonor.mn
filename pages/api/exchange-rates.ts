import type { NextApiRequest, NextApiResponse } from 'next';

// frankfurter.app does not support MNT; open.er-api.com does (free, no key).
// It returns how many of each currency equal 1 USD, so USD→MNT is the base and
// the cross rate (MNT per X) = (MNT per USD) / (X per USD).
const CURRENCY_CODES = [
  'USD', 'EUR', 'CNY', 'RUB', 'JPY', 'KRW', 'GBP',
  'KZT', 'HKD', 'SGD', 'AUD', 'CAD', 'CHF', 'INR', 'THB', 'TRY',
  'AED', 'SAR', 'MYR', 'IDR', 'PHP', 'VND', 'NZD', 'SEK', 'NOK',
  'DKK', 'PLN', 'CZK', 'ILS', 'BRL',
] as const;

const FALLBACK_RATES: Record<(typeof CURRENCY_CODES)[number], number> = {
  USD: 3577, EUR: 3890, CNY: 492, RUB: 40, JPY: 24, KRW: 2.6, GBP: 4540,
  KZT: 7.5, HKD: 462, SGD: 2687, AUD: 2368, CAD: 2647, CHF: 4091, INR: 43,
  THB: 103, TRY: 113, AED: 981, SAR: 960, MYR: 766, IDR: 0.23, PHP: 64,
  VND: 0.15, NZD: 2195, SEK: 346, NOK: 340, DKK: 522, PLN: 900, CZK: 159,
  ILS: 973, BRL: 720,
};

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!r.ok) throw new Error();
    const data = await r.json();
    const perUsd = data?.rates;
    if (!perUsd?.MNT) throw new Error();

    const mnt = perUsd.MNT; // MNT per 1 USD
    const rates = Object.fromEntries(
      CURRENCY_CODES.map(code => [
        code,
        code === 'USD' ? Math.round(mnt) : Math.round((mnt / perUsd[code]) * 100) / 100,
      ])
    );

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ rates });
  } catch {
    res.status(200).json({ rates: FALLBACK_RATES, fallback: true });
  }
}
