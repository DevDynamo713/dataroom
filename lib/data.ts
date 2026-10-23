export type PipelineStatus = 'idle' | 'running' | 'success' | 'failed' | 'paused';
export type DataSource = 'api' | 'database' | 'file' | 'stream' | 'manual';
export interface Pipeline { id: string; name: string; source: DataSource; destination: string; status: PipelineStatus; recordsProcessed: number; lastRun?: string; durationSec?: number; errorCount: number }
export function pipelineHealth(p: Pipeline): number {
  if (p.status === 'failed') return 0;
  if (p.status === 'paused') return 25;
  if (p.status === 'idle') return 50;
  if (p.status === 'running') return 75;
  return Math.max(0, 100 - p.errorCount * 10);
}
export function fleetHealth(pipelines: Pipeline[]): number {
  if (pipelines.length === 0) return 100;
  return Math.round(pipelines.reduce((s, p) => s + pipelineHealth(p), 0) / pipelines.length);
}
export function totalRecords(pipelines: Pipeline[]): number {
  return pipelines.reduce((s, p) => s + p.recordsProcessed, 0);
}
export function formatPipeline(p: Pipeline): string { return `${p.name} [${p.source}→${p.destination}] ${p.status} records:${p.recordsProcessed} errors:${p.errorCount}`; }