export type ServiceIconName =
  | "heart"
  | "car"
  | "house"
  | "airplane"
  | "building"
  | "bank";

export const services = [
  {
    id: "zycie",
    icon: "heart",
    title: "Ubezpieczenia na życie",
    body: "Ochrona rodziny, dochodu, kredytu oraz zabezpieczenie na wypadek poważnych zdarzeń.",
  },
  {
    id: "samochod",
    icon: "car",
    title: "Samochód",
    body: "OC, AC, assistance i NNW z porównaniem zakresu oraz warunków.",
  },
  {
    id: "dom",
    icon: "house",
    title: "Dom i mieszkanie",
    body: "Ochrona nieruchomości, wyposażenia oraz odpowiedzialności cywilnej.",
  },
  {
    id: "podroze",
    icon: "airplane",
    title: "Podróże",
    body: "Zakres dopasowany do kierunku, długości wyjazdu i planowanych aktywności.",
  },
  {
    id: "firma",
    icon: "building",
    title: "Firma",
    body: "OC działalności, majątek, pracownicy i ochrona właściciela firmy.",
  },
  {
    id: "kredyty",
    icon: "bank",
    title: "Kredyty i finansowanie",
    body: "Możliwości dostępne w ramach współpracy z dziewięcioma bankami oraz Lendi.",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  icon: ServiceIconName;
  title: string;
  body: string;
}>;
