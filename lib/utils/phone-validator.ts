/**
 * Phone number validation utilities for Israeli phone numbers
 */

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string; // Normalized format: 05XXXXXXXX
}

/**
 * Validates and normalizes Israeli phone numbers
 * Accepts formats:
 * - 050-1234567
 * - 0501234567
 * - 050 1234567
 * - +972-50-1234567
 * - 972-50-1234567
 * - +972501234567
 * 
 * @param phone - The phone number to validate
 * @returns PhoneValidationResult object with validation status and normalized number
 */
export function validateIsraeliPhone(phone: string): PhoneValidationResult {
  if (!phone || !phone.trim()) {
    return {
      isValid: false,
      error: "מספר טלפון חסר",
    };
  }

  // Remove all spaces and hyphens for processing
  const cleanPhone = phone.replace(/[-\s]/g, "");

  // Pattern 1: Israeli format starting with 0 (e.g., 0501234567)
  const israeliPattern = /^0(5[0-9]|7[0-9])\d{7}$/;
  
  // Pattern 2: International format with +972 or 972 (e.g., +972501234567)
  const internationalPattern = /^(\+?972)(5[0-9]|7[0-9])\d{7}$/;

  let normalized: string | undefined;

  if (israeliPattern.test(cleanPhone)) {
    // Already in correct format: 05XXXXXXXX or 07XXXXXXXX
    normalized = cleanPhone;
  } else {
    const internationalMatch = cleanPhone.match(internationalPattern);
    if (internationalMatch) {
      // Convert international format to Israeli format: 972501234567 -> 0501234567
      normalized = '0' + cleanPhone.substring(cleanPhone.indexOf(internationalMatch[2]));
    }
  }

  if (!normalized) {
    return {
      isValid: false,
      error: "מספר טלפון לא תקין. פורמט נכון: 050-1234567 או +972-50-1234567",
    };
  }

  // Additional validation: Check if it's a valid Israeli mobile prefix
  const prefix = normalized.substring(1, 3);
  const validPrefixes = ['50', '51', '52', '53', '54', '55', '58', '72', '73', '74', '76', '77', '78', '79'];
  
  if (!validPrefixes.includes(prefix)) {
    return {
      isValid: false,
      error: "קידומת טלפון לא תקינה. יש להזין מספר סלולרי ישראלי",
    };
  }

  return {
    isValid: true,
    normalized,
  };
}

/**
 * Formats a phone number for display
 * @param phone - The phone number to format (in normalized format: 05XXXXXXXX)
 * @returns Formatted phone number: 050-1234567
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/[-\s]/g, "");
  
  // Format as: 0XX-XXXXXXX
  if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
    return `${cleanPhone.substring(0, 3)}-${cleanPhone.substring(3)}`;
  }
  
  return phone;
}
