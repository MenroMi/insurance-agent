export const insurancePartners = [
  { name: "Prudential", file: "prudential.svg" },
  { name: "Compensa", file: "compensa.png" },
  { name: "Wiener", file: "wiener.svg" },
  { name: "Allianz", file: "allianz.svg" },
  { name: "Generali", file: "generali.svg" },
  { name: "Nationale-Nederlanden", file: "nationale-nederlanden.svg" },
  { name: "SIGNAL IDUNA", file: "signal-iduna.svg" },
  { name: "Warta", file: "warta.svg" },
  { name: "Vienna Life", file: "vienna-life.svg" },
  { name: "ERGO Hestia", file: "ergo-hestia.svg" },
  { name: "PZU", file: "pzu.svg" },
  { name: "Leadenhall", file: "leadenhall.svg" },
  { name: "UNIQA", file: "uniqa.svg" },
] as const;

export const bankPartners = [
  { name: "Alior Bank", file: "alior-bank.svg" },
  { name: "Bank Millennium", file: "bank-millennium.svg" },
  { name: "Bank Pekao", file: "bank-pekao.svg" },
  { name: "BNP Paribas", file: "bnp-paribas.png" },
  { name: "BOŚ Bank", file: "bos-bank.svg" },
  { name: "Erste Bank", file: "erste-bank.svg" },
  { name: "ING", file: "ing.svg" },
  { name: "mBank", file: "mbank.svg" },
  { name: "PKO BP", file: "pko-bp.jpg" },
] as const;

/**
 * The subset shown in the scrolling strip below the hero. The three raster
 * extensions are deliberate; the cleanup pass corrected these paths after they
 * pointed at non-existent .svg files.
 */
export const marqueePartners = [
  "allianz.svg",
  "generali.svg",
  "warta.svg",
  "pzu.svg",
  "uniqa.svg",
  "ergo-hestia.svg",
  "ing.svg",
  "mbank.svg",
  "pko-bp.jpg",
] as const;
