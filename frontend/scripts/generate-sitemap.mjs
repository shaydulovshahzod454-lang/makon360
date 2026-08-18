// Har safar `npm run build` ishga tushganda, backend'dan BARCHA e'lonlarni
// so'rab, ular asosida sitemap.xml faylini avtomatik yasaydi.
// Shunda Google har doim eng yangi e'lonlar ro'yxatini topa oladi.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://makon360.online';
const API_URL = process.env.VITE_API_URL || 'https://makon360-backend-1.onrender.com/api';

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/catalog', priority: '0.9', changefreq: 'daily' },
  { path: '/calculator', priority: '0.5', changefreq: 'monthly' },
  { path: '/login', priority: '0.3', changefreq: 'yearly' },
  { path: '/register', priority: '0.3', changefreq: 'yearly' },
];

async function fetchAllListingIds() {
  const ids = [];
  let url = `${API_URL}/listings/?page_size=100`;

  // Agar backend'da pagination yo'q bo'lsa yoki oddiy massiv qaytarsa - shuni hisobga olamiz
  try {
    while (url) {
      const res = await fetch(url);
      if (!res.ok) break;
      const data = await res.json();

      const results = Array.isArray(data) ? data : data.results || [];
      results.forEach((item) => ids.push(item.id));

      url = Array.isArray(data) ? null : data.next;
    }
  } catch (err) {
    console.warn('[sitemap] Backend\'dan e\'lonlarni olishda xatolik (internet yo\'qmi?), faqat statik sahifalar bilan davom etiladi:', err.message);
  }

  return ids;
}

function buildXml(staticPages, listingIds) {
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = staticPages.map(
    (p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  );

  const listingUrls = listingIds.map(
    (id) => `  <url>
    <loc>${SITE_URL}/listing/${id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...listingUrls].join('\n')}
</urlset>
`;
}

async function main() {
  console.log('[sitemap] E\'lonlar ro\'yxati olinmoqda...');
  const listingIds = await fetchAllListingIds();
  console.log(`[sitemap] ${listingIds.length} ta e'lon topildi.`);

  const xml = buildXml(STATIC_PAGES, listingIds);
  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf-8');
  console.log(`[sitemap] Saqlandi: ${outPath}`);
}

main();
