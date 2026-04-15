import type { TeilnehmerAnmeldung, KursVerwaltung } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IconPencil } from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

interface TeilnehmerAnmeldungViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: TeilnehmerAnmeldung | null;
  onEdit: (record: TeilnehmerAnmeldung) => void;
  kurs_verwaltungList: KursVerwaltung[];
}

export function TeilnehmerAnmeldungViewDialog({ open, onClose, record, onEdit, kurs_verwaltungList }: TeilnehmerAnmeldungViewDialogProps) {
  function getKursVerwaltungDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return kurs_verwaltungList.find(r => r.record_id === id)?.fields.kursname ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Teilnehmer-Anmeldung anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Kurs</Label>
            <p className="text-sm">{getKursVerwaltungDisplayName(record.fields.kurs)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Vorname</Label>
            <p className="text-sm">{record.fields.teilnehmer_vorname ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Nachname</Label>
            <p className="text-sm">{record.fields.teilnehmer_nachname ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">E-Mail</Label>
            <p className="text-sm">{record.fields.teilnehmer_email ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Telefon</Label>
            <p className="text-sm">{record.fields.teilnehmer_telefon ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Anmeldedatum</Label>
            <p className="text-sm">{formatDate(record.fields.anmeldedatum)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Besondere Anforderungen / Hinweise</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.besondere_hinweise ?? '—'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}