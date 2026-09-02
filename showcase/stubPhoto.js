export function stubPhoto(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><rect width="220" height="220" fill="#f4f4f4"/><rect x="1" y="1" width="218" height="218" fill="none" stroke="#d4d4d4"/><text x="110" y="118" font-family="sans-serif" font-size="28" fill="#8a8a8a" text-anchor="middle">${label}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
