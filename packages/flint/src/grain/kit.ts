/** prefers-reduced-motion, read live. False outside the browser. */
export const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- canvas ---------- */

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/* ---------- DOM capture ---------- */

const radiusOf = (v: string, w: number, h: number, s: number) => {
  const n = parseFloat(v) || 0;
  return Math.min(v.endsWith('%') ? (n / 100) * Math.min(w, h) : n * s, w / 2, h / 2);
};
const painted = (c: string) => c !== 'transparent' && !/^rgba\(.*,\s*0\)$/.test(c);

/**
 * A canvas replica of node as it looks now, at its on screen size, for the grain engine:
 * backgrounds, borders, text, images, canvases and inline SVG (no shadows, gradients or pseudo
 * elements). The node's own opacity is ignored, so a node kept hidden for its entrance captures
 * as it will show. Returns what play() and morph() take: { source, x, y, w, h }.
 */
export async function capture(node: HTMLElement, dpr = typeof window === 'undefined' ? 1 : Math.min(2, window.devicePixelRatio || 1)) {
  const r = node.getBoundingClientRect();
  const s = r.width / (node.offsetWidth || r.width) || 1;
  const source = document.createElement('canvas');
  source.width = Math.ceil(r.width * dpr);
  source.height = Math.ceil(r.height * dpr);
  const ctx = source.getContext('2d')!;
  ctx.scale(dpr, dpr);

  // Inline SVG only draws through an image, which loads async: load them all first, draw in order.
  const svgs = new Map<Element, HTMLImageElement>();
  await Promise.all([...node.querySelectorAll('svg')].map((svg) => {
    const b = svg.getBoundingClientRect();
    if (!b.width || !b.height) return null;
    const copy = svg.cloneNode(true) as SVGElement;
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copy.setAttribute('width', String(b.width));
    copy.setAttribute('height', String(b.height));
    copy.style.color = getComputedStyle(svg).color;
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copy));
    svgs.set(svg, img);
    return img.decode().catch(() => svgs.delete(svg));
  }));

  const text = (t: Text, cs: CSSStyleDeclaration) => {
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize) * s}px ${cs.fontFamily}`;
    ctx.fillStyle = cs.color;
    ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : `${parseFloat(cs.letterSpacing) * s}px`;
    ctx.textBaseline = 'alphabetic';
    const range = document.createRange();
    for (const m of t.data.matchAll(/\S+/g)) {
      range.setStart(t, m.index);
      range.setEnd(t, m.index + m[0].length);
      const b = range.getClientRects()[0];
      if (!b) continue;
      const ascent = ctx.measureText(m[0]).fontBoundingBoxAscent;
      ctx.fillText(m[0], b.left - r.left, b.top - r.top + (ascent ?? b.height * 0.78));
    }
  };

  // A node kept hidden for its entrance still captures as it will show, so when the
  // hidden state is introduced on the node itself, the whole subtree is drawn anyway.
  const rootHidden = getComputedStyle(node).visibility === 'hidden';
  const walk = (e: Element, alpha: number) => {
    const cs = getComputedStyle(e);
    if (cs.display === 'none') return;
    if (!rootHidden && cs.visibility === 'hidden') return;
    const a = e === node ? alpha : alpha * parseFloat(cs.opacity);
    if (a <= 0.003) return;
    const b = e.getBoundingClientRect();
    const x = b.left - r.left, y = b.top - r.top, w = b.width, h = b.height;
    const rad = radiusOf(cs.borderTopLeftRadius, w, h, s);
    ctx.globalAlpha = a;
    if (painted(cs.backgroundColor)) {
      rr(ctx, x, y, w, h, rad);
      ctx.fillStyle = cs.backgroundColor;
      ctx.fill();
    }
    const bw = parseFloat(cs.borderTopWidth) * s;
    if (bw > 0 && cs.borderTopStyle !== 'none' && painted(cs.borderTopColor)) {
      rr(ctx, x + bw / 2, y + bw / 2, w - bw, h - bw, Math.max(0, rad - bw / 2));
      ctx.strokeStyle = cs.borderTopColor;
      ctx.lineWidth = bw;
      ctx.stroke();
    }
    const img = svgs.get(e) ?? (e instanceof HTMLImageElement && e.complete && e.naturalWidth ? e : e instanceof HTMLCanvasElement ? e : null);
    if (img) {
      ctx.save();
      rr(ctx, x, y, w, h, rad);
      ctx.clip();
      const iw = img instanceof HTMLImageElement ? img.naturalWidth : img.width, ih = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
      const fitMode = img === e && e instanceof HTMLImageElement ? cs.objectFit : 'fill';
      if ((fitMode === 'cover' || fitMode === 'contain') && iw && ih) {
        const k = (fitMode === 'cover' ? Math.max : Math.min)(w / iw, h / ih);
        ctx.drawImage(img, x + (w - iw * k) / 2, y + (h - ih * k) / 2, iw * k, ih * k);
      } else ctx.drawImage(img, x, y, w, h);
      ctx.restore();
      return;
    }
    const clip = cs.overflowX !== 'visible' || cs.overflowY !== 'visible';
    if (clip) {
      ctx.save();
      rr(ctx, x, y, w, h, rad);
      ctx.clip();
    }
    for (const child of e.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) walk(child as Element, a);
      else if (child.nodeType === Node.TEXT_NODE) { ctx.globalAlpha = a; text(child as Text, cs); }
    }
    if (clip) ctx.restore();
  };
  walk(node, 1);
  return { source, x: r.left, y: r.top, w: r.width, h: r.height };
}
