import { describe, it, expect } from 'vitest';
import { validateDataset, lineageDepth } from './dataroom';
describe('dataroom', () => {
  it('validates good dataset', () => { expect(validateDataset({ name: 'users', owner: 'team' })).toBe(true); });
  it('rejects empty name', () => { expect(validateDataset({ name: '', owner: 'team' })).toBe(false); });
  it('rejects short name', () => { expect(validateDataset({ name: 'x', owner: 'team' })).toBe(false); });
  it('depth 0 for no lineage', () => { expect(lineageDepth({ id: '1', name: 'a', owner: 'o', lineage: [], status: 'active' }, [])).toBe(0); });
  it('depth 1 for one upstream', () => {
    const all = [{ id: '1', name: 'a', owner: 'o', lineage: ['2'], status: 'active' }, { id: '2', name: 'b', owner: 'o', lineage: [], status: 'active' }];
    expect(lineageDepth(all[0], all)).toBe(1);
  });
});