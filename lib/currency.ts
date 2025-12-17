/**
 * Format a number as Ghanaian Cedi (GHS) currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₵100.00")
 */
export function formatCurrency(amount: number): string {
  return `₵${amount.toFixed(2)}`;
}

/**
 * Currency symbol for Ghana Cedis
 */
export const CURRENCY_SYMBOL = "₵";

/**
 * Currency code
 */
export const CURRENCY_CODE = "GHS";

