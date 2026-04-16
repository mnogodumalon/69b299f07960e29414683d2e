import type { YogaKursManagement } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { IconPencil } from '@tabler/icons-react';

interface YogaKursManagementViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: YogaKursManagement | null;
  onEdit: (record: YogaKursManagement) => void;
  yoga_kurs_managementList: YogaKursManagement[];
}

export function YogaKursManagementViewDialog({ open, onClose, record, onEdit, yoga_kurs_managementList }: YogaKursManagementViewDialogProps) {
  function getYogaKursManagementDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return yoga_kurs_managementList.find(r => r.record_id === id)?.fields.icon ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yoga Kurs Management anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil stroke={1.5} className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Title</Label>
            <p className="text-sm">{record.fields.title ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">URL</Label>
            <p className="text-sm">{record.fields.url ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Template</Label>
            <p className="text-sm">{record.fields.template ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Breite (Mobil)</Label>
            <p className="text-sm">{record.fields.breite_mobil2 ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Höhe (Mobil)</Label>
            <p className="text-sm">{record.fields.hoehe_mobil2 ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Spalte (Tablet)</Label>
            <p className="text-sm">{record.fields.spalte_tablet ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Breite (Desktop)</Label>
            <p className="text-sm">{record.fields.breite_tablet2 ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Spalte (Desktop)</Label>
            <p className="text-sm">{record.fields.spalte_desktop ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Spalte (FullHD)</Label>
            <p className="text-sm">{record.fields.spalte_fullhd ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Darstellung</Label>
            <Badge variant="secondary">{record.fields.darstellung?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hintergrund-Farbe 2 hell</Label>
            <p className="text-sm">{record.fields.hintergrund_farbe_2_hell ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Kategorie</Label>
            <p className="text-sm">{record.fields.kategorie ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hintergrund-Farbe 1 hell</Label>
            <p className="text-sm">{record.fields.hintergrund_farbe_1_hell ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hintergrund-Bild hell</Label>
            {record.fields.hintergrund_bild_hell ? (
              <div className="relative w-full rounded-lg bg-muted overflow-hidden border">
                <img src={record.fields.hintergrund_bild_hell} alt="" className="w-full h-auto object-contain" />
              </div>
            ) : <p className="text-sm text-muted-foreground">—</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">App-ID</Label>
            <p className="text-sm">{record.fields.app_id ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Icon</Label>
            <p className="text-sm">{record.fields.icon ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Parameter-Identifizierer</Label>
            <p className="text-sm">{record.fields.parameter_identifizierer ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Target</Label>
            <p className="text-sm">{record.fields.target ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Breite (Tablet)</Label>
            <p className="text-sm">{record.fields.breite_tablet ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Höhe (Widescreen)</Label>
            <p className="text-sm">{record.fields.hoehe_widescreen ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Höhe (FullHD)</Label>
            <p className="text-sm">{record.fields.hoehe_fullhd ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Text-Farbe hell</Label>
            <p className="text-sm">{record.fields.text_farbe_hell ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hintergrund-Bild dunkel</Label>
            {record.fields.hintergrund_bild_dunkel ? (
              <div className="relative w-full rounded-lg bg-muted overflow-hidden border">
                <img src={record.fields.hintergrund_bild_dunkel} alt="" className="w-full h-auto object-contain" />
              </div>
            ) : <p className="text-sm text-muted-foreground">—</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Übergeordnetes Panel</Label>
            <p className="text-sm">{getYogaKursManagementDisplayName(record.fields.uebergeordnetes_panel)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dummy</Label>
            <p className="text-sm">{record.fields.dummy ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Beschriftung</Label>
            <p className="text-sm">{record.fields.beschriftung ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Reihenfolge</Label>
            <p className="text-sm">{record.fields.reihenfolge ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Höhe (Tablet)</Label>
            <p className="text-sm">{record.fields.hoehe_tablet ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Spalte (Widescreen)</Label>
            <p className="text-sm">{record.fields.spalte_widescreen ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Beschreibung</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.beschreibung ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Höhe (Desktop)</Label>
            <p className="text-sm">{record.fields.hoehe_desktop ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Breite (Widescreen)</Label>
            <p className="text-sm">{record.fields.breite_widescreen ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Breite (FullHD)</Label>
            <p className="text-sm">{record.fields.breite_fullhd ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hintergrund</Label>
            <Badge variant="secondary">{record.fields.hintergrund?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Text-Farbe dunkel</Label>
            <p className="text-sm">{record.fields.text_farbe_dunkel ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hintergrund-Farbe 1 dunkel</Label>
            <p className="text-sm">{record.fields.hintergrund_farbe_1_dunkel ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hintergrund-Farbe 2 dunkel</Label>
            <p className="text-sm">{record.fields.hintergrund_farbe_2_dunkel ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">CSS-Class</Label>
            <p className="text-sm">{record.fields.css_class ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Spalte (Mobil)</Label>
            <p className="text-sm">{record.fields.spalte_mobil2 ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Parameter-Typ</Label>
            <Badge variant="secondary">{record.fields.parameter_typ?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Parameter ist zurücksetzbar</Label>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              record.fields.parameter_ist_zuruecksetzbar ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {record.fields.parameter_ist_zuruecksetzbar ? 'Ja' : 'Nein'}
            </span>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Parameter ist Pflichtfeld</Label>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              record.fields.parameter_ist_pflichtfeld ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {record.fields.parameter_ist_pflichtfeld ? 'Ja' : 'Nein'}
            </span>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Parameter-Optionen</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.parameter_optionen ?? '—'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}