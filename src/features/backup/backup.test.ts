import { freshState, SCHEMA_VERSION } from '@/state/schema';

import { makeBackup, readBackup } from './backup';

jest.mock('expo-sharing', () => ({}));
jest.mock('expo-document-picker', () => ({}));
jest.mock('expo-file-system', () => ({ File: class {}, Paths: {} }));
jest.mock('@/state/app-store', () => ({ snapshot: jest.fn(), useAppStore: { getState: jest.fn() } }));

describe('backup', () => {
  it('round-trips', () => {
    const data = freshState(0);
    data.pet.name = 'Mochi';
    const r = readBackup(JSON.parse(JSON.stringify(makeBackup(data, 1))));
    expect(r.ok && r.data.pet.name).toBe('Mochi');
  });
  it('rejects junk and newer versions', () => {
    expect(readBackup(null).ok).toBe(false);
    expect(readBackup({ hello: 1 }).ok).toBe(false);
    expect(readBackup({ version: SCHEMA_VERSION + 1, data: {} }).ok).toBe(false);
  });
});
