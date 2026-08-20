// Vercel serverless funksiya - faqat ijtimoiy tarmoq botlari (Telegram,
// Facebook, WhatsApp va h.k.) shu yerga yo'naltiriladi (vercel.json orqali).
// Oddiy foydalanuvchilar buni umuman ko'rmaydi - ular to'g'ridan-to'g'ri
// React saytiga (index.html) boradi, xuddi avvalgidek.

const BACKEND_URL = process.env.VITE_API_URL || 'https://makon360-backend-1.onrender.com/api';
const SITE_URL = 'https://www.makon360.online';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(request, response) {
  const { id } = request.query;

  let title = 'Makon360 — Ko\'chmas mulkni 360° ko\'rish platformasi';
  let description = 'Uyingizni sotib olishdan oldin, uning ichida "yurib ko\'ring".';
  let image = `${SITE_URL}/og-cover.jpg`;
  const pageUrl = `${SITE_URL}/listing/${id}`;

  try {
    const res = await fetch(`${BACKEND_URL}/listings/${id}/`);
    if (res.ok) {
      const listing = await res.json();
      title = `${listing.title} — Makon360`;
      description = listing.description
        ? listing.description.slice(0, 160)
        : `${listing.price} so'm — ${listing.address}`;
      if (listing.main_image) {
        image = listing.main_image;
      }
    }
  } catch (err) {
    // Backend javob bermasa - standart (umumiy) rasm/matn bilan davom etamiz
  }

  const html = `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta property="og:type" content="product" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:url" content="${escapeHtml(pageUrl)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
<meta http-equiv="refresh" content="0; url=${escapeHtml(pageUrl)}" />
</head>
<body>
<p>Yo'naltirilmoqda... <a href="${escapeHtml(pageUrl)}">Shu yerga bosing</a></p>
</body>
</html>`;

  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  return response.status(200).send(html);
}