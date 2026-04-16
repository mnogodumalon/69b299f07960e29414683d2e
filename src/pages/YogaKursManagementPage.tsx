import { useState, useEffect } from 'react';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import type { YogaKursManagement } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { IconPencil, IconTrash, IconPlus, IconSearch, IconArrowsSort, IconArrowUp, IconArrowDown, IconFileText } from '@tabler/icons-react';
import { YogaKursManagementDialog } from '@/components/dialogs/YogaKursManagementDialog';
import { YogaKursManagementViewDialog } from '@/components/dialogs/YogaKursManagementViewDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageShell } from '@/components/PageShell';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';

export default function YogaKursManagementPage() {
  const [records, setRecords] = useState<YogaKursManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<YogaKursManagement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<YogaKursManagement | null>(null);
  const [viewingRecord, setViewingRecord] = useState<YogaKursManagement | null>(null);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [yoga_kurs_managementList, setYogaKursManagementList] = useState<YogaKursManagement[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [mainData, yoga_kurs_managementData] = await Promise.all([
        LivingAppsService.getYogaKursManagement(),
        LivingAppsService.getYogaKursManagement(),
      ]);
      setRecords(mainData);
      setYogaKursManagementList(yoga_kurs_managementData);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(fields: YogaKursManagement['fields']) {
    await LivingAppsService.createYogaKursManagementEntry(fields);
    await loadData();
    setDialogOpen(false);
  }

  async function handleUpdate(fields: YogaKursManagement['fields']) {
    if (!editingRecord) return;
    await LivingAppsService.updateYogaKursManagementEntry(editingRecord.record_id, fields);
    await loadData();
    setEditingRecord(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await LivingAppsService.deleteYogaKursManagementEntry(deleteTarget.record_id);
    setRecords(prev => prev.filter(r => r.record_id !== deleteTarget.record_id));
    setDeleteTarget(null);
  }

  function getYogaKursManagementDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return yoga_kurs_managementList.find(r => r.record_id === id)?.fields.icon ?? '—';
  }

  const filtered = records.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return Object.values(r.fields).some(v => {
      if (v == null) return false;
      if (Array.isArray(v)) return v.some(item => typeof item === 'object' && item !== null && 'label' in item ? String((item as any).label).toLowerCase().includes(s) : String(item).toLowerCase().includes(s));
      if (typeof v === 'object' && 'label' in (v as any)) return String((v as any).label).toLowerCase().includes(s);
      return String(v).toLowerCase().includes(s);
    });
  });

  function toggleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey(''); setSortDir('asc'); }
    } else { setSortKey(key); setSortDir('asc'); }
  }

  function sortRecords<T extends { fields: Record<string, any> }>(recs: T[]): T[] {
    if (!sortKey) return recs;
    return [...recs].sort((a, b) => {
      let va: any = a.fields[sortKey], vb: any = b.fields[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'object' && 'label' in va) va = va.label;
      if (typeof vb === 'object' && 'label' in vb) vb = vb.label;
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <PageShell
      title="Yoga Kurs Management"
      subtitle={`${records.length} Yoga Kurs Management im System`}
      action={
        <Button onClick={() => setDialogOpen(true)} className="shrink-0 rounded-full shadow-sm">
          <IconPlus stroke={1.5} className="h-4 w-4 mr-2" /> Hinzufügen
        </Button>
      }
    >
      <div className="relative w-full max-w-sm">
        <IconSearch stroke={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Yoga Kurs Management suchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="rounded-[27px] bg-card shadow-lg overflow-hidden">
        <Table className="[&_tbody_td]:px-6 [&_tbody_td]:py-2 [&_tbody_td]:text-base [&_tbody_td]:font-medium [&_tbody_tr:first-child_td]:pt-6 [&_tbody_tr:last-child_td]:pb-10">
          <TableHeader className="bg-secondary">
            <TableRow className="border-b border-input">
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('title')}>
                <span className="inline-flex items-center gap-1">
                  Title
                  {sortKey === 'title' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('url')}>
                <span className="inline-flex items-center gap-1">
                  URL
                  {sortKey === 'url' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('template')}>
                <span className="inline-flex items-center gap-1">
                  Template
                  {sortKey === 'template' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('breite_mobil2')}>
                <span className="inline-flex items-center gap-1">
                  Breite (Mobil)
                  {sortKey === 'breite_mobil2' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('hoehe_mobil2')}>
                <span className="inline-flex items-center gap-1">
                  Höhe (Mobil)
                  {sortKey === 'hoehe_mobil2' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('spalte_tablet')}>
                <span className="inline-flex items-center gap-1">
                  Spalte (Tablet)
                  {sortKey === 'spalte_tablet' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('breite_tablet2')}>
                <span className="inline-flex items-center gap-1">
                  Breite (Desktop)
                  {sortKey === 'breite_tablet2' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('spalte_desktop')}>
                <span className="inline-flex items-center gap-1">
                  Spalte (Desktop)
                  {sortKey === 'spalte_desktop' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('spalte_fullhd')}>
                <span className="inline-flex items-center gap-1">
                  Spalte (FullHD)
                  {sortKey === 'spalte_fullhd' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('darstellung')}>
                <span className="inline-flex items-center gap-1">
                  Darstellung
                  {sortKey === 'darstellung' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('hintergrund_farbe_2_hell')}>
                <span className="inline-flex items-center gap-1">
                  Hintergrund-Farbe 2 hell
                  {sortKey === 'hintergrund_farbe_2_hell' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('kategorie')}>
                <span className="inline-flex items-center gap-1">
                  Kategorie
                  {sortKey === 'kategorie' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('hintergrund_farbe_1_hell')}>
                <span className="inline-flex items-center gap-1">
                  Hintergrund-Farbe 1 hell
                  {sortKey === 'hintergrund_farbe_1_hell' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('hintergrund_bild_hell')}>
                <span className="inline-flex items-center gap-1">
                  Hintergrund-Bild hell
                  {sortKey === 'hintergrund_bild_hell' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('app_id')}>
                <span className="inline-flex items-center gap-1">
                  App-ID
                  {sortKey === 'app_id' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('icon')}>
                <span className="inline-flex items-center gap-1">
                  Icon
                  {sortKey === 'icon' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('parameter_identifizierer')}>
                <span className="inline-flex items-center gap-1">
                  Parameter-Identifizierer
                  {sortKey === 'parameter_identifizierer' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('target')}>
                <span className="inline-flex items-center gap-1">
                  Target
                  {sortKey === 'target' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('breite_tablet')}>
                <span className="inline-flex items-center gap-1">
                  Breite (Tablet)
                  {sortKey === 'breite_tablet' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('hoehe_widescreen')}>
                <span className="inline-flex items-center gap-1">
                  Höhe (Widescreen)
                  {sortKey === 'hoehe_widescreen' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('hoehe_fullhd')}>
                <span className="inline-flex items-center gap-1">
                  Höhe (FullHD)
                  {sortKey === 'hoehe_fullhd' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('text_farbe_hell')}>
                <span className="inline-flex items-center gap-1">
                  Text-Farbe hell
                  {sortKey === 'text_farbe_hell' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('hintergrund_bild_dunkel')}>
                <span className="inline-flex items-center gap-1">
                  Hintergrund-Bild dunkel
                  {sortKey === 'hintergrund_bild_dunkel' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('uebergeordnetes_panel')}>
                <span className="inline-flex items-center gap-1">
                  Übergeordnetes Panel
                  {sortKey === 'uebergeordnetes_panel' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('dummy')}>
                <span className="inline-flex items-center gap-1">
                  Dummy
                  {sortKey === 'dummy' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('beschriftung')}>
                <span className="inline-flex items-center gap-1">
                  Beschriftung
                  {sortKey === 'beschriftung' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('reihenfolge')}>
                <span className="inline-flex items-center gap-1">
                  Reihenfolge
                  {sortKey === 'reihenfolge' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('hoehe_tablet')}>
                <span className="inline-flex items-center gap-1">
                  Höhe (Tablet)
                  {sortKey === 'hoehe_tablet' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('spalte_widescreen')}>
                <span className="inline-flex items-center gap-1">
                  Spalte (Widescreen)
                  {sortKey === 'spalte_widescreen' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('beschreibung')}>
                <span className="inline-flex items-center gap-1">
                  Beschreibung
                  {sortKey === 'beschreibung' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('hoehe_desktop')}>
                <span className="inline-flex items-center gap-1">
                  Höhe (Desktop)
                  {sortKey === 'hoehe_desktop' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('breite_widescreen')}>
                <span className="inline-flex items-center gap-1">
                  Breite (Widescreen)
                  {sortKey === 'breite_widescreen' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('breite_fullhd')}>
                <span className="inline-flex items-center gap-1">
                  Breite (FullHD)
                  {sortKey === 'breite_fullhd' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('hintergrund')}>
                <span className="inline-flex items-center gap-1">
                  Hintergrund
                  {sortKey === 'hintergrund' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('text_farbe_dunkel')}>
                <span className="inline-flex items-center gap-1">
                  Text-Farbe dunkel
                  {sortKey === 'text_farbe_dunkel' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('hintergrund_farbe_1_dunkel')}>
                <span className="inline-flex items-center gap-1">
                  Hintergrund-Farbe 1 dunkel
                  {sortKey === 'hintergrund_farbe_1_dunkel' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('hintergrund_farbe_2_dunkel')}>
                <span className="inline-flex items-center gap-1">
                  Hintergrund-Farbe 2 dunkel
                  {sortKey === 'hintergrund_farbe_2_dunkel' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('css_class')}>
                <span className="inline-flex items-center gap-1">
                  CSS-Class
                  {sortKey === 'css_class' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('spalte_mobil2')}>
                <span className="inline-flex items-center gap-1">
                  Spalte (Mobil)
                  {sortKey === 'spalte_mobil2' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('parameter_typ')}>
                <span className="inline-flex items-center gap-1">
                  Parameter-Typ
                  {sortKey === 'parameter_typ' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('parameter_ist_zuruecksetzbar')}>
                <span className="inline-flex items-center gap-1">
                  Parameter ist zurücksetzbar
                  {sortKey === 'parameter_ist_zuruecksetzbar' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('parameter_ist_pflichtfeld')}>
                <span className="inline-flex items-center gap-1">
                  Parameter ist Pflichtfeld
                  {sortKey === 'parameter_ist_pflichtfeld' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6 cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => toggleSort('parameter_optionen')}>
                <span className="inline-flex items-center gap-1">
                  Parameter-Optionen
                  {sortKey === 'parameter_optionen' ? (sortDir === 'asc' ? <IconArrowUp size={14} stroke={1.5} /> : <IconArrowDown size={14} stroke={1.5} />) : <IconArrowsSort size={14} stroke={1.5} className="opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="w-24 uppercase text-xs font-semibold text-secondary-foreground tracking-wider px-6">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortRecords(filtered).map(record => (
              <TableRow key={record.record_id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={(e) => { if ((e.target as HTMLElement).closest('button, [role="checkbox"]')) return; setViewingRecord(record); }}>
                <TableCell className="font-medium">{record.fields.title ?? '—'}</TableCell>
                <TableCell>{record.fields.url ?? '—'}</TableCell>
                <TableCell>{record.fields.template ?? '—'}</TableCell>
                <TableCell>{record.fields.breite_mobil2 ?? '—'}</TableCell>
                <TableCell>{record.fields.hoehe_mobil2 ?? '—'}</TableCell>
                <TableCell>{record.fields.spalte_tablet ?? '—'}</TableCell>
                <TableCell>{record.fields.breite_tablet2 ?? '—'}</TableCell>
                <TableCell>{record.fields.spalte_desktop ?? '—'}</TableCell>
                <TableCell>{record.fields.spalte_fullhd ?? '—'}</TableCell>
                <TableCell><span className="inline-flex items-center bg-secondary border border-[#bfdbfe] text-[#2563eb] rounded-[10px] px-2 py-1 text-sm font-medium">{record.fields.darstellung?.label ?? '—'}</span></TableCell>
                <TableCell>{record.fields.hintergrund_farbe_2_hell ?? '—'}</TableCell>
                <TableCell>{record.fields.kategorie ?? '—'}</TableCell>
                <TableCell>{record.fields.hintergrund_farbe_1_hell ?? '—'}</TableCell>
                <TableCell>{record.fields.hintergrund_bild_hell ? <div className="relative h-8 w-8 rounded bg-muted overflow-hidden"><div className="absolute inset-0 flex items-center justify-center"><IconFileText size={14} stroke={1.5} className="text-muted-foreground" /></div><img src={record.fields.hintergrund_bild_hell} alt="" className="relative h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /></div> : '—'}</TableCell>
                <TableCell>{record.fields.app_id ?? '—'}</TableCell>
                <TableCell>{record.fields.icon ?? '—'}</TableCell>
                <TableCell>{record.fields.parameter_identifizierer ?? '—'}</TableCell>
                <TableCell>{record.fields.target ?? '—'}</TableCell>
                <TableCell>{record.fields.breite_tablet ?? '—'}</TableCell>
                <TableCell>{record.fields.hoehe_widescreen ?? '—'}</TableCell>
                <TableCell>{record.fields.hoehe_fullhd ?? '—'}</TableCell>
                <TableCell>{record.fields.text_farbe_hell ?? '—'}</TableCell>
                <TableCell>{record.fields.hintergrund_bild_dunkel ? <div className="relative h-8 w-8 rounded bg-muted overflow-hidden"><div className="absolute inset-0 flex items-center justify-center"><IconFileText size={14} stroke={1.5} className="text-muted-foreground" /></div><img src={record.fields.hintergrund_bild_dunkel} alt="" className="relative h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /></div> : '—'}</TableCell>
                <TableCell><span className="inline-flex items-center bg-secondary border border-[#bfdbfe] text-[#2563eb] rounded-[10px] px-2 py-1 text-sm font-medium">{getYogaKursManagementDisplayName(record.fields.uebergeordnetes_panel)}</span></TableCell>
                <TableCell>{record.fields.dummy ?? '—'}</TableCell>
                <TableCell>{record.fields.beschriftung ?? '—'}</TableCell>
                <TableCell>{record.fields.reihenfolge ?? '—'}</TableCell>
                <TableCell>{record.fields.hoehe_tablet ?? '—'}</TableCell>
                <TableCell>{record.fields.spalte_widescreen ?? '—'}</TableCell>
                <TableCell className="max-w-xs"><span className="truncate block">{record.fields.beschreibung ?? '—'}</span></TableCell>
                <TableCell>{record.fields.hoehe_desktop ?? '—'}</TableCell>
                <TableCell>{record.fields.breite_widescreen ?? '—'}</TableCell>
                <TableCell>{record.fields.breite_fullhd ?? '—'}</TableCell>
                <TableCell><span className="inline-flex items-center bg-secondary border border-[#bfdbfe] text-[#2563eb] rounded-[10px] px-2 py-1 text-sm font-medium">{record.fields.hintergrund?.label ?? '—'}</span></TableCell>
                <TableCell>{record.fields.text_farbe_dunkel ?? '—'}</TableCell>
                <TableCell>{record.fields.hintergrund_farbe_1_dunkel ?? '—'}</TableCell>
                <TableCell>{record.fields.hintergrund_farbe_2_dunkel ?? '—'}</TableCell>
                <TableCell>{record.fields.css_class ?? '—'}</TableCell>
                <TableCell>{record.fields.spalte_mobil2 ?? '—'}</TableCell>
                <TableCell><span className="inline-flex items-center bg-secondary border border-[#bfdbfe] text-[#2563eb] rounded-[10px] px-2 py-1 text-sm font-medium">{record.fields.parameter_typ?.label ?? '—'}</span></TableCell>
                <TableCell><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${record.fields.parameter_ist_zuruecksetzbar ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{record.fields.parameter_ist_zuruecksetzbar ? 'Ja' : 'Nein'}</span></TableCell>
                <TableCell><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${record.fields.parameter_ist_pflichtfeld ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{record.fields.parameter_ist_pflichtfeld ? 'Ja' : 'Nein'}</span></TableCell>
                <TableCell className="max-w-xs"><span className="truncate block">{record.fields.parameter_optionen ?? '—'}</span></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingRecord(record)}>
                      <IconPencil stroke={1.5} className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(record)}>
                      <IconTrash stroke={1.5} className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={44} className="text-center py-16 text-muted-foreground">
                  {search ? 'Keine Ergebnisse gefunden.' : 'Noch keine Yoga Kurs Management. Jetzt hinzufügen!'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <YogaKursManagementDialog
        open={dialogOpen || !!editingRecord}
        onClose={() => { setDialogOpen(false); setEditingRecord(null); }}
        onSubmit={editingRecord ? handleUpdate : handleCreate}
        defaultValues={editingRecord?.fields}
        yoga_kurs_managementList={yoga_kurs_managementList}
        enablePhotoScan={AI_PHOTO_SCAN['YogaKursManagement']}
        enablePhotoLocation={AI_PHOTO_LOCATION['YogaKursManagement']}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Yoga Kurs Management löschen"
        description="Soll dieser Eintrag wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden."
      />

      <YogaKursManagementViewDialog
        open={!!viewingRecord}
        onClose={() => setViewingRecord(null)}
        record={viewingRecord}
        onEdit={(r) => { setViewingRecord(null); setEditingRecord(r); }}
        yoga_kurs_managementList={yoga_kurs_managementList}
      />
    </PageShell>
  );
}