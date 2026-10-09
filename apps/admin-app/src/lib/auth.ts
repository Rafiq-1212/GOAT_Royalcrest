import bcrypt from "bcryptjs";
import crypto from "crypto";

export const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "adminassets@gmail.com").trim().toLowerCase();

// Pre-generated bcrypt hash with salt rounds = 10 for "goatassetsdubai"
const DEFAULT_HASH = bcrypt.hashSync("goatassetsdubai", 10);

export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;

export const SESSION_COOKIE_NAME = "goat_admin_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "goatassets-dubai-security-secret-2026";

/**
 * Verifies username and bcrypt-hashed password
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (!username || !password) return false;
  
  const cleanUser = username.trim().toLowerCase();
  if (cleanUser !== ADMIN_USERNAME) {
    return false;
  }

  try {
    return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  } catch (err) {
    console.error("Bcrypt comparison error:", err);
    return false;
  }
}

/**
 * Creates an HMAC-SHA256 signed session token
 */
export function createSessionToken(username: string): string {
  const payload = JSON.stringify({
    user: username.trim().toLowerCase(),
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  const b64Payload = Buffer.from(payload).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(b64Payload).digest("hex");
  return `${b64Payload}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed session token
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !token.includes(".")) return false;

  const [b64Payload, signature] = token.split(".");
  if (!b64Payload || !signature) return false;

  try {
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(b64Payload).digest("hex");
    if (signature !== expectedSig) return false;

    const payloadStr = Buffer.from(b64Payload, "base64url").toString("utf-8");
    const data = JSON.parse(payloadStr);

    if (!data.exp || Date.now() > data.exp) return false;
    if (data.user !== ADMIN_USERNAME) return false;

    return true;
  } catch {
    return false;
  }
}
