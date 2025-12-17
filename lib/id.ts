import { createId } from '@paralleldrive/cuid2';

/**
 * Generate a CUID (Collision-resistant Unique Identifier)
 * Used for generating unique IDs for database records
 */
export function generateId(): string {
  return createId();
}

