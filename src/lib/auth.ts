import crypto from "crypto";

/**
 * Password hashing utilities.
 *
 * New hashes use scrypt with a per-password random salt, stored as:
 *   scrypt:<saltHex>:<keyHex>
 *
 * Legacy SHA-256 hashes (from the original prototype) are still accepted so
 * existing accounts keep working; callers should re-hash on successful login
 * (see `needsRehash`).
 */

const SCRYPT_PREFIX = "scrypt";
const KEY_LENGTH = 64;

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function legacyHash(password: string): string {
  return crypto.createHash("sha256").update(password + "_arena_salt_2025").digest("hex");
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${SCRYPT_PREFIX}:${salt}:${key}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;

  if (stored.startsWith(`${SCRYPT_PREFIX}:`)) {
    const [, salt, key] = stored.split(":");
    if (!salt || !key) return false;
    const derived = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
    return safeEqual(derived, key);
  }

  // Legacy prototype hash.
  return safeEqual(legacyHash(password), stored);
}

/** True when the stored hash uses an outdated algorithm and should be upgraded. */
export function needsRehash(stored: string): boolean {
  return !stored.startsWith(`${SCRYPT_PREFIX}:`);
}
