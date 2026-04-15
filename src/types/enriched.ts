import type { KursVerwaltung, TeilnehmerAnmeldung } from './app';

export type EnrichedTeilnehmerAnmeldung = TeilnehmerAnmeldung & {
  kursName: string;
};

export type EnrichedKursVerwaltung = KursVerwaltung & {
  kursleiterName: string;
};
