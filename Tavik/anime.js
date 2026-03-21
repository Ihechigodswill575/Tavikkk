// TAVIK HiAnime API — Vercel Serverless Function
// Deploy this to your Vercel project alongside index.html
// Then call: /api/anime?action=search&q=naruto
//            /api/anime?action=episodes&id=naruto-shippuden
//            /api/anime?action=stream&id=naruto-shippuden&ep=1

const HIANIME_BASE = 'https://hianime.to';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  const { action, q, id, ep } = req.query;

  try {
    if (action === 'search') {
      // Search anime on HiAnime
      const response = await fetch(
        `https://consumet-api.vercel.app/anime/gogoanime/${encodeURIComponent(q)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      const data = await response.json();
      return res.json({ success: true, results: data.results || [] });
    }

    if (action === 'episodes') {
      // Get episodes list
      const response = await fetch(
        `https://consumet-api.vercel.app/anime/gogoanime/info/${id}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      const data = await response.json();
      return res.json({ success: true, episodes: data.episodes || [], info: data });
    }

    if (action === 'stream') {
      // Get streaming links for episode
      const episodeId = `${id}-episode-${ep}`;
      const response = await fetch(
        `https://consumet-api.vercel.app/anime/gogoanime/watch/${episodeId}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      const data = await response.json();

      // Return sources
      const sources = data.sources || [];
      const defaultSource = sources.find(s => s.quality === '1080p') ||
                           sources.find(s => s.quality === '720p') ||
                           sources[0];

      return res.json({
        success: true,
        sources: sources,
        default: defaultSource,
        headers: data.headers || {}
      });
    }

    return res.json({ success: false, error: 'Invalid action' });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
