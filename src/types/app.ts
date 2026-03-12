// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

export interface TeilnehmerAnmeldung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kurs?: string; // applookup -> URL zu 'KursVerwaltung' Record
    teilnehmer_vorname?: string;
    teilnehmer_nachname?: string;
    teilnehmer_email?: string;
    teilnehmer_telefon?: string;
    anmeldedatum?: string; // Format: YYYY-MM-DD oder ISO String
    besondere_hinweise?: string;
  };
}

export interface KursVerwaltung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kursname?: string;
    beschreibung?: string;
    yoga_stil?: LookupValue;
    schwierigkeitsgrad?: LookupValue;
    datum_uhrzeit?: string; // Format: YYYY-MM-DD oder ISO String
    dauer?: number;
    ort_raum?: string;
    max_teilnehmer?: number;
    preis?: number;
    kursleiter?: string; // applookup -> URL zu 'KursleiterVerwaltung' Record
  };
}

export interface YogaKursManagement {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    title?: string;
    url?: string;
    template?: string;
    breite_mobil2?: number;
    hoehe_mobil2?: number;
    spalte_tablet?: number;
    breite_tablet2?: number;
    spalte_desktop?: number;
    spalte_fullhd?: number;
    darstellung?: LookupValue;
    hintergrund_farbe_2_hell?: string;
    kategorie?: string;
    hintergrund_farbe_1_hell?: string;
    hintergrund_bild_hell?: string;
    app_id?: string;
    icon?: string;
    parameter_identifizierer?: string;
    target?: string;
    breite_tablet?: number;
    hoehe_widescreen?: number;
    hoehe_fullhd?: number;
    text_farbe_hell?: string;
    hintergrund_bild_dunkel?: string;
    uebergeordnetes_panel?: string; // applookup -> URL zu 'YogaKursManagement' Record
    dummy?: string;
    beschriftung?: string;
    reihenfolge?: number;
    hoehe_tablet?: number;
    spalte_widescreen?: number;
    beschreibung?: string;
    hoehe_desktop?: number;
    breite_widescreen?: number;
    breite_fullhd?: number;
    hintergrund?: LookupValue;
    text_farbe_dunkel?: string;
    hintergrund_farbe_1_dunkel?: string;
    hintergrund_farbe_2_dunkel?: string;
    css_class?: string;
    spalte_mobil2?: number;
    parameter_typ?: LookupValue;
    parameter_ist_zuruecksetzbar?: boolean;
    parameter_ist_pflichtfeld?: boolean;
    parameter_optionen?: string;
  };
}

export interface KursleiterVerwaltung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    nachname?: string;
    email?: string;
    telefon?: string;
    qualifikationen?: string;
    vorname?: string;
    spezialisierungen?: LookupValue[];
    biografie?: string;
  };
}

export const APP_IDS = {
  TEILNEHMER_ANMELDUNG: '69b299d6613496ad24b9483a',
  KURS_VERWALTUNG: '69b299d62510305efd4cefc5',
  YOGA_KURS_MANAGEMENT: '69b299f02fe7e06a23a283f9',
  KURSLEITER_VERWALTUNG: '69b299d1b93ba834c1f3484d',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  kurs_verwaltung: {
    yoga_stil: [{ key: "hatha", label: "Hatha Yoga" }, { key: "vinyasa", label: "Vinyasa Yoga" }, { key: "yin", label: "Yin Yoga" }, { key: "ashtanga", label: "Ashtanga Yoga" }, { key: "kundalini", label: "Kundalini Yoga" }, { key: "restorative", label: "Restorative Yoga" }, { key: "power", label: "Power Yoga" }, { key: "prenatal", label: "Prenatal Yoga" }],
    schwierigkeitsgrad: [{ key: "anfaenger", label: "Anfänger" }, { key: "fortgeschritten", label: "Fortgeschritten" }, { key: "alle_levels", label: "Alle Levels" }],
  },
  yoga_kurs_management: {
    darstellung: [{ key: "titel", label: "Titel" }, { key: "karte", label: "Karte" }],
    hintergrund: [{ key: "linearer_farbverlauf", label: "Linearer Farbverlauf" }, { key: "bild", label: "Bild" }, { key: "kreisfoermiger_farbverlauf", label: "Kreisförmiger Farbverlauf" }, { key: "einfache_farbe", label: "Einfache Farbe" }],
    parameter_typ: [{ key: "number", label: "number" }, { key: "string", label: "string" }, { key: "html", label: "html" }, { key: "color", label: "color" }, { key: "date", label: "date" }, { key: "option_1", label: "bool" }, { key: "option_2", label: "int" }, { key: "datetime", label: "datetime" }, { key: "datedelta", label: "datedelta" }, { key: "datetimedelta", label: "datetimedelta" }, { key: "monthdelta", label: "monthdelta" }, { key: "upload", label: "upload" }, { key: "control", label: "control" }],
  },
  kursleiter_verwaltung: {
    spezialisierungen: [{ key: "vinyasa", label: "Vinyasa Yoga" }, { key: "yin", label: "Yin Yoga" }, { key: "ashtanga", label: "Ashtanga Yoga" }, { key: "kundalini", label: "Kundalini Yoga" }, { key: "restorative", label: "Restorative Yoga" }, { key: "power", label: "Power Yoga" }, { key: "prenatal", label: "Prenatal Yoga" }, { key: "hatha", label: "Hatha Yoga" }],
  },
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'teilnehmer_anmeldung': {
    'kurs': 'applookup/select',
    'teilnehmer_vorname': 'string/text',
    'teilnehmer_nachname': 'string/text',
    'teilnehmer_email': 'string/email',
    'teilnehmer_telefon': 'string/tel',
    'anmeldedatum': 'date/date',
    'besondere_hinweise': 'string/textarea',
  },
  'kurs_verwaltung': {
    'kursname': 'string/text',
    'beschreibung': 'string/textarea',
    'yoga_stil': 'lookup/select',
    'schwierigkeitsgrad': 'lookup/select',
    'datum_uhrzeit': 'date/datetimeminute',
    'dauer': 'number',
    'ort_raum': 'string/text',
    'max_teilnehmer': 'number',
    'preis': 'number',
    'kursleiter': 'applookup/select',
  },
  'yoga_kurs_management': {
    'title': 'string/text',
    'url': 'string/text',
    'template': 'string/text',
    'breite_mobil2': 'number',
    'hoehe_mobil2': 'number',
    'spalte_tablet': 'number',
    'breite_tablet2': 'number',
    'spalte_desktop': 'number',
    'spalte_fullhd': 'number',
    'darstellung': 'lookup/select',
    'hintergrund_farbe_2_hell': 'string/text',
    'kategorie': 'string/text',
    'hintergrund_farbe_1_hell': 'string/text',
    'hintergrund_bild_hell': 'file',
    'app_id': 'string/text',
    'icon': 'string/text',
    'parameter_identifizierer': 'string/text',
    'target': 'string/text',
    'breite_tablet': 'number',
    'hoehe_widescreen': 'number',
    'hoehe_fullhd': 'number',
    'text_farbe_hell': 'string/text',
    'hintergrund_bild_dunkel': 'file',
    'uebergeordnetes_panel': 'applookup/select',
    'dummy': 'string/text',
    'beschriftung': 'string/text',
    'reihenfolge': 'number',
    'hoehe_tablet': 'number',
    'spalte_widescreen': 'number',
    'beschreibung': 'string/textarea',
    'hoehe_desktop': 'number',
    'breite_widescreen': 'number',
    'breite_fullhd': 'number',
    'hintergrund': 'lookup/select',
    'text_farbe_dunkel': 'string/text',
    'hintergrund_farbe_1_dunkel': 'string/text',
    'hintergrund_farbe_2_dunkel': 'string/text',
    'css_class': 'string/text',
    'spalte_mobil2': 'number',
    'parameter_typ': 'lookup/select',
    'parameter_ist_zuruecksetzbar': 'bool',
    'parameter_ist_pflichtfeld': 'bool',
    'parameter_optionen': 'string/textarea',
  },
  'kursleiter_verwaltung': {
    'nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'qualifikationen': 'string/textarea',
    'vorname': 'string/text',
    'spezialisierungen': 'multiplelookup/checkbox',
    'biografie': 'string/textarea',
  },
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateTeilnehmerAnmeldung = StripLookup<TeilnehmerAnmeldung['fields']>;
export type CreateKursVerwaltung = StripLookup<KursVerwaltung['fields']>;
export type CreateYogaKursManagement = StripLookup<YogaKursManagement['fields']>;
export type CreateKursleiterVerwaltung = StripLookup<KursleiterVerwaltung['fields']>;