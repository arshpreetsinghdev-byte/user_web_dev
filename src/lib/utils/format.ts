import { CURRENCY, DATE_FORMATS } from './constants';
import { useOperatorParamsStore } from '@/lib/operatorParamsStore';

/**
 * Format currency value
 */
const operatorCurrency = useOperatorParamsStore(state => state.data.user_web_config?.currency || state.data.user_web_config?.currency_symbol);
export function formatCurrency(amount: number, currency = CURRENCY.SYMBOL): string {
  return `${currency}${amount.toFixed(2)}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string, format: string = DATE_FORMATS.DISPLAY): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Simple date formatting (you can use date-fns or dayjs for more advanced formatting)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return d.toLocaleDateString('en-US', options);
}

/**
 * Format time to readable string
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return d.toLocaleTimeString('en-US', options);
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
}

/**
 * Format distance in km/miles
 */
export function formatDistance(meters: number, unit: 'km' | 'mi' = 'km'): string {
  if (unit === 'km') {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  } else {
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
  }
}

/**
 * Format duration in minutes
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
