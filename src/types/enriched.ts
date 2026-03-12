import type { KursVerwaltung, TeilnehmerAnmeldung, YogaKursManagement } from './app';

export type EnrichedTeilnehmerAnmeldung = TeilnehmerAnmeldung & {
  kursName: string;
};

export type EnrichedKursVerwaltung = KursVerwaltung & {
  kursleiterName: string;
};

export type EnrichedYogaKursManagement = YogaKursManagement & {
  uebergeordnetes_panelName: string;
};
