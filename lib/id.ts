import { createId } from '@paralleldrive/cuid2';

/**
 * Generate a CUID (Collision-resistant Unique Identifier)
 * Compatible with Prisma's cuid() default
 */
export function generateId(): string {
  return createId();
}

