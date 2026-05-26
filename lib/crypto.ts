import crypto from "crypto";

// 32-byte encryption key (256 bits) from environment or robust local fallback
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p";
const IV_LENGTH = 16; // AES block size in bytes

/**
 * Encrypts a plaintext string to a hexadecimal ciphertext prefixed with its initialization vector (IV)
 */
export function encryptData(text: string | null | undefined): string | null {
  if (!text) return null;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (err) {
    console.error("Encryption failed:", err);
    return null;
  }
}

/**
 * Decrypts a hex ciphertext back to plaintext. Returns the original string if it is not ciphertext (fallback).
 */
export function decryptData(text: string | null | undefined): string | null {
  if (!text) return null;
  
  try {
    if (!text.includes(":")) {
      // If it doesn't contain the IV divider, it is likely already plaintext
      return text;
    }
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    // Graceful fallback for unencrypted legacy database text
    return text;
  }
}
