const DEFAULT_TEMPLATE = (name: string) => `Hi ${name},

Thank you for showing interest in ManageYourPG! 😊

ManageYourPG is an all-in-one software designed to simplify PG, hostel, and rental property management.

With our platform, you can:
✅ 15 Days Free trial
✅ Manage tenants digitally
✅ Track rent payments & due reminders
✅ Manage rooms, beds & occupancy
✅ Handle bookings and check-ins/check-outs
✅ Record expenses and income
✅ Manage staff and maintenance requests
✅ Generate reports and analytics
✅ Send rent reminders via WhatsApp/SMS
✅ Access your PG anytime from mobile or web
✅ Free Listing in Getyourstay.in

Whether you manage one PG or multiple properties, ManageYourPG helps save time, reduce paperwork, and increase occupancy.

We'd love to give you a FREE live demo.

👉 Sign up here: https://sales.manageyourpg.com/pgownersignup

Or simply reply to this message with a convenient time, and we'll schedule a quick 15-minute demo.

Looking forward to helping you grow your business!

ManageYourPG Team`;

/**
 * Normalise a phone number to digits only.
 * Keeps the leading + if present, strips spaces, dashes, parens.
 * Indian mobile numbers (10 digits) get prefixed with 91 by default.
 */
export const normalisePhone = (raw: string, defaultCountryCode = '91'): string => {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  if (hasPlus) return `+${digits}`;
  // 10-digit Indian mobile -> prefix 91
  if (digits.length === 10) return `${defaultCountryCode}${digits}`;
  // 11-digit with leading 0 (some formats) -> strip 0, prefix 91
  if (digits.length === 11 && digits.startsWith('0')) return `${defaultCountryCode}${digits.slice(1)}`;
  // already has country code (e.g. 91xxxxxxxxxx or other)
  return digits;
};

export const buildWhatsAppLink = (
  phone: string,
  message: string,
  defaultCountryCode = '91'
): string => {
  const number = normalisePhone(phone, defaultCountryCode).replace(/^\+/, '');
  if (!number) return '';
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

export const enquiryWhatsAppTemplate = (ownerName: string): string =>
  DEFAULT_TEMPLATE(ownerName || 'there');

export const openWhatsApp = (phone: string, message: string): void => {
  const url = buildWhatsAppLink(phone, message);
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
};
