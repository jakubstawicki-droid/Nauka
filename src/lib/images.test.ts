import { describe, expect, it } from 'vitest';
import type { Artwork } from '../data/types';
import { isFreeLicense, isProtected, resolveImage, stripHtml } from './images';

const art = (over: Partial<Artwork> = {}): Artwork => ({
  id: 'stanczyk', title: 'Stańczyk', artist: 'Jan Matejko', date: '1862', period: 'Akademizm', domain: 'malarstwo',
  technique: '', genre: '', location: '', isPolish: true, recognizeBy: '', features: [], significance: '', question: '',
  imageQuery: 'Stańczyk Jan Matejko', ...over,
});

const commonsPage = (license: string, shortName: string) => ({
  query: { pages: [{ title: 'File:Jan Matejko, Stańczyk.jpg', imageinfo: [{
    thumburl: 'https://upload.wikimedia.org/thumb/stanczyk-960.jpg',
    url: 'https://upload.wikimedia.org/stanczyk.jpg',
    descriptionurl: 'https://commons.wikimedia.org/wiki/File:Jan_Matejko,_Sta%C5%84czyk.jpg',
    extmetadata: {
      License: { value: license }, LicenseShortName: { value: shortName },
      Artist: { value: '<a href="//pl.wikipedia.org/wiki/Jan_Matejko">Jan Matejko</a>' },
    },
  }] }] },
});

function fakeFetch(routes: [RegExp, unknown][]) {
  const calls: string[] = [];
  const fn = async (url: string) => {
    calls.push(url);
    const hit = routes.find(([re]) => re.test(url));
    if (!hit) return { ok: true, json: async () => ({ query: { pages: [] } }) };
    return { ok: true, json: async () => hit[1] };
  };
  return { fn, calls };
}

describe('licencje', () => {
  it('akceptuje domenę publiczną i CC BY / BY-SA / CC0', () => {
    expect(isFreeLicense('pd', 'Public domain')).toBe(true);
    expect(isFreeLicense(undefined, 'PD-old-100')).toBe(true);
    expect(isFreeLicense('cc-by-sa-4.0', 'CC BY-SA 4.0')).toBe(true);
    expect(isFreeLicense('cc-by-2.0', 'CC BY 2.0')).toBe(true);
    expect(isFreeLicense('cc0', 'CC0')).toBe(true);
  });
  it('odrzuca licencje niewolne i brak licencji', () => {
    expect(isFreeLicense('cc-by-nc-sa-2.0', 'CC BY-NC-SA 2.0')).toBe(false);
    expect(isFreeLicense('cc-by-nd-3.0', 'CC BY-ND 3.0')).toBe(false);
    expect(isFreeLicense(undefined, 'Fair use')).toBe(false);
    expect(isFreeLicense(undefined, undefined)).toBe(false);
  });
});

describe('dzieła chronione', () => {
  it('rozpoznaje artystów chronionych i plakaty', () => {
    expect(isProtected(art({ artist: 'Pablo Picasso' }))).toBe(true);
    expect(isProtected(art({ artist: 'Salvador Dalí' }))).toBe(true);
    expect(isProtected(art({ artist: 'm.in. Henryk Tomaszewski', domain: 'plakat' }))).toBe(true);
    expect(isProtected(art())).toBe(false);
  });
  it('dla dzieła chronionego nie odpytuje sieci', async () => {
    const { fn, calls } = fakeFetch([]);
    const r = await resolveImage(art({ artist: 'René Magritte', imageQuery: 'Zdradliwość obrazów' }), undefined, fn);
    expect(r.status).toBe('protected');
    expect(calls).toHaveLength(0);
  });
});

describe('resolveImage', () => {
  it('bierze główny obraz artykułu z Wikipedii, z autorem i licencją', async () => {
    const { fn } = fakeFetch([
      [/pl\.wikipedia\.org/, { query: { pages: [{ title: 'Stańczyk (obraz)', pageimage: 'Jan_Matejko,_Stańczyk.jpg', fullurl: 'https://pl.wikipedia.org/wiki/Sta%C5%84czyk_(obraz)' }] } }],
      [/commons.*titles=/, commonsPage('pd', 'Public domain')],
    ]);
    const r = await resolveImage(art(), undefined, fn);
    expect(r).toMatchObject({
      status: 'ok', src: 'https://upload.wikimedia.org/thumb/stanczyk-960.jpg', author: 'Jan Matejko',
      license: 'Public domain', articleUrl: 'https://pl.wikipedia.org/wiki/Sta%C5%84czyk_(obraz)',
    });
  });

  it('pomija plik na niewolnej licencji', async () => {
    const { fn } = fakeFetch([
      [/pl\.wikipedia\.org/, { query: { pages: [{ pageimage: 'x.jpg', fullurl: 'https://pl.wikipedia.org/wiki/X' }] } }],
      [/commons/, commonsPage('cc-by-nc-2.0', 'CC BY-NC 2.0')],
    ]);
    expect((await resolveImage(art(), undefined, fn)).status).toBe('none');
  });

  it('używa ręcznego nadpisania pliku', async () => {
    const { fn, calls } = fakeFetch([[/commons.*titles=File%3AInny.jpg/, commonsPage('pd', 'Public domain')]]);
    const r = await resolveImage(art(), 'File:Inny.jpg', fn);
    expect(r.status).toBe('ok');
    expect(calls.some((u) => u.includes('pl.wikipedia'))).toBe(false);
  });

  it('bez sieci zwraca status offline (nie zapisujemy go jako „brak obrazu”)', async () => {
    const r = await resolveImage(art(), undefined, async () => { throw new TypeError('Failed to fetch'); });
    expect(r.status).toBe('offline');
  });
});

describe('stripHtml', () => {
  it('usuwa znaczniki i encje', () => {
    expect(stripHtml('<span>Jan&nbsp;Matejko</span> &amp; <b>inni</b>')).toBe('Jan Matejko & inni');
  });
});
