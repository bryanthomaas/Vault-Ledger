/**
 * Monetary calculations and formatting utilities.
 * All monetary amounts in Vault Ledger are represented as integer cents
 * to eliminate IEEE 754 floating point inaccuracies.
 */

export type Cents = number; // safe up to Number.MAX_SAFE_INTEGER cents (~$90 trillion)

/**
 * Parses user or decimal input (e.g. 12.34 or "12.34" or "$12.34" or "-$5.25") into integer cents.
 */
export function toCents(amount: number | string): Cents {
  if (typeof amount === 'number') {
    if (!Number.isFinite(amount)) {
      throw new TypeError(`Invalid amount: ${amount}`);
    }
    return Math.round(amount * 100);
  }

  const raw = amount.trim();
  if (!raw) {
    throw new TypeError(`Cannot parse empty monetary string: "${amount}"`);
  }

  const isNegative = raw.startsWith('-') || raw.startsWith('(');
  const clean = raw.replace(/[$,()\-]/g, '').trim();

  if (!clean || isNaN(Number(clean))) {
    throw new TypeError(`Cannot parse invalid monetary string: "${amount}"`);
  }

  const parts = clean.split('.');
  const whole = parseInt(parts[0] || '0', 10);
  const sign = isNegative ? -1 : 1;

  let fraction = 0;
  if (parts.length > 1 && parts[1]) {
    const fracStr = (parts[1] + '00').slice(0, 2);
    fraction = parseInt(fracStr, 10);
  }

  return sign * (whole * 100 + fraction);
}

/**
 * Converts integer cents to a standard decimal float (for rendering or charting).
 */
export function fromCents(cents: Cents): number {
  return Number((cents / 100).toFixed(2));
}

/**
 * Formats integer cents into a localized USD currency string.
 * e.g. 14250000 -> "$142,500.00"
 */
export function formatCurrency(
  cents: Cents,
  options: { showSign?: boolean; currency?: string } = {},
): string {
  const { showSign = false, currency = 'USD' } = options;
  const absValue = Math.abs(cents) / 100;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absValue);

  if (cents < 0) {
    return `-${formatted}`;
  }
  if (showSign && cents > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

/**
 * Calculates spare change round-up amount in cents to the nearest dollar.
 * For example, a purchase of $3.25 (325 cents) yields 75 cents round-up.
 * Purchases that are already whole dollars (e.g. $4.00 / 400 cents) yield 0.
 * Zero or negative inputs (income/refunds) yield 0 cents.
 */
export function calculateRoundUp(amountCents: Cents): Cents {
  const positiveExpenseCents = Math.abs(amountCents);
  if (positiveExpenseCents <= 0) return 0;

  const remainder = positiveExpenseCents % 100;
  if (remainder === 0) return 0;
  return 100 - remainder;
}

/**
 * Verifies the fundamental invariant of double-entry bookkeeping:
 * The sum of all postings in an entry must equal 0.
 */
export function verifyDoubleEntryBalance(postings: Array<{ amountCents: Cents | bigint }>): boolean {
  if (postings.length < 2) return false;
  const sum = postings.reduce((acc, p) => acc + BigInt(p.amountCents), 0n);
  return sum === 0n;
}
