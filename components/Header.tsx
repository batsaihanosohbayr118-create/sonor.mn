import React, { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => { setSent(false); setOpen(false); }, 2500);
  };

  return (
    <header className="masthead">
      <div className="wrap header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>

        <Link href="/" legacyBehavior>
          <a className="logo-link" aria-label="Сонор.мн">
            <img className="logo" src="/logo/Sonor.png" alt="Сонор.мн" />
          </a>
        </Link>

        <div className="header-feedback">
          <button className="feedback-toggle" onClick={() => { setOpen(o => !o); setSent(false); }}>
            Санал хүсэлт {open ? '✕' : '+'}
          </button>

          {open && (
            <div className="feedback-dropdown">
              {sent ? (
                <p className="feedback-thanks">✓ Хүлээн авлаа. Баярлалаа!</p>
              ) : (
                <form className="feedback-form" onSubmit={handleSubmit}>
                  <div className="feedback-row">
                    <input
                      placeholder="Нэр"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                    <input
                      type="email"
                      placeholder="И-мэйл"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Санал, хүсэлт, гомдол..."
                    rows={3}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                  />
                  <button type="submit">Илгээх</button>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
