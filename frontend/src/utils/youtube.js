// utils/youtube.js — shared YouTube URL helpers (Course Studio + Watch page)

export const isYouTubeUrl = (url = '') => {
  if (!url) return false;
  return /(?:youtube\.com\/(?:watch|embed|shorts)|youtu\.be\/)/i.test(url.trim());
};

export const normalizeYouTubeUrl = (url = '') => {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  // Convert youtu.be/<id> to youtube.com/watch?v=<id> so ReactPlayer handles it uniformly
  const shortMatch = trimmed.match(/youtu\.be\/([\w-]{6,})/i);
  if (shortMatch) {
    const id = shortMatch[1].split(/[?&#]/)[0];
    return `https://www.youtube.com/watch?v=${id}`;
  }
  return trimmed;
};

export const isValidYouTubeUrl = (url = '') => {
  const trimmed = (url || '').trim();
  if (!trimmed) return false;
  // Accept watch, embed, shorts and youtu.be links
  return /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{6,}.*$/i.test(trimmed);
};
