/**
 * Extracts embed URL from YouTube or Vimeo video link.
 * @param {string} url - Video URL (YouTube or Vimeo)
 * @returns {string|null} - Embed URL for iframe, or null if not a supported video
 */
export function getVideoEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed || trimmed === '#') return null

  // YouTube: watch?v=, youtu.be/, embed/
  const ytMatch =
    trimmed.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/)
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  // Vimeo: vimeo.com/123456 or player.vimeo.com/video/123456
  const vimeoMatch =
    trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/) ||
    trimmed.match(/player\.vimeo\.com\/video\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  return null
}
