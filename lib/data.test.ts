import { describe, it, expect } from 'vitest';
import { pipelineHealth, fleetHealth, totalRecords, formatPipeline } from './data';
describe('data', () => {
  it('pipelineHealth success with 0 errors = 100', () => {
    const p = { id: '1', name: 'etl', source: 'api', destination: 'db', status: 'success', recordsProcessed: 1000, errorCount: 0 };
    expect(pipelineHealth(p)).toBe(100);
  });
  it('pipelineHealth failed = 0', () => {
    const p = { id: '2', name: 'etl', source: 'api', destination: 'db', status: 'failed', recordsProcessed: 500, errorCount: 5 };
    expect(pipelineHealth(p)).toBe(0);
  });
  it('pipelineHealth paused = 25', () => {
    const p = { id: '3', name: 'etl', source: 'api', destination: 'db', status: 'paused', recordsProcessed: 0, errorCount: 0 };
    expect(pipelineHealth(p)).toBe(25);
  });
  it('fleetHealth averages correctly', () => {
    const pipelines = [
      { id: '1', name: 'p1', source: 'api', destination: 'db', status: 'success', recordsProcessed: 100, errorCount: 0 },
      { id: '2', name: 'p2', source: 'file', destination: 'db', status: 'failed', recordsProcessed: 50, errorCount: 3 }
    ];
    expect(fleetHealth(pipelines)).toBe(50);
  });
  it('totalRecords sums correctly', () => {
    const pipelines = [
      { id: '1', name: 'p1', source: 'api', destination: 'db', status: 'success', recordsProcessed: 1000, errorCount: 0 },
      { id: '2', name: 'p2', source: 'file', destination: 'db', status: 'success', recordsProcessed: 500, errorCount: 0 }
    ];
    expect(totalRecords(pipelines)).toBe(1500);
  });
  it('formats correctly', () => {
    const p = { id: '1', name: 'user-sync', source: 'api', destination: 'warehouse', status: 'success', recordsProcessed: 5000, errorCount: 2 };
    expect(formatPipeline(p)).toBe('user-sync [api→warehouse] success records:5000 errors:2');
  });
});