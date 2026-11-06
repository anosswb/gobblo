import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { APP_NAME } from '@/config/app';
import { snapshot, useAppStore } from '@/state/app-store';
import { SCHEMA_VERSION, todayKey, type PersistedState } from '@/state/schema';

/** Backup format. `version` lets a newer app migrate an older file. */
export type BackupFile = { app: string; version: number; exportedAt: number; data: PersistedState };

export function makeBackup(data: PersistedState, now = Date.now()): BackupFile {
  return { app: APP_NAME.toLowerCase(), version: SCHEMA_VERSION, exportedAt: now, data };
}

/** Validates a parsed file. Returns the data or a short lowercase reason. */
export function readBackup(raw: unknown): { ok: true; data: PersistedState; version: number } | { ok: false; reason: string } {
  if (typeof raw !== 'object' || raw === null) return { ok: false, reason: 'that file isn’t a backup.' };
  const b = raw as Partial<BackupFile>;
  if (typeof b.version !== 'number' || typeof b.data !== 'object' || b.data === null)
    return { ok: false, reason: 'that file isn’t a backup.' };
  if (b.version > SCHEMA_VERSION) return { ok: false, reason: 'this backup is from a newer version. update the app first.' };
  return { ok: true, data: b.data as PersistedState, version: b.version };
}

/** Export: JSON file → share sheet (save to Files, Drive, mail…). Free on both stores. */
export async function exportBackup(): Promise<void> {
  const file = new File(Paths.cache, `${APP_NAME.toLowerCase()}-backup-${todayKey()}.json`);
  if (file.exists) file.delete();
  file.create();
  await file.write(JSON.stringify(makeBackup(snapshot())));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'save your backup', UTI: 'public.json' });
}

/** Import: pick a file, validate, migrate, replace. Returns a lowercase message for a toast. */
export async function importBackup(): Promise<{ ok: boolean; message: string }> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'public.json', '*/*'], copyToCacheDirectory: true });
  if (res.canceled || !res.assets?.[0]) return { ok: false, message: '' };
  try {
    const text = await new File(res.assets[0].uri).text();
    const parsed = readBackup(JSON.parse(text));
    if (!parsed.ok) return { ok: false, message: parsed.reason };
    useAppStore.getState().importState(parsed.data);
    return { ok: true, message: 'backup restored. welcome back ✦' };
  } catch {
    return { ok: false, message: 'couldn’t read that file.' };
  }
}
