import type { Artwork } from '../data/types';

/**
 * Reprodukcje pobierane w czasie działania z Wikipedii / Wikimedia Commons — nic nie trafia do repozytorium.
 * Pokazujemy wyłącznie pliki w domenie publicznej lub na wolnej licencji (CC0, CC BY, CC BY-SA),
 * zawsze z autorem pliku i licencją.
 */
export type ImageResult =
  | {
      status: 'ok';
      src: string;
      fileTitle: string;
      filePage: string;
      author: string;
      license: string;
      licenseUrl?: string;
      articleUrl: string;
    }
  | { status: 'protected'; articleUrl: string }
  | { status: 'none'; articleUrl: string }
  | { status: 'offline'; articleUrl: string };

/**
 * Dzieła wciąż chronione prawem autorskim (w Polsce: 70 lat od śmierci twórcy) albo takie,
 * których zdjęcia na Commons mają niepewny status. Nie wyświetlamy ich reprodukcji.
 */
const PROTECTED_ARTISTS = [
  'Picasso', 'Dalí', 'Magritte', 'Warhol', 'Matisse', 'Kobro', 'Strzemiński', 'Abakanowicz',
  'Pollock', 'Duchamp', 'Le Corbusier', 'Utzon', 'Lichtenstein', 'Tomaszewski', 'Lenica', 'Świerzy',
  'Starowieyski', 'Cieślewicz', 'Młodożeniec', 'Beksiński', 'Opałka', 'Kantor',
];

export function isProtected(a: Pick<Artwork, 'artist' | 'domain'>): boolean {
  if (a.domain === 'plakat') return true;
  return PROTECTED_ARTISTS.some((name) => a.artist.includes(name));
}

export function wikipediaSearchUrl(query: string) {
  return `https://pl.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}`;
}

const FREE_LICENSE = /^(pd|public domain|cc0|cc[- ]by(?:[- ]sa)?(?:[- ]\d(?:\.\d)?)?(?:[- ][a-z]{2})?$)/i;

/** Czy licencja z metadanych Commons jest wolna (i nie jest NC/ND). */
export function isFreeLicense(license?: string, shortName?: string): boolean {
  const cands = [license, shortName].filter(Boolean).map((s) => s!.trim());
  if (cands.some((c) => /\b(nc|nd)\b/i.test(c) || /fair use|non-free/i.test(c))) return false;
  return cands.some((c) => FREE_LICENSE.test(c) || /^pd[- ]/i.test(c) || /public domain/i.test(c));
}

export function stripHtml(html: string): string {
  const txt = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  return txt.replace(/\s+/g, ' ').trim();
}

type Fetch = (url: string) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

const WIKI_API = 'https://pl.wikipedia.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const COMMON = 'format=json&formatversion=2&origin=*';

interface ImageInfo {
  thumburl?: string;
  url?: string;
  descriptionurl?: string;
  extmetadata?: Record<string, { value?: string } | undefined>;
}

async function getJson(fetchFn: Fetch, url: string): Promise<any> {
  const res = await fetchFn(url);
  if (!res.ok) throw new Error(`HTTP ${url}`);
  return res.json();
}

/** Szuka artykułu w polskiej Wikipedii i zwraca jego główny obraz oraz adres. */
async function findArticle(fetchFn: Fetch, query: string) {
  const url = `${WIKI_API}?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1`
    + `&prop=pageimages|info&piprop=name&inprop=url&${COMMON}`;
  const data = await getJson(fetchFn, url);
  const page = data?.query?.pages?.[0];
  if (!page) return null;
  return { image: page.pageimage as string | undefined, articleUrl: page.fullurl as string | undefined };
}

async function fileInfo(fetchFn: Fetch, fileTitle: string): Promise<{ title: string; info: ImageInfo } | null> {
  const title = fileTitle.startsWith('File:') || fileTitle.startsWith('Plik:') ? fileTitle : `File:${fileTitle}`;
  const url = `${COMMONS_API}?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo`
    + `&iiprop=url|extmetadata&iiurlwidth=960&${COMMON}`;
  const data = await getJson(fetchFn, url);
  const page = data?.query?.pages?.[0];
  if (!page || page.missing || !page.imageinfo?.[0]) return null;
  return { title: page.title, info: page.imageinfo[0] };
}

async function searchCommons(fetchFn: Fetch, query: string): Promise<{ title: string; info: ImageInfo } | null> {
  const url = `${COMMONS_API}?action=query&generator=search&gsrnamespace=6&gsrlimit=1`
    + `&gsrsearch=${encodeURIComponent(`${query} filetype:bitmap`)}`
    + `&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=960&${COMMON}`;
  const data = await getJson(fetchFn, url);
  const page = data?.query?.pages?.[0];
  if (!page?.imageinfo?.[0]) return null;
  return { title: page.title, info: page.imageinfo[0] };
}

function toResult(file: { title: string; info: ImageInfo }, articleUrl: string): ImageResult | null {
  const meta = file.info.extmetadata ?? {};
  const license = meta.License?.value;
  const shortName = meta.LicenseShortName?.value;
  if (!isFreeLicense(license, shortName)) return null;
  const src = file.info.thumburl ?? file.info.url;
  if (!src) return null;
  return {
    status: 'ok',
    src,
    fileTitle: file.title,
    filePage: file.info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(file.title)}`,
    author: stripHtml(meta.Artist?.value ?? '') || 'nieznany',
    license: stripHtml(shortName ?? license ?? ''),
    licenseUrl: meta.LicenseUrl?.value,
    articleUrl,
  };
}

/**
 * Ustala reprodukcję dla dzieła: ręczne nadpisanie → główny obraz artykułu w pl.wikipedii
 * → wyszukiwanie w Commons. Wynik nie zależy od stanu sieci tylko wtedy, gdy status ≠ 'offline'.
 */
export async function resolveImage(a: Artwork, override: string | undefined, fetchFn: Fetch): Promise<ImageResult> {
  let articleUrl = wikipediaSearchUrl(a.imageQuery);
  if (isProtected(a)) return { status: 'protected', articleUrl };
  if (override === 'none') return { status: 'none', articleUrl };
  try {
    if (override) {
      const f = await fileInfo(fetchFn, override);
      return (f && toResult(f, articleUrl)) || { status: 'none', articleUrl };
    }
    const article = await findArticle(fetchFn, a.imageQuery);
    if (article?.articleUrl) articleUrl = article.articleUrl;
    if (article?.image) {
      const f = await fileInfo(fetchFn, article.image);
      const r = f && toResult(f, articleUrl);
      if (r) return r;
    }
    const found = await searchCommons(fetchFn, a.imageQuery);
    return (found && toResult(found, articleUrl)) || { status: 'none', articleUrl };
  } catch {
    return { status: 'offline', articleUrl };
  }
}
