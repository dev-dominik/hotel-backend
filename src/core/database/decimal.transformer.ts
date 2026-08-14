import type { ValueTransformer } from 'typeorm';

/**
 * Postgres `numeric`/`decimal` columns come back from `pg` as strings (to
 * avoid silent float precision loss), not JS numbers — even though TypeORM
 * happily types the column as `number`. Apply to every decimal column so
 * API responses actually match their declared type instead of crashing
 * `.toFixed()`-style calls on the client.
 */
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseFloat(value),
};
