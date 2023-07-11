export function isRecord(val: unknown): val is Record<string | number | symbol, unknown> {
  return val != null && typeof val === 'object';
}
