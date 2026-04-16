import { useState, useEffect, useRef, useCallback } from 'react';
import type { YogaKursManagement } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId, createRecordUrl, cleanFieldsForApi, uploadFile, getUserProfile } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IconCamera, IconCircleCheck, IconFileText, IconPhotoPlus, IconLoader2, IconSparkles, IconUpload, IconX } from '@tabler/icons-react';
import { fileToDataUri, extractFromPhoto, extractPhotoMeta, reverseGeocode, dataUriToBlob } from '@/lib/ai';
import { lookupKey } from '@/lib/formatters';

interface YogaKursManagementDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (fields: YogaKursManagement['fields']) => Promise<void>;
  defaultValues?: YogaKursManagement['fields'];
  yoga_kurs_managementList: YogaKursManagement[];
  enablePhotoScan?: boolean;
  enablePhotoLocation?: boolean;
}

export function YogaKursManagementDialog({ open, onClose, onSubmit, defaultValues, yoga_kurs_managementList, enablePhotoScan = false, enablePhotoLocation = true }: YogaKursManagementDialogProps) {
  const [fields, setFields] = useState<Partial<YogaKursManagement['fields']>>({});
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [usePersonalInfo, setUsePersonalInfo] = useState(() => {
    try { return localStorage.getItem('ai-use-personal-info') === 'true'; } catch { return false; }
  });
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFields(defaultValues ?? {});
      setPreview(null);
      setScanSuccess(false);
    }
  }, [open, defaultValues]);
  useEffect(() => {
    try { localStorage.setItem('ai-use-personal-info', String(usePersonalInfo)); } catch {}
  }, [usePersonalInfo]);
  async function handleShowProfileInfo() {
    if (showProfileInfo) { setShowProfileInfo(false); return; }
    setProfileLoading(true);
    try {
      const p = await getUserProfile();
      setProfileData(p);
    } catch {
      setProfileData(null);
    } finally {
      setProfileLoading(false);
      setShowProfileInfo(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const clean = cleanFieldsForApi({ ...fields }, 'yoga_kurs_management');
      await onSubmit(clean as YogaKursManagement['fields']);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoScan(file: File) {
    setScanning(true);
    setScanSuccess(false);
    try {
      const [uri, meta] = await Promise.all([fileToDataUri(file), extractPhotoMeta(file)]);
      if (file.type.startsWith('image/')) setPreview(uri);
      const gps = enablePhotoLocation ? meta?.gps ?? null : null;
      const parts: string[] = [];
      let geoAddr = '';
      if (gps) {
        geoAddr = await reverseGeocode(gps.latitude, gps.longitude);
        parts.push(`Location coordinates: ${gps.latitude}, ${gps.longitude}`);
        if (geoAddr) parts.push(`Reverse-geocoded address: ${geoAddr}`);
      }
      if (meta?.dateTime) {
        parts.push(`Date taken: ${meta.dateTime.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')}`);
      }
      const contextParts: string[] = [];
      if (parts.length) {
        contextParts.push(`<photo-metadata>\nThe following metadata was extracted from the photo\'s EXIF data:\n${parts.join('\n')}\n</photo-metadata>`);
      }
      contextParts.push(`<available-records field="uebergeordnetes_panel" entity="Yoga Kurs Management">\n${JSON.stringify(yoga_kurs_managementList.map(r => ({ record_id: r.record_id, ...r.fields })), null, 2)}\n</available-records>`);
      if (usePersonalInfo) {
        try {
          const profile = await getUserProfile();
          contextParts.push(`<user-profile>\nThe following is the logged-in user\'s personal information. Use this to pre-fill relevant fields like name, email, address, company etc. when appropriate:\n${JSON.stringify(profile, null, 2)}\n</user-profile>`);
        } catch (err) {
          console.warn('Failed to fetch user profile:', err);
        }
      }
      const photoContext = contextParts.length ? contextParts.join('\n') : undefined;
      const schema = `{\n  "title": string | null, // Title\n  "url": string | null, // URL\n  "template": string | null, // Template\n  "breite_mobil2": number | null, // Breite (Mobil)\n  "hoehe_mobil2": number | null, // Höhe (Mobil)\n  "spalte_tablet": number | null, // Spalte (Tablet)\n  "breite_tablet2": number | null, // Breite (Desktop)\n  "spalte_desktop": number | null, // Spalte (Desktop)\n  "spalte_fullhd": number | null, // Spalte (FullHD)\n  "darstellung": LookupValue | null, // Darstellung (select one key: "titel" | "karte") mapping: titel=Titel, karte=Karte\n  "hintergrund_farbe_2_hell": string | null, // Hintergrund-Farbe 2 hell\n  "kategorie": string | null, // Kategorie\n  "hintergrund_farbe_1_hell": string | null, // Hintergrund-Farbe 1 hell\n  "app_id": string | null, // App-ID\n  "icon": string | null, // Icon\n  "parameter_identifizierer": string | null, // Parameter-Identifizierer\n  "target": string | null, // Target\n  "breite_tablet": number | null, // Breite (Tablet)\n  "hoehe_widescreen": number | null, // Höhe (Widescreen)\n  "hoehe_fullhd": number | null, // Höhe (FullHD)\n  "text_farbe_hell": string | null, // Text-Farbe hell\n  "uebergeordnetes_panel": string | null, // Display name from Yoga Kurs Management (see <available-records>)\n  "dummy": string | null, // Dummy\n  "beschriftung": string | null, // Beschriftung\n  "reihenfolge": number | null, // Reihenfolge\n  "hoehe_tablet": number | null, // Höhe (Tablet)\n  "spalte_widescreen": number | null, // Spalte (Widescreen)\n  "beschreibung": string | null, // Beschreibung\n  "hoehe_desktop": number | null, // Höhe (Desktop)\n  "breite_widescreen": number | null, // Breite (Widescreen)\n  "breite_fullhd": number | null, // Breite (FullHD)\n  "hintergrund": LookupValue | null, // Hintergrund (select one key: "linearer_farbverlauf" | "bild" | "kreisfoermiger_farbverlauf" | "einfache_farbe") mapping: linearer_farbverlauf=Linearer Farbverlauf, bild=Bild, kreisfoermiger_farbverlauf=Kreisförmiger Farbverlauf, einfache_farbe=Einfache Farbe\n  "text_farbe_dunkel": string | null, // Text-Farbe dunkel\n  "hintergrund_farbe_1_dunkel": string | null, // Hintergrund-Farbe 1 dunkel\n  "hintergrund_farbe_2_dunkel": string | null, // Hintergrund-Farbe 2 dunkel\n  "css_class": string | null, // CSS-Class\n  "spalte_mobil2": number | null, // Spalte (Mobil)\n  "parameter_typ": LookupValue | null, // Parameter-Typ (select one key: "number" | "string" | "html" | "color" | "date" | "option_1" | "option_2" | "datetime" | "datedelta" | "datetimedelta" | "monthdelta" | "upload" | "control") mapping: number=number, string=string, html=html, color=color, date=date, option_1=bool, option_2=int, datetime=datetime, datedelta=datedelta, datetimedelta=datetimedelta, monthdelta=monthdelta, upload=upload, control=control\n  "parameter_ist_zuruecksetzbar": boolean | null, // Parameter ist zurücksetzbar\n  "parameter_ist_pflichtfeld": boolean | null, // Parameter ist Pflichtfeld\n  "parameter_optionen": string | null, // Parameter-Optionen\n}`;
      const raw = await extractFromPhoto<Record<string, unknown>>(uri, schema, photoContext, DIALOG_INTENT);
      setFields(prev => {
        const merged = { ...prev } as Record<string, unknown>;
        function matchName(name: string, candidates: string[]): boolean {
          const n = name.toLowerCase().trim();
          return candidates.some(c => c.toLowerCase().includes(n) || n.includes(c.toLowerCase()));
        }
        const applookupKeys = new Set<string>(["uebergeordnetes_panel"]);
        for (const [k, v] of Object.entries(raw)) {
          if (applookupKeys.has(k)) continue;
          if (v != null) merged[k] = v;
        }
        const uebergeordnetes_panelName = raw['uebergeordnetes_panel'] as string | null;
        if (uebergeordnetes_panelName) {
          const uebergeordnetes_panelMatch = yoga_kurs_managementList.find(r => matchName(uebergeordnetes_panelName!, [String(r.fields.icon ?? '')]));
          if (uebergeordnetes_panelMatch) merged['uebergeordnetes_panel'] = createRecordUrl(APP_IDS.YOGA_KURS_MANAGEMENT, uebergeordnetes_panelMatch.record_id);
        }
        return merged as Partial<YogaKursManagement['fields']>;
      });
      // Upload scanned file to file fields
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        try {
          const blob = dataUriToBlob(uri);
          const fileUrl = await uploadFile(blob, file.name);
          setFields(prev => ({ ...prev, hintergrund_bild_hell: fileUrl }));
          setFields(prev => ({ ...prev, hintergrund_bild_dunkel: fileUrl }));
        } catch (uploadErr) {
          console.error('File upload failed:', uploadErr);
        }
      }
      setScanSuccess(true);
      setTimeout(() => setScanSuccess(false), 3000);
    } catch (err) {
      console.error('Scan fehlgeschlagen:', err);
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setScanning(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handlePhotoScan(f);
    e.target.value = '';
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      handlePhotoScan(file);
    }
  }, []);

  const DIALOG_INTENT = defaultValues ? 'Yoga Kurs Management bearbeiten' : 'Yoga Kurs Management hinzufügen';

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{DIALOG_INTENT}</DialogTitle>
        </DialogHeader>

        {enablePhotoScan && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div>
              <div className="flex items-center gap-1.5 font-medium">
                <IconSparkles stroke={1.5} className="h-4 w-4 text-primary" />
                KI-Assistent
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Versteht deine Fotos / Dokumente und füllt alles für dich aus</p>
            </div>
            <div className="flex items-start gap-2 pl-0.5">
              <Checkbox
                id="ai-use-personal-info"
                checked={usePersonalInfo}
                onCheckedChange={(v) => setUsePersonalInfo(!!v)}
                className="mt-0.5"
              />
              <span className="text-xs text-muted-foreground leading-snug">
                <Label htmlFor="ai-use-personal-info" className="text-xs font-normal text-muted-foreground cursor-pointer inline">
                  KI-Assistent darf zusätzlich Informationen zu meiner Person verwenden
                </Label>
                {' '}
                <button type="button" onClick={handleShowProfileInfo} className="text-xs text-primary hover:underline whitespace-nowrap">
                  {profileLoading ? 'Lade...' : '(mehr Infos)'}
                </button>
              </span>
            </div>
            {showProfileInfo && (
              <div className="rounded-md border bg-muted/50 p-2 text-xs max-h-40 overflow-y-auto">
                <p className="font-medium mb-1">Folgende Infos über dich können von der KI genutzt werden:</p>
                {profileData ? Object.values(profileData).map((v, i) => (
                  <span key={i}>{i > 0 && ", "}{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                )) : (
                  <span className="text-muted-foreground">Profil konnte nicht geladen werden</span>
                )}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileSelect} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !scanning && fileInputRef.current?.click()}
              className={`
                relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
                ${scanning
                  ? 'border-primary/40 bg-primary/5'
                  : scanSuccess
                    ? 'border-green-500/40 bg-green-50/50 dark:bg-green-950/20'
                    : dragOver
                      ? 'border-primary bg-primary/10 scale-[1.01]'
                      : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              {scanning ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconLoader2 stroke={1.5} className="h-7 w-7 text-primary animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">KI analysiert...</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Felder werden automatisch ausgefüllt</p>
                  </div>
                </div>
              ) : scanSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <IconCircleCheck stroke={1.5} className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Felder ausgefüllt!</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Prüfe die Werte und passe sie ggf. an</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="h-14 w-14 rounded-full bg-primary/8 flex items-center justify-center">
                    <IconPhotoPlus stroke={1.5} className="h-7 w-7 text-primary/70" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Foto oder Dokument hierher ziehen oder auswählen</p>
                  </div>
                </div>
              )}

              {preview && !scanning && (
                <div className="absolute top-2 right-2">
                  <div className="relative group">
                    <img src={preview} alt="" className="h-10 w-10 rounded-md object-cover border shadow-sm" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setPreview(null); }}
                      className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-muted-foreground/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IconX stroke={1.5} className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="flex-1 h-9 text-xs" disabled={scanning}
                onClick={e => { e.stopPropagation(); cameraInputRef.current?.click(); }}>
                <IconCamera stroke={1.5} className="h-3.5 w-3.5 mr-1.5" />Kamera
              </Button>
              <Button type="button" variant="outline" size="sm" className="flex-1 h-9 text-xs" disabled={scanning}
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <IconUpload stroke={1.5} className="h-3.5 w-3.5 mr-1.5" />Foto wählen
              </Button>
              <Button type="button" variant="outline" size="sm" className="flex-1 h-9 text-xs" disabled={scanning}
                onClick={e => {
                  e.stopPropagation();
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = 'application/pdf,.pdf';
                    fileInputRef.current.click();
                    setTimeout(() => { if (fileInputRef.current) fileInputRef.current.accept = 'image/*,application/pdf'; }, 100);
                  }
                }}>
                <IconFileText stroke={1.5} className="h-3.5 w-3.5 mr-1.5" />Dokument
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={fields.title ?? ''}
              onChange={e => setFields(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={fields.url ?? ''}
              onChange={e => setFields(f => ({ ...f, url: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Input
              id="template"
              value={fields.template ?? ''}
              onChange={e => setFields(f => ({ ...f, template: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breite_mobil2">Breite (Mobil)</Label>
            <Input
              id="breite_mobil2"
              type="number"
              value={fields.breite_mobil2 ?? ''}
              onChange={e => setFields(f => ({ ...f, breite_mobil2: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoehe_mobil2">Höhe (Mobil)</Label>
            <Input
              id="hoehe_mobil2"
              type="number"
              value={fields.hoehe_mobil2 ?? ''}
              onChange={e => setFields(f => ({ ...f, hoehe_mobil2: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spalte_tablet">Spalte (Tablet)</Label>
            <Input
              id="spalte_tablet"
              type="number"
              value={fields.spalte_tablet ?? ''}
              onChange={e => setFields(f => ({ ...f, spalte_tablet: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breite_tablet2">Breite (Desktop)</Label>
            <Input
              id="breite_tablet2"
              type="number"
              value={fields.breite_tablet2 ?? ''}
              onChange={e => setFields(f => ({ ...f, breite_tablet2: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spalte_desktop">Spalte (Desktop)</Label>
            <Input
              id="spalte_desktop"
              type="number"
              value={fields.spalte_desktop ?? ''}
              onChange={e => setFields(f => ({ ...f, spalte_desktop: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spalte_fullhd">Spalte (FullHD)</Label>
            <Input
              id="spalte_fullhd"
              type="number"
              value={fields.spalte_fullhd ?? ''}
              onChange={e => setFields(f => ({ ...f, spalte_fullhd: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="darstellung">Darstellung</Label>
            <Select
              value={lookupKey(fields.darstellung) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, darstellung: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="darstellung"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="titel">Titel</SelectItem>
                <SelectItem value="karte">Karte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hintergrund_farbe_2_hell">Hintergrund-Farbe 2 hell</Label>
            <Input
              id="hintergrund_farbe_2_hell"
              value={fields.hintergrund_farbe_2_hell ?? ''}
              onChange={e => setFields(f => ({ ...f, hintergrund_farbe_2_hell: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kategorie">Kategorie</Label>
            <Input
              id="kategorie"
              value={fields.kategorie ?? ''}
              onChange={e => setFields(f => ({ ...f, kategorie: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hintergrund_farbe_1_hell">Hintergrund-Farbe 1 hell</Label>
            <Input
              id="hintergrund_farbe_1_hell"
              value={fields.hintergrund_farbe_1_hell ?? ''}
              onChange={e => setFields(f => ({ ...f, hintergrund_farbe_1_hell: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hintergrund_bild_hell">Hintergrund-Bild hell</Label>
            {fields.hintergrund_bild_hell ? (
              <div className="flex items-center gap-3 rounded-lg border p-2">
                <div className="relative h-14 w-14 shrink-0 rounded-md bg-muted overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconFileText size={20} stroke={1.5} className="text-muted-foreground" />
                  </div>
                  <img
                    src={fields.hintergrund_bild_hell}
                    alt=""
                    className="relative h-full w-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-foreground">{fields.hintergrund_bild_hell.split("/").pop()}</p>
                  <div className="flex gap-2 mt-1">
                    <label
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Ändern
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const fileUrl = await uploadFile(file, file.name);
                            setFields(f => ({ ...f, hintergrund_bild_hell: fileUrl }));
                          } catch (err) { console.error('Upload failed:', err); }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => setFields(f => ({ ...f, hintergrund_bild_hell: undefined }))}
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <IconUpload size={20} stroke={1.5} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Datei hochladen</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const fileUrl = await uploadFile(file, file.name);
                      setFields(f => ({ ...f, hintergrund_bild_hell: fileUrl }));
                    } catch (err) { console.error('Upload failed:', err); }
                  }}
                />
              </label>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="app_id">App-ID</Label>
            <Input
              id="app_id"
              value={fields.app_id ?? ''}
              onChange={e => setFields(f => ({ ...f, app_id: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              value={fields.icon ?? ''}
              onChange={e => setFields(f => ({ ...f, icon: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parameter_identifizierer">Parameter-Identifizierer</Label>
            <Input
              id="parameter_identifizierer"
              value={fields.parameter_identifizierer ?? ''}
              onChange={e => setFields(f => ({ ...f, parameter_identifizierer: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Target</Label>
            <Input
              id="target"
              value={fields.target ?? ''}
              onChange={e => setFields(f => ({ ...f, target: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breite_tablet">Breite (Tablet)</Label>
            <Input
              id="breite_tablet"
              type="number"
              value={fields.breite_tablet ?? ''}
              onChange={e => setFields(f => ({ ...f, breite_tablet: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoehe_widescreen">Höhe (Widescreen)</Label>
            <Input
              id="hoehe_widescreen"
              type="number"
              value={fields.hoehe_widescreen ?? ''}
              onChange={e => setFields(f => ({ ...f, hoehe_widescreen: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoehe_fullhd">Höhe (FullHD)</Label>
            <Input
              id="hoehe_fullhd"
              type="number"
              value={fields.hoehe_fullhd ?? ''}
              onChange={e => setFields(f => ({ ...f, hoehe_fullhd: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="text_farbe_hell">Text-Farbe hell</Label>
            <Input
              id="text_farbe_hell"
              value={fields.text_farbe_hell ?? ''}
              onChange={e => setFields(f => ({ ...f, text_farbe_hell: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hintergrund_bild_dunkel">Hintergrund-Bild dunkel</Label>
            {fields.hintergrund_bild_dunkel ? (
              <div className="flex items-center gap-3 rounded-lg border p-2">
                <div className="relative h-14 w-14 shrink-0 rounded-md bg-muted overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconFileText size={20} stroke={1.5} className="text-muted-foreground" />
                  </div>
                  <img
                    src={fields.hintergrund_bild_dunkel}
                    alt=""
                    className="relative h-full w-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-foreground">{fields.hintergrund_bild_dunkel.split("/").pop()}</p>
                  <div className="flex gap-2 mt-1">
                    <label
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Ändern
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const fileUrl = await uploadFile(file, file.name);
                            setFields(f => ({ ...f, hintergrund_bild_dunkel: fileUrl }));
                          } catch (err) { console.error('Upload failed:', err); }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => setFields(f => ({ ...f, hintergrund_bild_dunkel: undefined }))}
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <IconUpload size={20} stroke={1.5} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Datei hochladen</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const fileUrl = await uploadFile(file, file.name);
                      setFields(f => ({ ...f, hintergrund_bild_dunkel: fileUrl }));
                    } catch (err) { console.error('Upload failed:', err); }
                  }}
                />
              </label>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="uebergeordnetes_panel">Übergeordnetes Panel</Label>
            <Select
              value={extractRecordId(fields.uebergeordnetes_panel) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, uebergeordnetes_panel: v === 'none' ? undefined : createRecordUrl(APP_IDS.YOGA_KURS_MANAGEMENT, v) }))}
            >
              <SelectTrigger id="uebergeordnetes_panel"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {yoga_kurs_managementList.map(r => (
                  <SelectItem key={r.record_id} value={r.record_id}>
                    {r.fields.icon ?? r.record_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dummy">Dummy</Label>
            <Input
              id="dummy"
              value={fields.dummy ?? ''}
              onChange={e => setFields(f => ({ ...f, dummy: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beschriftung">Beschriftung</Label>
            <Input
              id="beschriftung"
              value={fields.beschriftung ?? ''}
              onChange={e => setFields(f => ({ ...f, beschriftung: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reihenfolge">Reihenfolge</Label>
            <Input
              id="reihenfolge"
              type="number"
              value={fields.reihenfolge ?? ''}
              onChange={e => setFields(f => ({ ...f, reihenfolge: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoehe_tablet">Höhe (Tablet)</Label>
            <Input
              id="hoehe_tablet"
              type="number"
              value={fields.hoehe_tablet ?? ''}
              onChange={e => setFields(f => ({ ...f, hoehe_tablet: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spalte_widescreen">Spalte (Widescreen)</Label>
            <Input
              id="spalte_widescreen"
              type="number"
              value={fields.spalte_widescreen ?? ''}
              onChange={e => setFields(f => ({ ...f, spalte_widescreen: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Textarea
              id="beschreibung"
              value={fields.beschreibung ?? ''}
              onChange={e => setFields(f => ({ ...f, beschreibung: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoehe_desktop">Höhe (Desktop)</Label>
            <Input
              id="hoehe_desktop"
              type="number"
              value={fields.hoehe_desktop ?? ''}
              onChange={e => setFields(f => ({ ...f, hoehe_desktop: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breite_widescreen">Breite (Widescreen)</Label>
            <Input
              id="breite_widescreen"
              type="number"
              value={fields.breite_widescreen ?? ''}
              onChange={e => setFields(f => ({ ...f, breite_widescreen: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breite_fullhd">Breite (FullHD)</Label>
            <Input
              id="breite_fullhd"
              type="number"
              value={fields.breite_fullhd ?? ''}
              onChange={e => setFields(f => ({ ...f, breite_fullhd: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hintergrund">Hintergrund</Label>
            <Select
              value={lookupKey(fields.hintergrund) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, hintergrund: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="hintergrund"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="linearer_farbverlauf">Linearer Farbverlauf</SelectItem>
                <SelectItem value="bild">Bild</SelectItem>
                <SelectItem value="kreisfoermiger_farbverlauf">Kreisförmiger Farbverlauf</SelectItem>
                <SelectItem value="einfache_farbe">Einfache Farbe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="text_farbe_dunkel">Text-Farbe dunkel</Label>
            <Input
              id="text_farbe_dunkel"
              value={fields.text_farbe_dunkel ?? ''}
              onChange={e => setFields(f => ({ ...f, text_farbe_dunkel: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hintergrund_farbe_1_dunkel">Hintergrund-Farbe 1 dunkel</Label>
            <Input
              id="hintergrund_farbe_1_dunkel"
              value={fields.hintergrund_farbe_1_dunkel ?? ''}
              onChange={e => setFields(f => ({ ...f, hintergrund_farbe_1_dunkel: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hintergrund_farbe_2_dunkel">Hintergrund-Farbe 2 dunkel</Label>
            <Input
              id="hintergrund_farbe_2_dunkel"
              value={fields.hintergrund_farbe_2_dunkel ?? ''}
              onChange={e => setFields(f => ({ ...f, hintergrund_farbe_2_dunkel: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="css_class">CSS-Class</Label>
            <Input
              id="css_class"
              value={fields.css_class ?? ''}
              onChange={e => setFields(f => ({ ...f, css_class: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spalte_mobil2">Spalte (Mobil)</Label>
            <Input
              id="spalte_mobil2"
              type="number"
              value={fields.spalte_mobil2 ?? ''}
              onChange={e => setFields(f => ({ ...f, spalte_mobil2: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parameter_typ">Parameter-Typ</Label>
            <Select
              value={lookupKey(fields.parameter_typ) ?? 'none'}
              onValueChange={v => setFields(f => ({ ...f, parameter_typ: v === 'none' ? undefined : v as any }))}
            >
              <SelectTrigger id="parameter_typ"><SelectValue placeholder="Auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="number">number</SelectItem>
                <SelectItem value="string">string</SelectItem>
                <SelectItem value="html">html</SelectItem>
                <SelectItem value="color">color</SelectItem>
                <SelectItem value="date">date</SelectItem>
                <SelectItem value="option_1">bool</SelectItem>
                <SelectItem value="option_2">int</SelectItem>
                <SelectItem value="datetime">datetime</SelectItem>
                <SelectItem value="datedelta">datedelta</SelectItem>
                <SelectItem value="datetimedelta">datetimedelta</SelectItem>
                <SelectItem value="monthdelta">monthdelta</SelectItem>
                <SelectItem value="upload">upload</SelectItem>
                <SelectItem value="control">control</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="parameter_ist_zuruecksetzbar">Parameter ist zurücksetzbar</Label>
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="parameter_ist_zuruecksetzbar"
                checked={!!fields.parameter_ist_zuruecksetzbar}
                onCheckedChange={(v) => setFields(f => ({ ...f, parameter_ist_zuruecksetzbar: !!v }))}
              />
              <Label htmlFor="parameter_ist_zuruecksetzbar" className="font-normal">Parameter ist zurücksetzbar</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="parameter_ist_pflichtfeld">Parameter ist Pflichtfeld</Label>
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="parameter_ist_pflichtfeld"
                checked={!!fields.parameter_ist_pflichtfeld}
                onCheckedChange={(v) => setFields(f => ({ ...f, parameter_ist_pflichtfeld: !!v }))}
              />
              <Label htmlFor="parameter_ist_pflichtfeld" className="font-normal">Parameter ist Pflichtfeld</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="parameter_optionen">Parameter-Optionen</Label>
            <Textarea
              id="parameter_optionen"
              value={fields.parameter_optionen ?? ''}
              onChange={e => setFields(f => ({ ...f, parameter_optionen: e.target.value }))}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Speichern...' : defaultValues ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}