import type { EnrichedKursVerwaltung, EnrichedTeilnehmerAnmeldung, EnrichedYogaKursManagement } from '@/types/enriched';
import type { KursVerwaltung, KursleiterVerwaltung, TeilnehmerAnmeldung, YogaKursManagement } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface TeilnehmerAnmeldungMaps {
  kursVerwaltungMap: Map<string, KursVerwaltung>;
}

export function enrichTeilnehmerAnmeldung(
  teilnehmerAnmeldung: TeilnehmerAnmeldung[],
  maps: TeilnehmerAnmeldungMaps
): EnrichedTeilnehmerAnmeldung[] {
  return teilnehmerAnmeldung.map(r => ({
    ...r,
    kursName: resolveDisplay(r.fields.kurs, maps.kursVerwaltungMap, 'kursname'),
  }));
}

interface KursVerwaltungMaps {
  kursleiterVerwaltungMap: Map<string, KursleiterVerwaltung>;
}

export function enrichKursVerwaltung(
  kursVerwaltung: KursVerwaltung[],
  maps: KursVerwaltungMaps
): EnrichedKursVerwaltung[] {
  return kursVerwaltung.map(r => ({
    ...r,
    kursleiterName: resolveDisplay(r.fields.kursleiter, maps.kursleiterVerwaltungMap, 'vorname', 'nachname'),
  }));
}

interface YogaKursManagementMaps {
  yogaKursManagementMap: Map<string, YogaKursManagement>;
}

export function enrichYogaKursManagement(
  yogaKursManagement: YogaKursManagement[],
  maps: YogaKursManagementMaps
): EnrichedYogaKursManagement[] {
  return yogaKursManagement.map(r => ({
    ...r,
    uebergeordnetes_panelName: resolveDisplay(r.fields.uebergeordnetes_panel, maps.yogaKursManagementMap, 'icon'),
  }));
}
