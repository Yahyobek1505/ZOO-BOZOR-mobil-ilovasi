export const digitsOnly = (value: string) => value.replace(/[^0-9]/g, '');

export function decimalOnly(value: string) {
  const clean = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const [whole, ...fraction] = clean.split('.');
  return fraction.length ? `${whole}.${fraction.join('')}` : whole;
}

export function formatBirthInput(value: string) {
  const digits = digitsOnly(value).slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('.');
}

/** Accept an Uzbek local number or the full country-prefixed number. */
export function normalizePhone(value: string): string | null {
  const digits = digitsOnly(value);
  if (/^[0-9]{9}$/.test(digits)) return `998${digits}`;
  if (/^998[0-9]{9}$/.test(digits)) return digits;
  return null;
}

export const phoneHref = (value: string) => {
  const number = normalizePhone(value);
  return number ? `tel:+${number}` : null;
};

export function displayPhone(value: string) {
  const number = normalizePhone(value);
  return number ? `+${number.slice(0, 3)} ${number.slice(3, 5)} ${number.slice(5, 8)} ${number.slice(8, 10)} ${number.slice(10)}` : '';
}

export function validBirthDate(value: string) {
  const match = /^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/.exec(value);
  if (!match) return false;
  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return year >= 1900 && date <= new Date()
    && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
