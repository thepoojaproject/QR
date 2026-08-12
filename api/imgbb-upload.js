export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.IMGBB_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Server upload key is not configured.' });
  }

  try {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Expected multipart/form-data.' });
    }

    // Parse the incoming multipart request without exposing the ImgBB key.
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/i);
    if (!boundaryMatch) return res.status(400).json({ error: 'Invalid multipart request.' });

    const boundary = Buffer.from('--' + boundaryMatch[1]);
    const parts = splitMultipart(body, boundary);
    let imageBuffer = null;
    let filename = 'upload.jpg';
    let mime = 'application/octet-stream';

    for (const part of parts) {
      const sep = Buffer.from('\r\n\r\n');
      const idx = part.indexOf(sep);
      if (idx < 0) continue;
      const headers = part.subarray(0, idx).toString('utf8');
      const data = part.subarray(idx + sep.length).subarray(0, -2);
      if (/name="image"/i.test(headers)) {
        imageBuffer = data;
        const fn = headers.match(/filename="([^"]*)"/i);
        const ct = headers.match(/Content-Type:\s*([^\r\n]+)/i);
        if (fn) filename = fn[1] || filename;
        if (ct) mime = ct[1].trim();
      }
    }

    if (!imageBuffer || !imageBuffer.length) {
      return res.status(400).json({ error: 'Image is required.' });
    }
    if (imageBuffer.length > 5 * 1024 * 1024) {
      return res.status(413).json({ error: 'Image exceeds 5 MB.' });
    }
    if (!/^image\//i.test(mime)) {
      return res.status(415).json({ error: 'Only image files are allowed.' });
    }

    const form = new FormData();
    form.append('key', key);
    form.append('image', new Blob([imageBuffer], { type: mime }), filename);

    const upstream = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: form
    });
    const data = await upstream.json();

    if (!upstream.ok || !data.success) {
      return res.status(502).json({ error: data?.error?.message || 'ImgBB upload failed.' });
    }

    // Return only the public image URL; never return the secret key.
    return res.status(200).json({ url: data.data.url });
  } catch (err) {
    return res.status(500).json({ error: 'Secure upload failed.' });
  }
}

function splitMultipart(body, boundary) {
  const result = [];
  let start = body.indexOf(boundary);
  while (start !== -1) {
    const next = body.indexOf(boundary, start + boundary.length);
    if (next === -1) break;
    const part = body.subarray(start + boundary.length);
    result.push(part);
    start = next;
  }
  return result;
}
