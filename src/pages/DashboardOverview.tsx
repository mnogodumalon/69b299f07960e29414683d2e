import { useState, useMemo, useCallback } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { enrichTeilnehmerAnmeldung, enrichKursVerwaltung } from '@/lib/enrich';
import type { EnrichedKursVerwaltung } from '@/types/enriched';
import type { KursVerwaltung, TeilnehmerAnmeldung } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { AI_PHOTO_SCAN } from '@/config/ai-features';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { KursVerwaltungDialog } from '@/components/dialogs/KursVerwaltungDialog';
import { TeilnehmerAnmeldungDialog } from '@/components/dialogs/TeilnehmerAnmeldungDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle, Plus, Pencil, Trash2, Users, BookOpen,
  Clock, MapPin, User, ChevronRight, Calendar, TrendingUp, Euro
} from 'lucide-react';

// --- Utility ---
function isFuture(dt?: string) {
  if (!dt) return false;
  return new Date(dt) >= new Date();
}

function formatDateTime(dt?: string) {
  if (!dt) return '—';
  try {
    const d = new Date(dt);
    return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dt; }
}

const STIL_COLORS: Record<string, string> = {
  hatha: 'bg-green-100 text-green-800',
  vinyasa: 'bg-blue-100 text-blue-800',
  yin: 'bg-purple-100 text-purple-800',
  ashtanga: 'bg-orange-100 text-orange-800',
  kundalini: 'bg-yellow-100 text-yellow-800',
  restorative: 'bg-teal-100 text-teal-800',
  power: 'bg-red-100 text-red-800',
  prenatal: 'bg-pink-100 text-pink-800',
};

const LEVEL_COLORS: Record<string, string> = {
  anfaenger: 'bg-emerald-100 text-emerald-700',
  fortgeschritten: 'bg-amber-100 text-amber-700',
  alle_levels: 'bg-slate-100 text-slate-700',
};

// --- Main ---
export default function DashboardOverview() {
  const {
    teilnehmerAnmeldung, kursVerwaltung, kursleiterVerwaltung,
    kursVerwaltungMap, kursleiterVerwaltungMap,
    loading, error, fetchAll,
  } = useDashboardData();

  // ALL hooks must be before early returns
  const [kursDialog, setKursDialog] = useState<{ open: boolean; record?: EnrichedKursVerwaltung }>({ open: false });
  const [anmeldungDialog, setAnmeldungDialog] = useState<{ open: boolean; record?: TeilnehmerAnmeldung; preKursId?: string }>({ open: false });
  const [deleteKurs, setDeleteKurs] = useState<EnrichedKursVerwaltung | null>(null);
  const [deleteTeilnehmer, setDeleteTeilnehmer] = useState<TeilnehmerAnmeldung | null>(null);
  const [selectedKursId, setSelectedKursId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'alle' | 'zukuenftig' | 'vergangen'>('zukuenftig');

  const enrichedKurse = useMemo(
    () => enrichKursVerwaltung(kursVerwaltung, { kursleiterVerwaltungMap }),
    [kursVerwaltung, kursleiterVerwaltungMap]
  );

  const enrichedAnmeldungen = useMemo(
    () => enrichTeilnehmerAnmeldung(teilnehmerAnmeldung, { kursVerwaltungMap }),
    [teilnehmerAnmeldung, kursVerwaltungMap]
  );

  const filteredKurse = useMemo(() => {
    const sorted = [...enrichedKurse].sort((a, b) => {
      const da = a.fields.datum_uhrzeit ?? '';
      const db = b.fields.datum_uhrzeit ?? '';
      return da.localeCompare(db);
    });
    if (filter === 'zukuenftig') return sorted.filter(k => isFuture(k.fields.datum_uhrzeit));
    if (filter === 'vergangen') return sorted.filter(k => !isFuture(k.fields.datum_uhrzeit));
    return sorted;
  }, [enrichedKurse, filter]);

  const selectedKurs = useMemo(
    () => enrichedKurse.find(k => k.record_id === selectedKursId) ?? null,
    [enrichedKurse, selectedKursId]
  );

  const anmeldungenFuerKurs = useMemo(() => {
    if (!selectedKursId) return [];
    return enrichedAnmeldungen.filter(a => {
      const id = extractRecordId(a.fields.kurs);
      return id === selectedKursId;
    });
  }, [enrichedAnmeldungen, selectedKursId]);

  const totalRevenue = useMemo(() => {
    return enrichedKurse.reduce((sum, k) => {
      const reg = enrichedAnmeldungen.filter(a => extractRecordId(a.fields.kurs) === k.record_id).length;
      return sum + (k.fields.preis ?? 0) * reg;
    }, 0);
  }, [enrichedKurse, enrichedAnmeldungen]);

  const upcomingCount = useMemo(
    () => enrichedKurse.filter(k => isFuture(k.fields.datum_uhrzeit)).length,
    [enrichedKurse]
  );

  const handleKursSave = useCallback(async (fields: KursVerwaltung['fields']) => {
    if (kursDialog.record) {
      await LivingAppsService.updateKursVerwaltungEntry(kursDialog.record.record_id, fields);
    } else {
      await LivingAppsService.createKursVerwaltungEntry(fields);
    }
    fetchAll();
  }, [kursDialog.record, fetchAll]);

  const handleAnmeldungSave = useCallback(async (fields: TeilnehmerAnmeldung['fields']) => {
    if (anmeldungDialog.record) {
      await LivingAppsService.updateTeilnehmerAnmeldungEntry(anmeldungDialog.record.record_id, fields);
    } else {
      await LivingAppsService.createTeilnehmerAnmeldungEntry(fields);
    }
    fetchAll();
  }, [anmeldungDialog.record, fetchAll]);

  const handleDeleteKurs = useCallback(async () => {
    if (!deleteKurs) return;
    await LivingAppsService.deleteKursVerwaltungEntry(deleteKurs.record_id);
    if (selectedKursId === deleteKurs.record_id) setSelectedKursId(null);
    setDeleteKurs(null);
    fetchAll();
  }, [deleteKurs, selectedKursId, fetchAll]);

  const handleDeleteTeilnehmer = useCallback(async () => {
    if (!deleteTeilnehmer) return;
    await LivingAppsService.deleteTeilnehmerAnmeldungEntry(deleteTeilnehmer.record_id);
    setDeleteTeilnehmer(null);
    fetchAll();
  }, [deleteTeilnehmer, fetchAll]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  const capacity = selectedKurs?.fields.max_teilnehmer ?? 0;
  const registered = anmeldungenFuerKurs.length;
  const occupancy = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Yoga Kurse</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kursverwaltung &amp; Anmeldungen</p>
        </div>
        <Button onClick={() => setKursDialog({ open: true })} className="gap-2 shrink-0">
          <Plus size={16} className="shrink-0" />
          <span>Neuer Kurs</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Kurse gesamt"
          value={String(enrichedKurse.length)}
          description="Alle Kurse"
          icon={<BookOpen size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Bevorstehend"
          value={String(upcomingCount)}
          description="Zukünftige Kurse"
          icon={<Calendar size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Anmeldungen"
          value={String(teilnehmerAnmeldung.length)}
          description="Teilnehmer gesamt"
          icon={<Users size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Einnahmen"
          value={formatCurrency(totalRevenue)}
          description="Geschätzte Einnahmen"
          icon={<Euro size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Main workspace: Kurs list + Detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Kurs List */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-border bg-card">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-3 border-b border-border bg-muted/30">
            {(['zukuenftig', 'alle', 'vergangen'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {f === 'zukuenftig' ? 'Kommend' : f === 'alle' ? 'Alle' : 'Vergangen'}
              </button>
            ))}
          </div>

          {filteredKurse.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <BookOpen size={36} />
              <p className="text-sm">Keine Kurse</p>
              <Button size="sm" variant="outline" onClick={() => setKursDialog({ open: true })}>
                <Plus size={14} className="mr-1" /> Kurs anlegen
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border overflow-y-auto" style={{ maxHeight: '520px' }}>
              {filteredKurse.map(kurs => {
                const reg = enrichedAnmeldungen.filter(a => extractRecordId(a.fields.kurs) === kurs.record_id).length;
                const max = kurs.fields.max_teilnehmer ?? 0;
                const isFull = max > 0 && reg >= max;
                const stilKey = kurs.fields.yoga_stil?.key ?? '';
                const isSelected = selectedKursId === kurs.record_id;

                return (
                  <div
                    key={kurs.record_id}
                    onClick={() => setSelectedKursId(isSelected ? null : kurs.record_id)}
                    className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/8 border-l-2 border-primary'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm text-foreground truncate">
                          {kurs.fields.kursname ?? '—'}
                        </p>
                        {isFull && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">Voll</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(kurs.fields.datum_uhrzeit)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {kurs.fields.yoga_stil && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${STIL_COLORS[stilKey] ?? 'bg-muted text-muted-foreground'}`}>
                            {kurs.fields.yoga_stil.label}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Users size={10} /> {reg}{max > 0 ? `/${max}` : ''}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={`shrink-0 mt-1 transition-transform text-muted-foreground ${isSelected ? 'rotate-90 text-primary' : ''}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          {!selectedKurs ? (
            <div className="h-full rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <TrendingUp size={40} />
              <p className="font-medium text-sm">Kurs auswählen</p>
              <p className="text-xs text-center max-w-48">Klicke auf einen Kurs links, um Details und Anmeldungen zu sehen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Kurs Header Card */}
              <div className="rounded-2xl border border-border bg-card p-5 overflow-hidden">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-foreground truncate">{selectedKurs.fields.kursname}</h2>
                    {selectedKurs.fields.beschreibung && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{selectedKurs.fields.beschreibung}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setKursDialog({ open: true, record: selectedKurs })}
                      className="gap-1.5"
                    >
                      <Pencil size={13} className="shrink-0" />
                      <span className="hidden sm:inline">Bearbeiten</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteKurs(selectedKurs)}
                      className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={13} className="shrink-0" />
                    </Button>
                  </div>
                </div>

                {/* Meta row */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">Datum</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Calendar size={12} className="text-primary shrink-0" />
                      {formatDateTime(selectedKurs.fields.datum_uhrzeit)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">Dauer</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Clock size={12} className="text-primary shrink-0" />
                      {selectedKurs.fields.dauer ? `${selectedKurs.fields.dauer} Min.` : '—'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">Ort / Raum</span>
                    <span className="text-sm font-medium flex items-center gap-1 truncate">
                      <MapPin size={12} className="text-primary shrink-0" />
                      <span className="truncate">{selectedKurs.fields.ort_raum ?? '—'}</span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">Kursleiter</span>
                    <span className="text-sm font-medium flex items-center gap-1 truncate">
                      <User size={12} className="text-primary shrink-0" />
                      <span className="truncate">{selectedKurs.kursleiterName || '—'}</span>
                    </span>
                  </div>
                </div>

                {/* Tags + Price row */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {selectedKurs.fields.yoga_stil && (
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${STIL_COLORS[selectedKurs.fields.yoga_stil.key] ?? 'bg-muted text-muted-foreground'}`}>
                      {selectedKurs.fields.yoga_stil.label}
                    </span>
                  )}
                  {selectedKurs.fields.schwierigkeitsgrad && (
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${LEVEL_COLORS[selectedKurs.fields.schwierigkeitsgrad.key] ?? 'bg-muted text-muted-foreground'}`}>
                      {selectedKurs.fields.schwierigkeitsgrad.label}
                    </span>
                  )}
                  {selectedKurs.fields.preis != null && (
                    <span className="ml-auto text-sm font-bold text-foreground">
                      {formatCurrency(selectedKurs.fields.preis)}
                    </span>
                  )}
                </div>

                {/* Occupancy bar */}
                {capacity > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Belegung</span>
                      <span className={`font-medium ${occupancy >= 100 ? 'text-destructive' : occupancy >= 80 ? 'text-amber-600' : 'text-green-600'}`}>
                        {registered} / {capacity} ({occupancy}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancy >= 100 ? 'bg-destructive' : occupancy >= 80 ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Teilnehmer Section */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <Users size={15} className="text-primary shrink-0" />
                    Angemeldete Teilnehmer
                    <span className="ml-1 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full font-medium">
                      {registered}
                    </span>
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAnmeldungDialog({ open: true, preKursId: selectedKursId ?? undefined })}
                    className="gap-1.5 text-xs"
                  >
                    <Plus size={13} className="shrink-0" />
                    <span>Anmelden</span>
                  </Button>
                </div>

                {anmeldungenFuerKurs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                    <Users size={32} />
                    <p className="text-sm">Noch keine Anmeldungen</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAnmeldungDialog({ open: true, preKursId: selectedKursId ?? undefined })}
                    >
                      <Plus size={13} className="mr-1" /> Ersten Teilnehmer anmelden
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border overflow-y-auto" style={{ maxHeight: '280px' }}>
                    {anmeldungenFuerKurs.map(a => (
                      <div key={a.record_id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/40 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {(a.fields.teilnehmer_vorname?.[0] ?? '?').toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {[a.fields.teilnehmer_vorname, a.fields.teilnehmer_nachname].filter(Boolean).join(' ') || '—'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {a.fields.teilnehmer_email ?? a.fields.teilnehmer_telefon ?? (a.fields.anmeldedatum ? `Angemeldet: ${formatDate(a.fields.anmeldedatum)}` : '—')}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => setAnmeldungDialog({ open: true, record: a })}
                            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTeilnehmer(a)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <KursVerwaltungDialog
        open={kursDialog.open}
        onClose={() => setKursDialog({ open: false })}
        onSubmit={handleKursSave}
        defaultValues={kursDialog.record?.fields}
        kursleiter_verwaltungList={kursleiterVerwaltung}
        enablePhotoScan={AI_PHOTO_SCAN['KursVerwaltung']}
      />

      <TeilnehmerAnmeldungDialog
        open={anmeldungDialog.open}
        onClose={() => setAnmeldungDialog({ open: false })}
        onSubmit={handleAnmeldungSave}
        defaultValues={
          anmeldungDialog.record
            ? anmeldungDialog.record.fields
            : anmeldungDialog.preKursId
              ? { kurs: createRecordUrl(APP_IDS.KURS_VERWALTUNG, anmeldungDialog.preKursId) }
              : undefined
        }
        kurs_verwaltungList={kursVerwaltung}
        enablePhotoScan={AI_PHOTO_SCAN['TeilnehmerAnmeldung']}
      />

      <ConfirmDialog
        open={!!deleteKurs}
        title="Kurs löschen"
        description={`Kurs "${deleteKurs?.fields.kursname}" wirklich löschen? Alle Anmeldungen bleiben erhalten.`}
        onConfirm={handleDeleteKurs}
        onClose={() => setDeleteKurs(null)}
      />

      <ConfirmDialog
        open={!!deleteTeilnehmer}
        title="Anmeldung löschen"
        description={`Anmeldung von "${[deleteTeilnehmer?.fields.teilnehmer_vorname, deleteTeilnehmer?.fields.teilnehmer_nachname].filter(Boolean).join(' ')}" wirklich löschen?`}
        onConfirm={handleDeleteTeilnehmer}
        onClose={() => setDeleteTeilnehmer(null)}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
        <Skeleton className="lg:col-span-3 h-96 rounded-2xl" />
      </div>
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <AlertCircle size={22} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{error.message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}
