import { renderBoundary } from "@camp.dev/bones/server";

export const REGIONS = ["profile", "stats", "feed"] as const;
export type Region = (typeof REGIONS)[number];

// Milliseconds at speed=1. The feed is first in the DOM and last to arrive,
// so the out-of-order flush is visible on every load.
const LATENCY: Record<Region, number> = { profile: 500, stats: 1500, feed: 3000 };

const CONTENT: Record<Region, string> = {
  profile:
    "<h2>Ada Lovelace</h2><p>Writes notes on the Analytical Engine. First programmer, occasional gambler.</p>",
  stats:
    "<h2>This week</h2><p>12 deploys, 3 rollbacks, 41 commits.</p><p>Busiest day: Thursday. Quietest: Sunday.</p>",
  feed: "<h2>Activity</h2><ul><li>Deployed bones to production.</li><li>Merged the streaming kit after review.</li><li>Opened an issue about dark-mode contrast.</li></ul>",
};

const FALLBACKS: Record<Region, string> = {
  profile: "<h2>A name loads here</h2><p>And a line or two about the person.</p>",
  stats:
    "<h2>Weekly stats</h2><p>Deploy counts and commit totals.</p><p>Busiest and quietest days.</p>",
  feed: "<h2>Activity</h2><ul><li>Three recent events</li><li>land in this list</li><li>when the feed resolves.</li></ul>",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function load(region: Region, speed: number, fail: string | null): Promise<string> {
  await sleep(LATENCY[region] * speed);
  if (region === fail) throw new Error(`the ${region} endpoint failed`);
  return CONTENT[region];
}

// No </body></html>: the closing tags are optional in HTML, chunks parse
// inside the still-open body, and the end of the stream ends the document.
export function shell(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Bones streaming demo</title>
<link rel="stylesheet" href="/assets/src/css/bones.css" />
<script type="module" async src="/assets/dist/index.mjs"></script>
<style>
  body { font: 16px/1.5 system-ui, sans-serif; margin: 2rem auto; max-width: 40rem; padding: 0 1rem; }
  bones-boundary { display: block; margin: 1.5rem 0; }
  bones-boundary[data-bones-error] { outline: 2px solid #c0392b; border-radius: 4px; }
  .error { color: #c0392b; }
  footer { margin-top: 3rem; font-size: 0.875rem; color: #666; }
</style>
</head>
<body>
<h1>Bones streaming demo</h1>
<p>Three regions stream in out of DOM order: the feed is first on the page and last to arrive.
Reload with <a href="/?speed=0">?speed=0</a> (a fast server — no skeleton ever flashes),
<a href="/?speed=3">?speed=3</a> (a slow one), or <a href="/?fail=stats">?fail=stats</a> (an error chunk).</p>
${renderBoundary("feed", FALLBACKS.feed)}
${renderBoundary("profile", FALLBACKS.profile)}
${renderBoundary("stats", FALLBACKS.stats, 'precision="measured"')}
<footer>View source: the shell, one bootstrap script, then one template-plus-script chunk per region, in arrival order — the <a href="https://github.com/campdotdev/bones/blob/main/apps/docs/content/docs/streaming.mdx">wire protocol</a> in the raw.
Or watch the bytes arrive: <code>curl --no-buffer localhost:3000</code>.</footer>
`;
}
