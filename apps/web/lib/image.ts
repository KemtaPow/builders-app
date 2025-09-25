export function ensureImageDataUrl(u: string, fallbackSubtype = 'png') {
  if (!u?.startsWith('data:')) return u;
  const m = u.match(/^data:([^;]+);base64,/i);
  if (!m) return u;
  const mime = m[1].toLowerCase();
  if (mime === 'image') {
    const sub = fallbackSubtype.replace(/^image\//i, '').toLowerCase();
    return u.replace(/^data:image;base64,/i, `data:image/${sub};base64,`);
  }
  if (!mime.startsWith('image/')) {
    throw new Error('Unsupported data URL MIME for image');
  }
  return u;
}

export function isValidImageDataUrl(s: string) {
  return /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(s);
}

