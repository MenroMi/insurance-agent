export const insurancePartners = [
  { name: 'Prudential', file: 'prudential.svg' },
  { name: 'Compensa', file: 'compensa.png' },
  { name: 'Wiener', file: 'wiener.svg' },
  { name: 'Allianz', file: 'allianz.svg' },
  { name: 'Generali', file: 'generali.svg' },
  { name: 'Nationale-Nederlanden', file: 'nationale-nederlanden.svg' },
  { name: 'SIGNAL IDUNA', file: 'signal-iduna.svg' },
  { name: 'Warta', file: 'warta.svg' },
  { name: 'Vienna Life', file: 'vienna-life.svg' },
  { name: 'ERGO Hestia', file: 'ergo-hestia.svg' },
  { name: 'PZU', file: 'pzu.svg' },
  { name: 'Leadenhall', file: 'leadenhall.png' },
  { name: 'UNIQA', file: 'uniqa.svg' },
] as const;

export const bankPartners = [
  { name: 'Alior Bank', file: 'alior-bank.svg' },
  { name: 'Bank Millennium', file: 'bank-millennium.svg' },
  { name: 'Bank Pekao', file: 'bank-pekao.svg' },
  { name: 'BNP Paribas', file: 'bnp-paribas.png' },
  { name: 'BOŚ Bank', file: 'bos-bank.svg' },
  { name: 'Erste Bank', file: 'erste-bank.svg' },
  { name: 'ING', file: 'ing.svg' },
  { name: 'mBank', file: 'mbank.svg' },
  { name: 'PKO BP', file: 'pko-bp.jpg' },
] as const;

/**
 * Raster extensions here are deliberate, never a mistake to be "fixed" back to
 * .svg: where a logo exists in both forms the raster one wins, because it means
 * the vector was either never found or looked wrong. Four files are affected:
 * compensa.png, bnp-paribas.png, leadenhall.png and pko-bp.jpg.
 *
 * The subset below is what scrolls in the strip under the hero.
 */
export const marqueePartners = [
  'allianz.svg',
  'generali.svg',
  'warta.svg',
  'pzu.svg',
  'uniqa.svg',
  'ergo-hestia.svg',
  'ing.svg',
  'mbank.svg',
  'pko-bp.jpg',
] as const;
