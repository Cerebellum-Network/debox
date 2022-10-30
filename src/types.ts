export type InferPromiseType<P> = P extends Promise<infer R> ? R : unknown;

export type InferArrayType<P> = P extends Array<infer R> ? R : unknown;
