export type LanguageCode =
  | "en"
  | "zu"
  | "xh"
  | "af"
  | "nso"
  | "tn"
  | "st"
  | "ts"
  | "ss"
  | "ve"
  | "nr";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  english: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", english: "English" },
  { code: "zu", name: "isiZulu", english: "Zulu" },
  { code: "xh", name: "isiXhosa", english: "Xhosa" },
  { code: "af", name: "Afrikaans", english: "Afrikaans" },
  { code: "nso", name: "Sepedi", english: "Northern Sotho" },
  { code: "tn", name: "Setswana", english: "Tswana" },
  { code: "st", name: "Sesotho", english: "Southern Sotho" },
  { code: "ts", name: "Xitsonga", english: "Tsonga" },
  { code: "ss", name: "siSwati", english: "Swati" },
  { code: "ve", name: "Tshivenda", english: "Venda" },
  { code: "nr", name: "isiNdebele", english: "Ndebele" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.diagnosis": "Diagnosis",
  "nav.library": "Library",
  "nav.marketplace": "Marketplace",
  "nav.forum": "Forum",
  "nav.advisor": "Advisor",
  "nav.settings": "Settings",
  "app.greeting": "Welcome back",
  "app.language": "Language",
  "app.signOut": "Sign out",
  "diagnosis.title": "AI Crop Diagnosis",
  "diagnosis.subtitle": "Upload a photo of the affected plant and get an instant analysis.",
  "diagnosis.upload": "Upload photo",
  "diagnosis.analyse": "Analyse crop",
};

const overrides: Partial<Record<LanguageCode, Dict>> = {
  zu: {
    "nav.diagnosis": "Ukuhlola",
    "nav.library": "Umtapo",
    "nav.marketplace": "Imakethe",
    "nav.forum": "Inkundla",
    "nav.advisor": "Umeluleki",
    "nav.settings": "Izilungiselelo",
    "app.greeting": "Siyakwamukela",
    "app.language": "Ulimi",
    "app.signOut": "Phuma",
    "diagnosis.title": "Ukuhlola izitshalo nge-AI",
    "diagnosis.subtitle": "Layisha isithombe sesitshalo esithintekile uthole impendulo ngokushesha.",
    "diagnosis.upload": "Layisha isithombe",
    "diagnosis.analyse": "Hlola isitshalo",
  },
  xh: {
    "nav.diagnosis": "Uhlolo",
    "nav.library": "Ithala",
    "nav.marketplace": "Intengiso",
    "nav.forum": "Iqonga",
    "nav.advisor": "Umcebisi",
    "nav.settings": "Iisetingi",
    "app.greeting": "Wamkelekile",
    "app.language": "Ulwimi",
    "app.signOut": "Phuma",
    "diagnosis.title": "Uhlolo lwezityalo nge-AI",
    "diagnosis.subtitle": "Layisha umfanekiso wesityalo esichaphazelekileyo ufumane isiphumo ngoko nangoko.",
    "diagnosis.upload": "Layisha umfanekiso",
    "diagnosis.analyse": "Hlola isityalo",
  },
  af: {
    "nav.diagnosis": "Diagnose",
    "nav.library": "Biblioteek",
    "nav.marketplace": "Markplein",
    "nav.forum": "Forum",
    "nav.advisor": "Raadgewer",
    "nav.settings": "Instellings",
    "app.greeting": "Welkom terug",
    "app.language": "Taal",
    "app.signOut": "Teken uit",
    "diagnosis.title": "KI-gewasdiagnose",
    "diagnosis.subtitle": "Laai 'n foto van die geaffekteerde plant op vir 'n onmiddellike analise.",
    "diagnosis.upload": "Laai foto op",
    "diagnosis.analyse": "Analiseer gewas",
  },
  nso: {
    "nav.diagnosis": "Tlhahlobo",
    "nav.library": "Bokgobapuku",
    "nav.marketplace": "Mmaraka",
    "nav.forum": "Sebokeng",
    "nav.advisor": "Moeletsi",
    "nav.settings": "Dipeakanyo",
    "app.greeting": "Re a go amogela",
    "app.language": "Polelo",
    "app.signOut": "Tswa",
  },
  tn: {
    "nav.diagnosis": "Tlhatlhobo",
    "nav.library": "Laeborari",
    "nav.marketplace": "Mmaraka",
    "nav.forum": "Phuthego",
    "nav.advisor": "Mogakolodi",
    "nav.settings": "Dipeakanyo",
    "app.greeting": "O amogelesegile",
    "app.language": "Puo",
    "app.signOut": "Tswa",
  },
  st: {
    "nav.diagnosis": "Tlhahlobo",
    "nav.library": "Laeborari",
    "nav.marketplace": "Mmaraka",
    "nav.forum": "Sebokeng",
    "nav.advisor": "Moeletsi",
    "nav.settings": "Dintlha",
    "app.greeting": "Rea u amohela",
    "app.language": "Puo",
    "app.signOut": "Tsoa",
  },
  ts: {
    "nav.diagnosis": "Nkambisiso",
    "nav.library": "Layiburari",
    "nav.marketplace": "Makete",
    "nav.forum": "Huvo",
    "nav.advisor": "Mutsundzuxi",
    "nav.settings": "Swilulamisi",
    "app.greeting": "Ku amukeriwa",
    "app.language": "Ririmi",
    "app.signOut": "Huma",
  },
  ss: {
    "nav.diagnosis": "Kuhlola",
    "nav.library": "Umtapo",
    "nav.marketplace": "Imakethe",
    "nav.forum": "Inkhundla",
    "nav.advisor": "Umeluleki",
    "nav.settings": "Tilungiselelo",
    "app.greeting": "Siyakwemukela",
    "app.language": "Lulwimi",
    "app.signOut": "Phuma",
  },
  ve: {
    "nav.diagnosis": "U sedzulusa",
    "nav.library": "Vhulaiburari",
    "nav.marketplace": "Mmaraga",
    "nav.forum": "Buthano",
    "nav.advisor": "Mueletshedzi",
    "nav.settings": "Mavhekanyele",
    "app.greeting": "Ni a tanganedzwa",
    "app.language": "Luambo",
    "app.signOut": "Bva",
  },
  nr: {
    "nav.diagnosis": "Ukuhlola",
    "nav.library": "Ithala",
    "nav.marketplace": "Imakethe",
    "nav.forum": "Ibandla",
    "nav.advisor": "Umeluleki",
    "nav.settings": "Amalungiselelo",
    "app.greeting": "Siyakwamukela",
    "app.language": "Ulimi",
    "app.signOut": "Phuma",
  },
};

export function translate(code: LanguageCode, key: string): string {
  return overrides[code]?.[key] ?? en[key] ?? key;
}

export function languageName(code: LanguageCode): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? "English";
}
