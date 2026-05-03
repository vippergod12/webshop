export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='#0f172a'/>
          <stop offset='1' stop-color='#1e293b'/>
        </linearGradient>
      </defs>
      <rect width='800' height='600' fill='url(#g)'/>
      <text x='50%' y='50%' fill='#64748b' font-family='sans-serif' font-size='28' text-anchor='middle' dy='.35em'>RISE</text>
    </svg>`
  );

export const BLUR_DATA_URL =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 6'>
      <rect width='8' height='6' fill='#0b1020'/>
    </svg>`
  ).toString("base64");

export function safeImage(url: string | null | undefined): string {
  if (!url) return PLACEHOLDER_IMG;
  if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) {
    return url;
  }
  return PLACEHOLDER_IMG;
}

export function isOptimizable(url: string): boolean {
  return !url.startsWith("data:");
}
