const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const b = req.body;
  if (
    !b ||
    typeof b.name !== 'string' || b.name.trim().length < 2 ||
    typeof b.phone !== 'string' || b.phone.replace(/\D/g, '').length < 7 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email || '') ||
    !Array.isArray(b.services) || b.services.length === 0
  ) return res.status(400).json({ error: 'invalid' });

  const html = `
    <h2>New consultation enquiry</h2>
    <p><b>Name:</b> ${esc(b.name)}</p>
    <p><b>Phone:</b> ${esc(b.phone)}</p>
    <p><b>Email:</b> ${esc(b.email)}</p>
    <p><b>Services:</b> ${esc(b.services.join(', '))}</p>
    <p><b>Location:</b> ${esc(b.location)}</p>
    <p><b>Budget:</b> ${esc(b.budget)}</p>
    <p><b>Submitted:</b> ${esc(b.submittedAt)}</p>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Billionare Mansion <leads@spok.digital>',
      to: ['Nabila.alfalahi@gmail.com'],
      reply_to: b.email,
      subject: `New enquiry: ${b.name} – ${b.services.join(', ')}`,
      html,
    }),
  });

  if (!r.ok) {
    console.error('Resend error', r.status, await r.text());
    return res.status(502).json({ error: 'send_failed' });
  }
  return res.status(200).json({ ok: true });
}