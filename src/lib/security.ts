/**
 * Comprehensive Security & Sanitization Utilities
 * Defends against XSS, open redirects, bot submissions, and malformed inputs.
 */

// Strictest URL protocol validator — prevents javascript:, data:, vbscript: exploits
export function safeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
    return '#';
  }
  // Disallow protocol-relative URLs like "//attacker.com"
  if (trimmed.startsWith('//')) {
    return '#';
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    // If it's a relative path starting with a single '/'
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
  }
  return '#';
}

// Escapes special HTML characters if ever used in raw contexts
export function escapeHtml(str: string | null | undefined): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Strict email validator
export function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

// Phone validator: 7 to 20 digits, allows optional +, space, parenthesis or hyphens
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  return phoneRegex.test(cleaned);
}

// USN (University Seat Number) validator: 2 to 30 alphanumeric characters
export function validateUSN(usn: string): boolean {
  if (!usn) return false;
  const trimmed = usn.trim();
  if (trimmed.length < 2 || trimmed.length > 30) return false;
  // Allows letters, digits, and standard hyphens/underscores
  return /^[a-zA-Z0-9\-_]{2,30}$/.test(trimmed);
}

// Name validator: 2 to 100 characters, no code tags
export function validateName(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  return !/[<>{}[\]\\]/.test(trimmed);
}

// UTR / Transaction ID validator
export function validateUTR(utr: string): boolean {
  if (!utr) return false;
  const trimmed = utr.trim();
  if (trimmed.length < 5 || trimmed.length > 50) return false;
  return /^[a-zA-Z0-9\-_\s]{5,50}$/.test(trimmed);
}

// Anti-bot check: human users need at least 1200ms to fill a form
export function isHumanSubmissionSpeed(formLoadTime: number, minMs = 1200): boolean {
  const elapsed = Date.now() - formLoadTime;
  return elapsed >= minMs;
}

// Client-side rate-limiting helper
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function checkClientRateLimit(key: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.expiresAt) {
    rateLimitMap.set(key, { count: 1, expiresAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) {
    return false;
  }
  entry.count += 1;
  return true;
}
