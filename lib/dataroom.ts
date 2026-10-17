export interface Dataset { id: string; name: string; owner: string; lineage: string[]; status: 'active' | 'deprecated' | 'draft' }
export function validateDataset(d: Partial<Dataset>): boolean { return !!d.name && !!d.owner && d.name.length >= 2; }
export function lineageDepth(d: Dataset, all: Dataset[]): number {
  if (d.lineage.length === 0) return 0;
  const upstreams = d.lineage.map(id => all.find(x => x.id === id)).filter(Boolean) as Dataset[];
  return 1 + Math.max(...upstreams.map(u => lineageDepth(u, all)));
}